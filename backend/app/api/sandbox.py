from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from backend.app.db.session import get_db
from backend.app.core.governance_engine import evaluate_request

router = APIRouter(prefix="/sandbox", tags=["sandbox"])

class SandboxRequest(BaseModel):
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
    expected_decision: str # "approved", "rejected", "escalated"

@router.post("/test")
def run_sandbox_test(req: SandboxRequest, db: Session = Depends(get_db)):
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
        
        actual_decision = outcome["decision"]
        match = (actual_decision.lower() == req.expected_decision.lower())
        
        # Add sandbox test matching results
        outcome["expected_decision"] = req.expected_decision
        outcome["match"] = match
        
        if not match:
            outcome["sandbox_status"] = "policy_mismatch"
            outcome["sandbox_notes"] = f"Expected decision '{req.expected_decision.upper()}' but engine returned '{actual_decision.upper()}'."
        else:
            outcome["sandbox_status"] = "success"
            outcome["sandbox_notes"] = f"Decision matches expected outcome successfully."
            
        return outcome
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sandbox run failed: {str(e)}")
