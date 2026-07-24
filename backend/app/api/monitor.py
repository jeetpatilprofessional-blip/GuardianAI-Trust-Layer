from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import random

from backend.app.db.session import get_db
from backend.app.db.models import AuditLog, Notification, SystemEvent

router = APIRouter(prefix="/monitor", tags=["monitor"])

@router.get("/logs")
def get_logs(
    agent_id: Optional[str] = None,
    decision: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if agent_id:
        query = query.filter(AuditLog.agent_id == agent_id)
    if decision:
        query = query.filter(AuditLog.decision == decision)
    if risk_level:
        query = query.filter(AuditLog.risk_level == risk_level)
    if search:
        query = query.filter(
            AuditLog.agent_name.like(f"%{search}%") |
            AuditLog.action.like(f"%{search}%") |
            AuditLog.customer_id.like(f"%{search}%") |
            AuditLog.reasoning.like(f"%{search}%")
        )
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.timestamp.desc()).limit(50).all()

@router.post("/notifications/read-all")
def read_all_notifications(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(SystemEvent).order_by(SystemEvent.timestamp.desc()).limit(50).all()

@router.get("/health")
def get_system_health():
    """
    Returns simulated dynamic performance statistics for system monitoring.
    """
    # Dynamic values to make dashboard feel 'alive'
    cpu_load = round(12.4 + random.uniform(-2.0, 3.0), 1)
    memory_load = round(45.2 + random.uniform(-0.5, 0.5), 1)
    avg_latency = round(110.5 + random.uniform(-5.0, 5.0), 1)
    
    return {
        "status": "healthy",
        "api_health": {
            "gateway": "online",
            "auth_service": "online",
            "governance_engine": "online",
            "risk_engine": "online",
            "database_connection": "active"
        },
        "metrics": {
            "cpu_load_pct": cpu_load,
            "memory_load_pct": memory_load,
            "average_response_time_ms": avg_latency,
            "active_connections": random.randint(15, 28)
        }
    }
