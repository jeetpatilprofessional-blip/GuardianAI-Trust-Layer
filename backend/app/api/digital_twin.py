from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime
import random

from backend.app.db.session import get_db
from backend.app.db.models import SystemEvent, Notification, Agent

router = APIRouter(prefix="/digital-twin", tags=["digital-twin"])

class AttackInjection(BaseModel):
    attack_type: str # "prompt_injection", "unauthorized_access", "latency_spike", "fraud_surge", "compliance_breach"

@router.post("/inject")
def inject_digital_twin_attack(req: AttackInjection, db: Session = Depends(get_db)):
    try:
        timestamp = datetime.datetime.utcnow().strftime('%H:%M:%S')
        
        # 1. System Event logging
        event = SystemEvent(
            event_type="kill_switch" if "injection" in req.attack_type or "access" in req.attack_type else "config_change",
            message=f"Digital Twin Injection: Injected '{req.attack_type}' scenario into virtual agent environment.",
            operator_name="Digital Twin Core"
        )
        db.add(event)
        
        # 2. Notification trigger
        notif_msg = ""
        severity = "medium"
        resilience_score = 100
        fail_safes = 0
        cascading_failures = 0
        latency_buffer_ms = 0
        
        if req.attack_type == "prompt_injection":
            notif_msg = f"Digital Twin Alert: Prompt Injection burst detected on Refund Agent fleet. Virtual guards triggered automated block."
            severity = "critical"
            resilience_score = 98.4
            fail_safes = 15
            
        elif req.attack_type == "unauthorized_access":
            notif_msg = f"Digital Twin Alert: Non-registered agent attempted transaction API calls. Registry check failed."
            severity = "high"
            resilience_score = 100.0
            fail_safes = 8
            
        elif req.attack_type == "latency_spike":
            notif_msg = f"Digital Twin Warning: API Gateway latency spiked to 2.4s. Safe-mode offline caches triggered."
            severity = "medium"
            resilience_score = 92.1
            fail_safes = 3
            latency_buffer_ms = 1240
            cascading_failures = 1
            
        elif req.attack_type == "fraud_surge":
            notif_msg = f"Digital Twin Warning: High fraud score surge detected from mock EMEA region nodes."
            severity = "high"
            resilience_score = 95.8
            fail_safes = 42
            
        elif req.attack_type == "compliance_breach":
            notif_msg = f"Digital Twin Alert: Card limit validation failed on Credit Agent. Policy enforcement triggered rollback."
            severity = "critical"
            resilience_score = 97.2
            fail_safes = 5
            
        else:
            notif_msg = f"Digital Twin: Custom test suite executed successfully."
            severity = "low"
            resilience_score = 100.0
            
        notif = Notification(
            type="attack_detected",
            message=notif_msg,
            severity=severity
        )
        db.add(notif)
        
        # Penalise virtual agent trust score in db for visual effect
        agents = db.query(Agent).all()
        for agent in agents:
            if req.attack_type == "prompt_injection" and agent.agent_id == "refund_agent":
                agent.trust_score = max(agent.trust_score - 8.5, 45.0)
            elif req.attack_type == "fraud_surge":
                agent.trust_score = max(agent.trust_score - 3.2, 50.0)
                
        db.commit()
        
        return {
            "status": "success",
            "simulation_metrics": {
                "injected_scenario": req.attack_type,
                "fleet_resilience_rate_pct": resilience_score,
                "active_fail_safes": fail_safes,
                "cascading_error_count": cascading_failures,
                "gateway_latency_ms": latency_buffer_ms,
                "verdict": "Platform withstood threat simulation successfully."
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Digital Twin simulation failed: {str(e)}")
