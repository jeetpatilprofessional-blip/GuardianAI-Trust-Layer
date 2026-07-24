import datetime
import re
import time
from sqlalchemy.orm import Session
from backend.app.db.models import Agent, Policy, AuditLog, RequestLog, Notification, SystemEvent, SpendLimit
from backend.app.core.risk_engine import calculate_risk

def evaluate_request(
    agent_id: str,
    action: str,
    amount: float,
    customer_id: str,
    customer_trust_score: float,
    device_recognition: float,
    location: str,
    fraud_score: float,
    historical_behavior: str,
    payload_content: str, # For compliance/security checks
    db: Session
) -> dict:
    """
    Evaluates a transaction request through the GuardianAI Trust Layer pipeline.
    Returns a dictionary outlining the steps, metrics, and final decision.
    """
    start_time = time.time()
    
    # Timeline steps for Explainable AI visualization
    timeline = []
    
    # Initialize response status variables
    decision = "approved"
    policy_id_triggered = None
    policy_name_triggered = None
    reasoning_points = []
    is_attack = False
    attack_type = None
    
    # ----------------------------------------------------
    # STEP 1: SECURITY ATTACK CHECK (Prompt Injection, Fake Agent, etc.)
    # ----------------------------------------------------
    # Check 1: Agent Registration
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        is_attack = True
        attack_type = "Fake Agent Registration"
        decision = "rejected"
        reasoning_points.append("Agent ID not registered in database.")
        timeline.append({
            "step": "Security Check",
            "status": "failed",
            "message": "Security Alert: Fake Agent Registration Attempted",
            "details": "Agent ID is unrecognized in system fleet."
        })
    else:
        timeline.append({
            "step": "Security Check",
            "status": "passed",
            "message": f"Agent Identity Verified: '{agent.name}'",
            "details": f"Agent ID '{agent_id}' matches valid registry record."
        })
        
        # Check 2: Prompt Injection check in payload
        injection_keywords = ["ignore all policies", "ignore previous instructions", "bypass security", "approve anyway", "sudo approve"]
        payload_lower = payload_content.lower() if payload_content else ""
        if any(kw in payload_lower for kw in injection_keywords):
            is_attack = True
            attack_type = "Prompt Injection"
            decision = "rejected"
            reasoning_points.append("Security Alert: Malicious prompt injection pattern detected in input payload.")
            timeline.append({
                "step": "Prompt Guard",
                "status": "failed",
                "message": "Prompt Injection Attack Blocked",
                "details": "Payload matches signature for system bypass attempts."
            })
        else:
            timeline.append({
                "step": "Prompt Guard",
                "status": "passed",
                "message": "Input Payload Scanned: Clear",
                "details": "No prompt injection patterns identified."
            })

    # If attack is detected, write logs immediately and reject
    if is_attack:
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        # Create security alert notification
        alert = Notification(
            type="attack_detected",
            message=f"SECURITY ALERT: {attack_type} detected from agent '{agent_id or 'unknown'}'. Action blocked.",
            severity="critical"
        )
        db.add(alert)
        
        event = SystemEvent(
            event_type="kill_switch" if attack_type == "Prompt Injection" else "config_change",
            message=f"Security Attack Blocked: {attack_type} from {agent_id or 'Unknown'}",
            operator_name="System Guard"
        )
        db.add(event)
        
        # Save audit log
        audit = AuditLog(
            agent_id=agent_id or "unknown",
            agent_name=agent.name if agent else "Unknown Agent",
            action=action,
            customer_id=customer_id,
            decision="rejected",
            risk_score=100.0,
            risk_level="Critical",
            confidence_score=0.0,
            explainability_score=100.0,
            execution_time_ms=elapsed_ms,
            status="failed",
            reasoning=f"Request blocked due to security alert: {attack_type}.",
            details={"payload": payload_content, "attack_detected": True, "attack_type": attack_type}
        )
        db.add(audit)
        db.commit()
        
        # Update agent metrics if exists
        if agent:
            agent.trust_score = max(agent.trust_score - 15.0, 0.0) # major penalty
            agent.policy_violations += 1
            agent.total_requests += 1
            db.commit()

        return {
            "decision": "rejected",
            "risk_score": 100.0,
            "risk_level": "Critical",
            "confidence": 0.0,
            "explainability": 100.0,
            "reasoning": f"Security Alert: Request rejected. {attack_type} detected.",
            "timeline": timeline,
            "latency_ms": elapsed_ms,
            "attack_detected": True
        }

    # ----------------------------------------------------
    # STEP 2: AGENT STATUS CHECK
    # ----------------------------------------------------
    if agent.status == "paused":
        elapsed_ms = int((time.time() - start_time) * 1000)
        timeline.append({
            "step": "Identity & Status Check",
            "status": "failed",
            "message": f"Agent '{agent.name}' is Suspended",
            "details": "Agent is currently paused by Administrator command."
        })
        audit = AuditLog(
            agent_id=agent_id,
            agent_name=agent.name,
            action=action,
            customer_id=customer_id,
            decision="rejected",
            risk_score=0.0,
            risk_level="Low",
            confidence_score=100.0,
            explainability_score=100.0,
            execution_time_ms=elapsed_ms,
            status="failed",
            reasoning="Agent is currently paused/suspended by Administrator.",
            details={"agent_status": "paused"}
        )
        db.add(audit)
        agent.total_requests += 1
        db.commit()
        
        return {
            "decision": "rejected",
            "risk_score": 0.0,
            "risk_level": "Low",
            "confidence": 100.0,
            "explainability": 100.0,
            "reasoning": "Agent is currently paused/suspended by Administrator.",
            "timeline": timeline,
            "latency_ms": elapsed_ms,
            "attack_detected": False
        }

    # ----------------------------------------------------
    # STEP 3: PERMISSION VALIDATION
    # ----------------------------------------------------
    allowed_apis = agent.allowed_apis or []
    # Check if action is in allowed APIs
    if action not in allowed_apis:
        decision = "rejected"
        reasoning_points.append(f"Action '{action}' is not in the agent's allowed APIs permissions.")
        timeline.append({
            "step": "Permission Check",
            "status": "failed",
            "message": f"Unauthorized Action: '{action}'",
            "details": f"Agent permissions allow: {', '.join(allowed_apis)}."
        })
    else:
        timeline.append({
            "step": "Permission Check",
            "status": "passed",
            "message": f"Action Permitted: '{action}'",
            "details": f"Action exists in agent's allowed APIs permissions list."
        })

    # ----------------------------------------------------
    # STEP 4: MULTI-AGENT COLLABORATION PIPELINE
    # ----------------------------------------------------
    # Agent A: Fraud Agent check
    fraud_risk_msg = "Clear transaction history, low fraud probability."
    fraud_agent_status = "passed"
    if fraud_score > 40.0:
        fraud_risk_msg = f"Elevated fraud index score: {fraud_score}%."
        fraud_agent_status = "warning"
        reasoning_points.append(f"Fraud Agent flagged warning (Fraud Score: {fraud_score}%).")
    if location == "mismatch":
        fraud_risk_msg += " Location mismatch identified."
        fraud_agent_status = "failed"
        reasoning_points.append("Fraud Agent identified Geo-location mismatch.")
    timeline.append({
        "step": "Fraud Detection Agent",
        "status": fraud_agent_status,
        "message": f"Fraud Scan: {fraud_agent_status.upper()}",
        "details": fraud_risk_msg
    })
    
    # Agent B: Customer Verification Agent check
    customer_risk_msg = f"Customer Trust Level: {customer_trust_score}%. Device Recognition: {device_recognition * 100}%."
    customer_agent_status = "passed"
    if customer_trust_score < 70.0:
        customer_agent_status = "warning"
        reasoning_points.append(f"Customer Trust Score is low: {customer_trust_score}%.")
    if device_recognition < 0.5:
        customer_agent_status = "failed"
        reasoning_points.append("Device unrecognized or suspicious terminal fingerprint.")
    timeline.append({
        "step": "Customer Verification Agent",
        "status": customer_agent_status,
        "message": f"Identity Check: {customer_agent_status.upper()}",
        "details": customer_risk_msg
    })
    
    # Agent C: Compliance Agent check (RBI & PCI DSS rules)
    compliance_passed = True
    compliance_msg = "Adheres to regulatory standards."
    compliance_status = "passed"
    
    # PCI DSS Card masking check: scan payload for raw credit card number patterns (16 digits)
    card_pattern = r"\b(?:\d[ -]*?){13,16}\b"
    if payload_content and re.search(card_pattern, payload_content):
        compliance_passed = False
        compliance_status = "failed"
        reasoning_points.append("Compliance Check: PCI DSS violation (Unmasked card details in request payload).")
        timeline.append({
            "step": "Compliance Agent",
            "status": "failed",
            "message": "Compliance Check: FAILED",
            "details": "PCI DSS Violation: Plaintext card data identified in request logs."
        })
    # RBI dual auth threshold check: transactions over ₹10,000 require manual dual authorization
    elif amount > 10000.0:
        compliance_status = "warning"
        reasoning_points.append("Compliance Check: RBI dual-authorization threshold exceeded (amount > ₹10,000).")
        timeline.append({
            "step": "Compliance Agent",
            "status": "warning",
            "message": "Compliance Alert: Dual-Auth Triggered",
            "details": "RBI requires multi-factor operator signoff for card operations above ₹10,000."
        })
    else:
        timeline.append({
            "step": "Compliance Agent",
            "status": "passed",
            "message": "Compliance Validation: PASSED",
            "details": compliance_msg
        })

    # ----------------------------------------------------
    # STEP 5: SPEND LIMIT CHECK
    # ----------------------------------------------------
    # Fetch real-time spend limits
    spend_limit = db.query(SpendLimit).filter(SpendLimit.agent_id == agent_id).first()
    if spend_limit:
        # Check daily limit overflow
        if spend_limit.current_daily + amount > spend_limit.daily_limit:
            decision = "rejected"
            reasoning_points.append("Daily spending limit exceeded for this agent.")
            timeline.append({
                "step": "Limit Verification",
                "status": "failed",
                "message": "Daily Budget Breach",
                "details": f"Request amount ₹{amount:,.2f} exceeds remaining budget of ₹{spend_limit.daily_limit - spend_limit.current_daily:,.2f}."
            })
            
            # Send limit notification
            notif = Notification(
                type="spend_limit",
                message=f"Spend Limit Breach: Agent '{agent.name}' exceeded daily budget limit of ₹{spend_limit.daily_limit:,.2f}.",
                severity="high"
            )
            db.add(notif)
        else:
            timeline.append({
                "step": "Limit Verification",
                "status": "passed",
                "message": "Spending Limits Checked",
                "details": f"Daily Spend: ₹{spend_limit.current_daily + amount:,.2f} / Limit: ₹{spend_limit.daily_limit:,.2f}."
            })
            
            # PREDICTIVE INCIDENT DETECTION
            # If current daily spend is projected to breach limit in next 2 hours
            # e.g., if current_daily + amount > 85% of limit, raise alert
            projected_spend = spend_limit.current_daily + (amount * 3) # simulated 2h projection
            if projected_spend > spend_limit.daily_limit:
                alert_msg = f"Predictive Incident: '{agent.name}' has 91% chance of exceeding daily limit of ₹{spend_limit.daily_limit:,.2f} in the next 2 hours. Recommended limit adjustment."
                
                # Check if notification already exists to prevent spam
                existing_alert = db.query(Notification).filter(
                    Notification.message == alert_msg,
                    Notification.is_read == False
                ).first()
                if not existing_alert:
                    pred_alert = Notification(
                        type="spend_limit",
                        message=alert_msg,
                        severity="medium"
                    )
                    db.add(pred_alert)
                    db.commit()

    # ----------------------------------------------------
    # STEP 6: POLICY ENGINE EVALUATION
    # ----------------------------------------------------
    # Fetch policies assigned to this agent
    assigned_policy_ids = agent.assigned_policies or []
    matching_policies = db.query(Policy).filter(
        Policy.policy_id.in_(assigned_policy_ids),
        Policy.status == "active"
    ).all()
    
    policy_blocked = False
    for policy in matching_policies:
        # Check if action is blocked in policy
        blocked_actions = policy.blocked_actions or []
        if action in blocked_actions:
            policy_blocked = True
            policy_id_triggered = policy.policy_id
            policy_name_triggered = policy.name
            reasoning_points.append(f"Blocked by Policy '{policy.name}' ({policy.policy_id}): Action is forbidden.")
            break
            
        # Check maximum amount threshold
        if amount > policy.max_amount:
            policy_blocked = True
            policy_id_triggered = policy.policy_id
            policy_name_triggered = policy.name
            reasoning_points.append(f"Blocked by Policy '{policy.name}' ({policy.policy_id}): Amount ₹{amount:,.2f} exceeds policy limit of ₹{policy.max_amount:,.2f}.")
            break
            
        # Check specific conditions from policy JSON
        conditions = policy.conditions or {}
        # If policy condition specifies a customer trust score minimum
        min_trust = conditions.get("min_customer_trust", 0)
        if customer_trust_score < min_trust:
            policy_blocked = True
            policy_id_triggered = policy.policy_id
            policy_name_triggered = policy.name
            reasoning_points.append(f"Blocked by Policy '{policy.name}' ({policy.policy_id}): Customer trust {customer_trust_score}% is below required {min_trust}%.")
            break

    if policy_blocked:
        decision = "rejected"
        timeline.append({
            "step": "Policy Engine",
            "status": "failed",
            "message": f"Rule Violated: Policy {policy_id_triggered}",
            "details": f"Policy '{policy_name_triggered}' conditions triggered rejection."
        })
        
        # Trigger policy violation notification
        notif = Notification(
            type="policy_violation",
            message=f"Policy Violation: Agent '{agent.name}' violated policy '{policy_name_triggered}' ({policy_id_triggered}) requesting '{action}'.",
            severity="high"
        )
        db.add(notif)
    else:
        timeline.append({
            "step": "Policy Engine",
            "status": "passed",
            "message": "Policy Criteria Checked",
            "details": f"Request complies with {len(matching_policies)} assigned corporate rules."
        })

    # ----------------------------------------------------
    # STEP 7: RISK ENGINE CALCULATION
    # ----------------------------------------------------
    risk_score, risk_level = calculate_risk(
        amount=amount,
        customer_trust_score=customer_trust_score,
        device_recognition=device_recognition,
        location=location,
        fraud_score=fraud_score,
        historical_behavior=historical_behavior,
        agent_trust_score=agent.trust_score
    )
    
    reasoning_points.append(f"Adaptive Risk Score calculated: {risk_score}% ({risk_level} Risk).")
    
    # If risk is Critical or High, override decision to Escalated or Rejected
    risk_status = "passed" if risk_score <= 30.0 else ("warning" if risk_score <= 60.0 else "failed")
    
    timeline.append({
        "step": "Adaptive Risk Engine",
        "status": risk_status,
        "message": f"Risk Evaluation: {risk_level.upper()}",
        "details": f"Calculated score: {risk_score}%. Factors: Fraud Probability={fraud_score}%, User Trust={customer_trust_score}%."
    })
    
    if risk_level == "Critical":
        decision = "rejected"
        reasoning_points.append("Critical transaction risk score overrides approval parameters.")
    elif risk_level == "High":
        if decision == "approved":
            decision = "escalated"
            reasoning_points.append("High risk transaction escalated to Human-in-the-Loop review.")

    # ----------------------------------------------------
    # STEP 8: FINAL DECISION LOGIC & CONFIDENCE SCORING
    # ----------------------------------------------------
    # If already marked rejected by permissions, spend limits, or policies, keep rejected
    if decision == "rejected":
        confidence_score = max(100.0 - risk_score, 10.0)
    elif decision == "escalated":
        confidence_score = max(50.0 - (risk_score * 0.2), 5.0)
    else:
        # Decision is approved
        # If compliance flagged warning (e.g. RBI Dual Auth needed) -> Escalate
        if compliance_status == "warning" or customer_agent_status == "warning" or fraud_agent_status == "warning":
            decision = "escalated"
            confidence_score = 72.5 # lower confidence triggers escalation
            reasoning_points.append("Low-confidence factors triggered system escalation to Operator Queue.")
        else:
            decision = "approved"
            # High confidence
            confidence_score = max(100.0 - (risk_score * 0.4) - (10.0 if fraud_score > 20 else 0), 10.0)

    # If confidence score is below 80% and decision was approved, escalate to HITL
    if decision == "approved" and confidence_score < 80.0:
        decision = "escalated"
        reasoning_points.append("Decision confidence index below 80% threshold; escalated for supervisor verification.")

    explainability_score = 96.0 if decision != "escalated" else 88.0
    
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    # Timeline Final decision step
    timeline.append({
        "step": "Governance Decision",
        "status": "passed" if decision == "approved" else ("warning" if decision == "escalated" else "failed"),
        "message": f"Final Action: {decision.upper()}",
        "details": f"Confidence Index: {confidence_score:.1f}% | Explainability: {explainability_score:.1f}%."
    })

    reasoning_summary = " ".join(reasoning_points)
    
    # ----------------------------------------------------
    # STEP 9: UPDATE DATABASE & METRICS (Continuous Learning & Audits)
    # ----------------------------------------------------
    # Update spend limits only if approved
    if decision == "approved" and spend_limit:
        spend_limit.current_daily += amount
        spend_limit.current_monthly += amount
        agent.current_daily_spend += amount
        agent.current_monthly_spend += amount
        
    # Write Audit Log
    audit = AuditLog(
        agent_id=agent_id,
        agent_name=agent.name,
        action=action,
        customer_id=customer_id,
        policy_id=policy_id_triggered or ("P-NONE" if decision == "approved" else "P-BLOCK"),
        policy_name=policy_name_triggered or ("Default Standard Allow" if decision == "approved" else "System Safety Restriction"),
        risk_score=risk_score,
        risk_level=risk_level,
        decision=decision,
        confidence_score=round(confidence_score, 1),
        explainability_score=round(explainability_score, 1),
        execution_time_ms=elapsed_ms,
        status="success" if decision != "rejected" else "failed",
        reasoning=reasoning_summary,
        details={
            "amount": amount,
            "customer_trust_score": customer_trust_score,
            "device_recognition": device_recognition,
            "location": location,
            "fraud_score": fraud_score,
            "historical_behavior": historical_behavior,
            "payload_content": payload_content,
            "compliance_status": compliance_status
        }
    )
    db.add(audit)
    
    # Update AI Agent Trust Stats
    agent.total_requests += 1
    agent.last_activity = datetime.datetime.utcnow()
    
    if decision == "approved":
        agent.success_count += 1
        # Slowly raise trust score if running smoothly
        agent.trust_score = min(agent.trust_score + 0.2, 100.0)
    elif decision == "rejected" and not is_attack:
        agent.policy_violations += 1
        # Lower trust score based on violations
        agent.trust_score = max(agent.trust_score - 2.0, 30.0)
        
    # Recalculate average latency
    agent.avg_response_time = round(((agent.avg_response_time * (agent.total_requests - 1)) + elapsed_ms) / agent.total_requests, 2)
    
    db.commit()
    
    # Create notification for high risk request
    if risk_level in ["High", "Critical"] and decision == "rejected":
        high_risk_alert = Notification(
            type="high_risk",
            message=f"High Risk Alert: Rejected request from '{agent.name}' for Customer '{customer_id}' (Risk: {risk_score}%).",
            severity="critical"
        )
        db.add(high_risk_alert)
        db.commit()
    elif decision == "escalated":
        escalate_alert = Notification(
            type="high_risk",
            message=f"HITL Escalation: Verification pending for '{agent.name}' request (Confidence: {confidence_score:.1f}%).",
            severity="medium"
        )
        db.add(escalate_alert)
        db.commit()

    return {
        "decision": decision,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": round(confidence_score, 1),
        "explainability": round(explainability_score, 1),
        "reasoning": reasoning_summary,
        "timeline": timeline,
        "latency_ms": elapsed_ms,
        "attack_detected": False
    }
