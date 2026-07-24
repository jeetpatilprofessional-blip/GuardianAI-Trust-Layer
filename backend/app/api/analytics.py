from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime

from backend.app.db.session import get_db
from backend.app.db.models import Agent, AuditLog, Policy, SpendLimit, Notification

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    audit_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    notifications = db.query(Notification).all()
    policies = db.query(Policy).all()
    
    total_agents = len(agents)
    suspended_agents = sum(1 for a in agents if a.status == "paused")
    active_agents = sum(1 for a in agents if a.status == "active")
    
    total_requests = len(audit_logs)
    approved_count = sum(1 for log in audit_logs if log.decision == "approved")
    rejected_count = sum(1 for log in audit_logs if log.decision == "rejected")
    escalated_count = sum(1 for log in audit_logs if log.decision == "escalated")
    
    high_risk_requests = sum(1 for log in audit_logs if log.risk_level in ["High", "Critical"])
    policy_violations = sum(1 for n in notifications if n.type == "policy_violation")
    
    # Calculate overall spend utilization
    limits = db.query(SpendLimit).all()
    total_daily_limit = sum(lim.daily_limit for lim in limits)
    total_daily_spend = sum(lim.current_daily for lim in limits)
    spend_utilization_pct = round((total_daily_spend / total_daily_limit * 100.0) if total_daily_limit > 0 else 0.0, 1)

    # 1. Fleet Health Index calculations
    # Overall Fleet Health is weighted: Security (40%), Compliance (40%), Risk (20%)
    # Security: penalised by attack detections and suspensions
    # Compliance: penalised by policy violations and RBI/PCI issues
    # Risk: average risk score subtracted from 100
    security_score = max(100.0 - (sum(1 for n in notifications if n.type == "attack_detected") * 10.0) - (suspended_agents * 5.0), 50.0)
    compliance_score = max(100.0 - (policy_violations * 4.0), 60.0)
    
    avg_risk = sum(log.risk_score for log in audit_logs) / total_requests if total_requests > 0 else 12.5
    risk_sub_score = max(100.0 - avg_risk, 40.0)
    
    fleet_health = round((security_score * 0.4) + (compliance_score * 0.4) + (risk_sub_score * 0.2), 1)

    # 2. Risk Score Distribution
    low_risk = sum(1 for log in audit_logs if log.risk_level == "Low")
    med_risk = sum(1 for log in audit_logs if log.risk_level == "Medium")
    high_risk = sum(1 for log in audit_logs if log.risk_level == "High")
    crit_risk = sum(1 for log in audit_logs if log.risk_level == "Critical")
    
    risk_distribution = [
        {"name": "Low Risk", "value": low_risk if total_requests > 0 else 12},
        {"name": "Medium Risk", "value": med_risk if total_requests > 0 else 5},
        {"name": "High Risk", "value": high_risk if total_requests > 0 else 2},
        {"name": "Critical Risk", "value": crit_risk if total_requests > 0 else 1}
    ]

    # 3. Agent Activity
    agent_activity = []
    for a in agents:
        agent_requests = sum(1 for log in audit_logs if log.agent_id == a.agent_id)
        agent_activity.append({
            "name": a.name,
            "requests": agent_requests if total_requests > 0 else a.total_requests,
            "violations": a.policy_violations,
            "trust": a.trust_score
        })

    # 4. Spend Trend (last 7 data points)
    # Generate mock timeline for display
    spend_trend = [
        {"time": "09:00", "Refund Agent": 12000, "Credit Agent": 0, "Card Agent": 200},
        {"time": "10:00", "Refund Agent": 24000, "Credit Agent": 5000, "Card Agent": 500},
        {"time": "11:00", "Refund Agent": 24000, "Credit Agent": 5000, "Card Agent": 1200},
        {"time": "12:00", "Refund Agent": 36000, "Credit Agent": 12000, "Card Agent": 1500},
        {"time": "13:00", "Refund Agent": 36000, "Credit Agent": 12000, "Card Agent": 1500},
        {"time": "14:00", "Refund Agent": 48000, "Credit Agent": 20000, "Card Agent": 1800},
        {"time": "Current", "Refund Agent": sum(a.current_daily_spend for a in agents if a.agent_id == "refund_agent"), 
                           "Credit Agent": sum(a.current_daily_spend for a in agents if a.agent_id == "credit_agent"), 
                           "Card Agent": sum(a.current_daily_spend for a in agents if a.agent_id == "card_agent")}
    ]

    # 5. Policy Violations Over Time
    violations_over_time = [
        {"date": "Mon", "violations": 1},
        {"date": "Tue", "violations": 0},
        {"date": "Wed", "violations": 2},
        {"date": "Thu", "violations": 1},
        {"date": "Fri", "violations": 0},
        {"date": "Sat", "violations": 0},
        {"date": "Sun", "violations": policy_violations}
    ]

    # 6. Business KPIs (Simulated baseline adjusted dynamically based on logs)
    # ROI: cost saved by preventing fraud ($5,000 per high/critical risk block) + manual review reductions
    total_prevented_fraud_count = sum(1 for log in audit_logs if log.risk_level in ["High", "Critical"] and log.decision == "rejected")
    fraud_prevented_amount = 450000.0 + (total_prevented_fraud_count * 12000.0) # baseline ₹450k + actuals
    
    automation_rate = round((approved_count + rejected_count) / total_requests * 100.0, 1) if total_requests > 0 else 91.5
    manual_reviews_reduced = 62.4
    estimated_annual_savings = round((fraud_prevented_amount * 1.5) / 1000.0, 1) # in thousands/millions
    
    avg_latency = round(sum(log.execution_time_ms for log in audit_logs) / total_requests, 1) if total_requests > 0 else 125.4
    compliance_rate = compliance_score
    
    return {
        "summary": {
            "total_agents": total_agents,
            "active_agents": active_agents,
            "suspended_agents": suspended_agents,
            "total_requests": total_requests,
            "approved_requests": approved_count,
            "rejected_requests": rejected_count,
            "escalated_requests": escalated_count,
            "high_risk_requests": high_risk_requests,
            "policy_violations": policy_violations,
            "spend_utilization_pct": spend_utilization_pct,
            "total_daily_spend": total_daily_spend,
            "total_daily_limit": total_daily_limit
        },
        "fleet_health": {
            "overall": fleet_health,
            "security": round(security_score, 1),
            "compliance": round(compliance_score, 1),
            "risk": round(risk_sub_score, 1)
        },
        "charts": {
            "risk_distribution": risk_distribution,
            "agent_activity": agent_activity,
            "approval_ratio": [
                {"name": "Approved", "value": approved_count if total_requests > 0 else 85},
                {"name": "Rejected", "value": rejected_count if total_requests > 0 else 10},
                {"name": "Escalated", "value": escalated_count if total_requests > 0 else 5}
            ],
            "spend_trend": spend_trend,
            "violations_over_time": violations_over_time
        },
        "business_kpis": {
            "fraud_prevented": round(fraud_prevented_amount, 2),
            "automation_rate": automation_rate,
            "manual_reviews_reduced": manual_reviews_reduced,
            "estimated_annual_savings_million": round(estimated_annual_savings / 1000.0, 2),
            "avg_latency_ms": avg_latency,
            "compliance_rate": compliance_rate,
            "customer_satisfaction": 94.8,
            "uptime_pct": 99.98
        }
    }
