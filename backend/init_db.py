import sys
import os
import datetime

# Ensure sys.path includes root workspace
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.db.session import SessionLocal, engine, Base
from backend.app.db.models import User, Agent, Policy, PolicyVersion, Permission, SpendLimit, AuditLog, Notification, SystemEvent, PolicyRecommendation
from backend.app.core.security import get_password_hash

def seed_db():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database already has user
        if db.query(User).filter(User.username == "admin").first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        # 1. Create Users
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("Password123"),
            role="admin",
            created_at=datetime.datetime.utcnow()
        )
        db.add(admin_user)

        # 2. Create AI Agents
        # Refund Agent
        refund_agent = Agent(
            agent_id="refund_agent",
            name="Refund Agent",
            description="Processes customer purchase refunds and disputed merchant transaction adjustments.",
            status="active",
            risk_level="medium",
            permission_level="agent",
            daily_spend_limit=50000.0,
            monthly_spend_limit=500000.0,
            current_daily_spend=12000.0, # seed spend
            current_monthly_spend=85000.0,
            allowed_apis=["refund", "read_transactions", "view_customer_profile"],
            assigned_policies=["P-101", "P-102", "P-105"],
            trust_score=97.0,
            success_count=124,
            total_requests=128,
            false_positives=1,
            policy_violations=2,
            avg_response_time=820.0
        )
        db.add(refund_agent)

        # Credit Limit Agent
        credit_agent = Agent(
            agent_id="credit_agent",
            name="Credit Limit Agent",
            description="Evaluates requests to increase credit limits or adjust lending tiers.",
            status="active",
            risk_level="high",
            permission_level="agent",
            daily_spend_limit=100000.0,
            monthly_spend_limit=1000000.0,
            current_daily_spend=0.0,
            current_monthly_spend=320000.0,
            allowed_apis=["increase_credit_limit", "read_transactions", "view_customer_profile"],
            assigned_policies=["P-101", "P-103", "P-105"],
            trust_score=95.8,
            success_count=82,
            total_requests=86,
            false_positives=0,
            policy_violations=1,
            avg_response_time=1210.0
        )
        db.add(credit_agent)

        # Card Agent
        card_agent = Agent(
            agent_id="card_agent",
            name="Card Replacement Agent",
            description="Replaces lost/stolen cards and waives credit card annual membership fees.",
            status="active",
            risk_level="low",
            permission_level="agent",
            daily_spend_limit=20000.0,
            monthly_spend_limit=150000.0,
            current_daily_spend=1200.0,
            current_monthly_spend=14800.0,
            allowed_apis=["replace_card", "waive_annual_fee", "read_transactions"],
            assigned_policies=["P-101", "P-104"],
            trust_score=99.2,
            success_count=214,
            total_requests=215,
            false_positives=0,
            policy_violations=0,
            avg_response_time=580.0
        )
        db.add(card_agent)

        # 3. Create Spend Limits & Permissions records
        for ag_id, daily, monthly, apis in [
            ("refund_agent", 50000.0, 500000.0, ["refund", "read_transactions", "view_customer_profile"]),
            ("credit_agent", 100000.0, 1000000.0, ["increase_credit_limit", "read_transactions", "view_customer_profile"]),
            ("card_agent", 20000.0, 150000.0, ["replace_card", "waive_annual_fee", "read_transactions"])
        ]:
            db.add(SpendLimit(
                agent_id=ag_id,
                daily_limit=daily,
                monthly_limit=monthly,
                current_daily=12000.0 if ag_id == "refund_agent" else (1200.0 if ag_id == "card_agent" else 0.0),
                current_monthly=85000.0 if ag_id == "refund_agent" else (14800.0 if ag_id == "card_agent" else 320000.0)
            ))
            db.add(Permission(
                agent_id=ag_id,
                allowed_actions=apis,
                blocked_actions=["delete_account", "increase_credit_limit" if ag_id != "credit_agent" else "none"]
            ))

        # 4. Create Policies (with Versioning)
        policies_data = [
            {
                "policy_id": "P-101",
                "name": "AML Global Risk Limit",
                "description": "Anti-Money Laundering baseline restrictions blocking any single transaction above ₹100,000 without administrative approval.",
                "priority": "high",
                "conditions": {"min_customer_trust": 30},
                "allowed_actions": ["refund", "increase_credit_limit", "waive_annual_fee"],
                "blocked_actions": [],
                "max_amount": 100000.0,
                "required_approval_level": "admin",
                "status": "active"
            },
            {
                "policy_id": "P-102",
                "name": "Refund Discrepancy Policy",
                "description": "Limits automated refund agent approvals to a maximum of ₹15,000 for standard customer support tickets.",
                "priority": "medium",
                "conditions": {"min_customer_trust": 60},
                "allowed_actions": ["refund"],
                "blocked_actions": ["replace_card", "increase_credit_limit"],
                "max_amount": 150000.0, # changed limit in v2
                "required_approval_level": "operator",
                "status": "active"
            },
            {
                "policy_id": "P-103",
                "name": "Credit Limit Adjustments Policy",
                "description": "Requires fraud score check below 30% and customer trust above 80% to automatically double a credit limit.",
                "priority": "high",
                "conditions": {"min_customer_trust": 80, "max_fraud_score": 30},
                "allowed_actions": ["increase_credit_limit"],
                "blocked_actions": [],
                "max_amount": 80000.0,
                "required_approval_level": "admin",
                "status": "active"
            },
            {
                "policy_id": "P-104",
                "name": "Annual Fee Waiver Verification",
                "description": "Allows automated annual fee waiving up to ₹5,000. Larger fee waivers require manual review.",
                "priority": "low",
                "conditions": {"min_customer_trust": 50},
                "allowed_actions": ["waive_annual_fee"],
                "blocked_actions": [],
                "max_amount": 5000.0,
                "required_approval_level": "automated",
                "status": "active"
            },
            {
                "policy_id": "P-105",
                "name": "High Risk Regional Filter",
                "description": "Escalates any transactions above ₹10,000 if fraud score exceeds 15% or device mismatch occurs.",
                "priority": "high",
                "conditions": {"max_fraud_score": 15},
                "allowed_actions": ["refund", "increase_credit_limit"],
                "blocked_actions": [],
                "max_amount": 10000.0,
                "required_approval_level": "operator",
                "status": "active"
            }
        ]

        for p in policies_data:
            db_pol = Policy(
                policy_id=p["policy_id"],
                name=p["name"],
                description=p["description"],
                priority=p["priority"],
                conditions=p["conditions"],
                allowed_actions=p["allowed_actions"],
                blocked_actions=p["blocked_actions"],
                max_amount=p["max_amount"],
                required_approval_level=p["required_approval_level"],
                status=p["status"],
                version=3 if p["policy_id"] == "P-102" else 1, # setup mock version history for demo
                created_by="Administrator",
                change_reason="Adjusted max amount from 10k to 15k based on operations support request." if p["policy_id"] == "P-102" else "Initial deployment"
            )
            db.add(db_pol)
            
            # Seed version history
            if p["policy_id"] == "P-102":
                # Version 1
                db.add(PolicyVersion(
                    policy_id="P-102",
                    version=1,
                    name=p["name"],
                    description=p["description"],
                    priority=p["priority"],
                    conditions={"min_customer_trust": 80}, # stricter trust initially
                    allowed_actions=p["allowed_actions"],
                    blocked_actions=p["blocked_actions"],
                    max_amount=10000.0,
                    required_approval_level="operator",
                    status="active",
                    created_by="System",
                    change_reason="Initial baseline configuration"
                ))
                # Version 2
                db.add(PolicyVersion(
                    policy_id="P-102",
                    version=2,
                    name=p["name"],
                    description=p["description"],
                    priority=p["priority"],
                    conditions={"min_customer_trust": 70},
                    allowed_actions=p["allowed_actions"],
                    blocked_actions=p["blocked_actions"],
                    max_amount=12000.0,
                    required_approval_level="operator",
                    status="active",
                    created_by="Administrator",
                    change_reason="Increased limit to 12k due to retail volume spike."
                ))
                # Version 3 (Active)
                db.add(PolicyVersion(
                    policy_id="P-102",
                    version=3,
                    name=p["name"],
                    description=p["description"],
                    priority=p["priority"],
                    conditions=p["conditions"],
                    allowed_actions=p["allowed_actions"],
                    blocked_actions=p["blocked_actions"],
                    max_amount=p["max_amount"],
                    required_approval_level=p["required_approval_level"],
                    status=p["status"],
                    created_by="Administrator",
                    change_reason="Adjusted max amount from 12k to 15k for support optimization."
                ))
            else:
                db.add(PolicyVersion(
                    policy_id=p["policy_id"],
                    version=1,
                    name=p["name"],
                    description=p["description"],
                    priority=p["priority"],
                    conditions=p["conditions"],
                    allowed_actions=p["allowed_actions"],
                    blocked_actions=p["blocked_actions"],
                    max_amount=p["max_amount"],
                    required_approval_level=p["required_approval_level"],
                    status=p["status"],
                    created_by="Administrator",
                    change_reason="Initial deployment"
                ))

        # 5. Seed Policy Recommendations
        db.add(PolicyRecommendation(
            pattern_detected="85% of fraudulent refund attempts originated from new devices after midnight.",
            recommended_name="P-SEC-MIDNIGHT",
            recommended_description="Require manual approval for refund requests above ₹10,000 from new devices between 11 PM and 5 AM.",
            conditions={"min_device_recognition": 0.8, "restricted_hours": ["23:00", "05:00"]},
            max_amount=10000.0,
            allowed_actions=["refund"],
            blocked_actions=[],
            required_approval_level="operator",
            status="recommended",
            deployed=False
        ))
        
        db.add(PolicyRecommendation(
            pattern_detected="Exceeded credit score checks: High volume of credit limit requests (45 attempts/hr) failing compliance rules.",
            recommended_name="P-LIMIT-COOLDOWN",
            recommended_description="Enforce cooldown period of 24 hours between credit limit requests for any account.",
            conditions={"cooldown_hours": 24},
            max_amount=0.0,
            allowed_actions=["increase_credit_limit"],
            blocked_actions=[],
            required_approval_level="admin",
            status="recommended",
            deployed=False
        ))

        # 6. Seed Historical Audit Logs for Analytics charts
        # Audit Log 1 (Approved)
        db.add(AuditLog(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=4),
            agent_id="refund_agent",
            agent_name="Refund Agent",
            action="refund",
            customer_id="CUST-9921",
            policy_id="P-102",
            policy_name="Refund Discrepancy Policy",
            risk_score=14.5,
            risk_level="Low",
            decision="approved",
            confidence_score=96.4,
            explainability_score=95.0,
            execution_time_ms=750,
            status="success",
            reasoning="Refund approved. Policy P-102 matches. Fraud score is below threshold (4%). Known customer. Daily spend limits remain available.",
            details={"amount": 4200.0, "customer_trust_score": 95.0, "device_recognition": 1.0, "location": "matching", "fraud_score": 4.0}
        ))
        
        # Audit Log 2 (Approved)
        db.add(AuditLog(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3),
            agent_id="card_agent",
            agent_name="Card Replacement Agent",
            action="waive_annual_fee",
            customer_id="CUST-4112",
            policy_id="P-104",
            policy_name="Annual Fee Waiver Verification",
            risk_score=8.2,
            risk_level="Low",
            decision="approved",
            confidence_score=98.5,
            explainability_score=95.0,
            execution_time_ms=480,
            status="success",
            reasoning="Annual fee waiver approved automatically. Policy P-104 matches. Waiver amount ₹1,200 is below policy threshold ₹5,000.",
            details={"amount": 1200.0, "customer_trust_score": 85.0, "device_recognition": 1.0, "location": "matching", "fraud_score": 2.0}
        ))

        # Audit Log 3 (Rejected - Policy violation)
        db.add(AuditLog(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            agent_id="refund_agent",
            agent_name="Refund Agent",
            action="refund",
            customer_id="CUST-8021",
            policy_id="P-102",
            policy_name="Refund Discrepancy Policy",
            risk_score=78.2,
            risk_level="High",
            decision="rejected",
            confidence_score=21.8,
            explainability_score=95.0,
            execution_time_ms=880,
            status="failed",
            reasoning="Request rejected. Policy violation: Requested refund amount ₹16,000 exceeds maximum policy threshold of ₹15,000 (P-102). Elevated fraud risk detected.",
            details={"amount": 16000.0, "customer_trust_score": 45.0, "device_recognition": 0.4, "location": "mismatch", "fraud_score": 52.0}
        ))
        
        # Audit Log 4 (Escalated - HITL Queue)
        db.add(AuditLog(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=30),
            agent_id="refund_agent",
            agent_name="Refund Agent",
            action="refund",
            customer_id="CUST-3877",
            policy_id="P-105",
            policy_name="High Risk Regional Filter",
            risk_score=68.4,
            risk_level="High",
            decision="escalated",
            confidence_score=41.2,
            explainability_score=88.0,
            execution_time_ms=920,
            status="success",
            reasoning="Transaction escalated to Human-in-the-Loop. Fraud score is elevated (18%). Location mismatch detected (Cust registered in Delhi, IP from Mumbai). Amount ₹12,000 exceeds compliance automated authorization check.",
            details={"amount": 12000.0, "customer_trust_score": 75.0, "device_recognition": 0.9, "location": "mismatch", "fraud_score": 18.0}
        ))

        # 7. Seed Notifications
        db.add(Notification(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            type="policy_violation",
            message="Policy Violation: Agent 'Refund Agent' violated policy 'Refund Discrepancy Policy' (P-102) requesting 'refund' of ₹16,000.",
            severity="high",
            is_read=False
        ))
        db.add(Notification(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=30),
            type="high_risk",
            message="HITL Escalation: Verification pending for 'Refund Agent' request of ₹12,000 (Confidence: 41.2%).",
            severity="medium",
            is_read=False
        ))

        # 8. Seed System Events
        db.add(SystemEvent(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=10),
            event_type="admin_login",
            message="Administrator logged into security console from terminal IP 192.168.1.45.",
            operator_name="System"
        ))
        
        db.add(SystemEvent(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=5),
            event_type="policy_edit",
            message="Updated Policy P-102 to Version 3. Adjusted max amount from 12k to 15k.",
            operator_name="Administrator"
        ))

        db.commit()
        print("Database seeded successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
