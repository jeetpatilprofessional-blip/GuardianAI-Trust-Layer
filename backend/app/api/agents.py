import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from backend.app.db.session import get_db
from backend.app.db.models import Agent, SpendLimit, Permission, SystemEvent, Notification

router = APIRouter(prefix="/agents", tags=["agents"])

# Schemas
class AgentBase(BaseModel):
    agent_id: str
    name: str
    description: Optional[str] = None
    risk_level: Optional[str] = "low"
    permission_level: Optional[str] = "agent"
    daily_spend_limit: float = 100000.0
    monthly_spend_limit: float = 1000000.0
    allowed_apis: List[str] = []
    assigned_policies: List[str] = []

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    permission_level: Optional[str] = None
    daily_spend_limit: Optional[float] = None
    monthly_spend_limit: Optional[float] = None
    allowed_apis: Optional[List[str]] = None
    assigned_policies: Optional[List[str]] = None
    status: Optional[str] = None

@router.get("/")
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_agent(agent_in: AgentCreate, db: Session = Depends(get_db)):
    # Check if duplicate exists
    existing = db.query(Agent).filter(Agent.agent_id == agent_in.agent_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Agent ID already registered")
        
    db_agent = Agent(
        agent_id=agent_in.agent_id,
        name=agent_in.name,
        description=agent_in.description,
        status="active",
        risk_level=agent_in.risk_level,
        permission_level=agent_in.permission_level,
        daily_spend_limit=agent_in.daily_spend_limit,
        monthly_spend_limit=agent_in.monthly_spend_limit,
        allowed_apis=agent_in.allowed_apis,
        assigned_policies=agent_in.assigned_policies,
        trust_score=100.0
    )
    db.add(db_agent)
    
    # Create corresponding SpendLimit record
    db_limit = SpendLimit(
        agent_id=agent_in.agent_id,
        daily_limit=agent_in.daily_spend_limit,
        monthly_limit=agent_in.monthly_spend_limit,
        current_daily=0.0,
        current_monthly=0.0
    )
    db.add(db_limit)
    
    # Create Permission record
    db_permission = Permission(
        agent_id=agent_in.agent_id,
        allowed_actions=agent_in.allowed_apis,
        blocked_actions=[]
    )
    db.add(db_permission)
    
    # System event log
    event = SystemEvent(
        event_type="config_change",
        message=f"Agent '{agent_in.name}' ({agent_in.agent_id}) registered in fleet."
    )
    db.add(event)
    
    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.put("/{agent_id}")
def update_agent(agent_id: str, agent_in: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    for field, val in agent_in.dict(exclude_unset=True).items():
        setattr(agent, field, val)
        
    # Synchronize limits if updated
    limit = db.query(SpendLimit).filter(SpendLimit.agent_id == agent_id).first()
    if limit:
        if agent_in.daily_spend_limit is not None:
            limit.daily_limit = agent_in.daily_spend_limit
        if agent_in.monthly_spend_limit is not None:
            limit.monthly_limit = agent_in.monthly_spend_limit
            
    # Synchronize permissions if updated
    perm = db.query(Permission).filter(Permission.agent_id == agent_id).first()
    if perm and agent_in.allowed_apis is not None:
        perm.allowed_actions = agent_in.allowed_apis
        
    event = SystemEvent(
        event_type="config_change",
        message=f"Agent '{agent.name}' ({agent_id}) profile/limits configuration modified."
    )
    db.add(event)
    db.commit()
    db.refresh(agent)
    return agent

@router.delete("/{agent_id}")
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    # Delete related dependencies
    db.query(SpendLimit).filter(SpendLimit.agent_id == agent_id).delete()
    db.query(Permission).filter(Permission.agent_id == agent_id).delete()
    
    event = SystemEvent(
        event_type="config_change",
        message=f"Agent '{agent.name}' ({agent_id}) deleted from platform fleet."
    )
    db.add(event)
    db.delete(agent)
    db.commit()
    return {"message": f"Agent {agent_id} deleted successfully"}

@router.post("/{agent_id}/pause")
def pause_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    agent.status = "paused"
    
    # System events and notifications
    event = SystemEvent(
        event_type="kill_switch",
        message=f"Agent '{agent.name}' ({agent_id}) SUSPENDED manually by Operator."
    )
    db.add(event)
    
    notif = Notification(
        type="emergency_stop",
        message=f"Agent Suspended: '{agent.name}' operations paused.",
        severity="medium"
    )
    db.add(notif)
    db.commit()
    db.refresh(agent)
    return agent

@router.post("/{agent_id}/resume")
def resume_agent(agent_id: str, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    agent.status = "active"
    
    event = SystemEvent(
        event_type="kill_switch",
        message=f"Agent '{agent.name}' ({agent_id}) RESUMED manually by Operator."
    )
    db.add(event)
    
    notif = Notification(
        type="emergency_stop",
        message=f"Agent Resumed: '{agent.name}' operational.",
        severity="low"
    )
    db.add(notif)
    db.commit()
    db.refresh(agent)
    return agent

@router.post("/emergency/pause-all")
def pause_all_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    for agent in agents:
        agent.status = "paused"
        
    event = SystemEvent(
        event_type="kill_switch",
        message="EMERGENCY CORE KILL SWITCH INITIATED. All agents suspended.",
        operator_name="Administrator"
    )
    db.add(event)
    
    notif = Notification(
        type="emergency_stop",
        message="CRITICAL ALERT: Emergency Stop Activated. All fleet agents suspended.",
        severity="critical"
    )
    db.add(notif)
    db.commit()
    return {"message": "All agents paused successfully"}

@router.post("/emergency/resume-all")
def resume_all_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    for agent in agents:
        agent.status = "active"
        
    event = SystemEvent(
        event_type="kill_switch",
        message="EMERGENCY CORE RESET. All agents operations resumed.",
        operator_name="Administrator"
    )
    db.add(event)
    
    notif = Notification(
        type="emergency_stop",
        message="Emergency Stop Reset. Fleet operations resumed.",
        severity="low"
    )
    db.add(notif)
    db.commit()
    return {"message": "All agents resumed successfully"}
