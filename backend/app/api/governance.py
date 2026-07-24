from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import datetime

from backend.app.db.session import get_db
from backend.app.db.models import AuditLog, Agent, SystemEvent
from backend.app.core.governance_engine import evaluate_request

router = APIRouter(prefix="/governance", tags=["governance"])

# Schemas
class GovernanceRequest(BaseModel):
    agent_id: str
    action: str
    amount: float
    customer_id: str
    customer_trust_score: float = 95.0
    device_recognition: float = 1.0
    location: str = "matching"
    fraud_score: float = 0.0
    historical_behavior: str = "normal"
    payload_content: Optional[str] = ""

class FeedbackRequest(BaseModel):
    audit_id: int
    feedback_decision: str # "approved_override" or "rejected_override"
    notes: Optional[str] = ""

@router.post("/request")
def process_governance_request(req: GovernanceRequest, db: Session = Depends(get_db)):
    try:
        outcome = evaluate_request(
            agent_id=req.agent_id,
            action=req.action,
            amount=req.amount,
            customer_id=req.customer_id,
            customer_trust_score=req.customer_trust_score,
            device_recognition=req.device_recognition,
            location=req.location,
            fraud_score=req.fraud_score,
            historical_behavior=req.historical_behavior,
            payload_content=req.payload_content,
            db=db
        )
        return outcome
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Governance Engine error: {str(e)}")

@router.post("/feedback")
def submit_hitl_feedback(feed: FeedbackRequest, db: Session = Depends(get_db)):
    audit = db.query(AuditLog).filter(AuditLog.id == feed.audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit log not found")
        
    audit.feedback_decision = feed.feedback_decision
    audit.feedback_notes = feed.notes
    audit.feedback_timestamp = datetime.datetime.utcnow()
    
    # Override current decision field in database for dashboard updates
    if feed.feedback_decision == "approved_override":
        audit.decision = "approved"
    else:
        audit.decision = "rejected"
        
    # Continuous Learning Loop: Update agent trust score and weights based on human feedback
    agent = db.query(Agent).filter(Agent.agent_id == audit.agent_id).first()
    if agent:
        if feed.feedback_decision == "approved_override":
            agent.trust_score = min(agent.trust_score + 1.0, 100.0)
            agent.success_count += 1
            feedback_msg = f"HITL Override Approved. Refund Agent trust score increased to {agent.trust_score:.1f}%."
        else:
            agent.trust_score = max(agent.trust_score - 2.5, 30.0)
            feedback_msg = f"HITL Override Rejected. Refund Agent trust score penalised to {agent.trust_score:.1f}%."
            
        event = SystemEvent(
            event_type="rollback", # counts as a feedback adjustment
            message=f"Continuous Learning: Human Operator feedback processed. {feedback_msg}",
            operator_name="Operator HITL System"
        )
        db.add(event)
        
    db.commit()
    return {"message": "Human operator feedback logged successfully. Governance parameters adjusted."}
