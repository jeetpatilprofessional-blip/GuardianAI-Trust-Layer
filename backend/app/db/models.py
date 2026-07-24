import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from backend.app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="admin") # admin, operator
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="active") # active, paused, offline
    risk_level = Column(String, default="low") # low, medium, high, critical
    permission_level = Column(String, default="agent") # admin, operator, agent
    daily_spend_limit = Column(Float, default=100000.0)
    monthly_spend_limit = Column(Float, default=1000000.0)
    current_daily_spend = Column(Float, default=0.0)
    current_monthly_spend = Column(Float, default=0.0)
    allowed_apis = Column(JSON, default=list) # e.g. ["refund", "waive_fee"]
    assigned_policies = Column(JSON, default=list) # e.g. ["P-101", "P-102"]
    
    # Trust Score Metrics
    trust_score = Column(Float, default=100.0)
    success_count = Column(Integer, default=0)
    total_requests = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    policy_violations = Column(Integer, default=0)
    avg_response_time = Column(Float, default=0.0)
    
    last_activity = Column(DateTime, default=datetime.datetime.utcnow)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String, default="medium") # low, medium, high
    conditions = Column(JSON, default=dict) # e.g. {"max_amount": 10000}
    allowed_actions = Column(JSON, default=list)
    blocked_actions = Column(JSON, default=list)
    max_amount = Column(Float, default=50000.0)
    required_approval_level = Column(String, default="automated") # automated, operator, admin
    status = Column(String, default="active") # active, inactive
    version = Column(Integer, default=1)
    created_by = Column(String, default="System")
    change_reason = Column(String, default="Initial version")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PolicyVersion(Base):
    __tablename__ = "policy_versions"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(String, index=True, nullable=False)
    version = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String)
    conditions = Column(JSON)
    allowed_actions = Column(JSON)
    blocked_actions = Column(JSON)
    max_amount = Column(Float)
    required_approval_level = Column(String)
    status = Column(String)
    created_by = Column(String)
    change_reason = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, unique=True, index=True, nullable=False)
    allowed_actions = Column(JSON, default=list)
    blocked_actions = Column(JSON, default=list)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Float, default=0.0)
    customer_trust_score = Column(Float, default=100.0)
    device_recognition = Column(Float, default=1.0) # 0 to 1
    location = Column(String, default="matching") # matching, mismatch
    fraud_score = Column(Float, default=0.0) # 0 to 100
    historical_behavior = Column(String, default="normal") # normal, suspicious
    calculated_score = Column(Float, default=0.0)
    risk_level = Column(String, default="low") # low, medium, high, critical

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    agent_id = Column(String, index=True, nullable=False)
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    policy_id = Column(String)
    policy_name = Column(String)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="low")
    decision = Column(String, nullable=False) # approved, rejected, escalated
    confidence_score = Column(Float, default=100.0) # 0 to 100
    explainability_score = Column(Float, default=100.0) # 0 to 100
    execution_time_ms = Column(Integer, default=0)
    status = Column(String, default="success") # success, failed
    operator_id = Column(String)
    reasoning = Column(Text) # detailed explainability explanation
    details = Column(JSON) # stores full input request dictionary
    
    # HITL Feedback fields
    feedback_decision = Column(String) # approved_override, rejected_override
    feedback_notes = Column(String)
    feedback_timestamp = Column(DateTime)

class RequestLog(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    agent_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    customer_id = Column(String, nullable=False)
    customer_trust_score = Column(Float, default=100.0)
    device_recognition = Column(Float, default=1.0)
    location = Column(String, default="matching")
    fraud_score = Column(Float, default=0.0)
    historical_behavior = Column(String, default="normal")
    risk_score = Column(Float, default=0.0)
    decision = Column(String, default="pending")
    reasoning = Column(Text)
    status = Column(String, default="success")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    type = Column(String, nullable=False) # high_risk, policy_violation, spend_limit, agent_failure, emergency_stop, attack_detected
    message = Column(String, nullable=False)
    severity = Column(String, default="low") # low, medium, high, critical
    is_read = Column(Boolean, default=False)

class SystemEvent(Base):
    __tablename__ = "system_events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String, nullable=False) # config_change, kill_switch, policy_edit, rollback, admin_login, copilot_query
    message = Column(String, nullable=False)
    operator_name = Column(String, default="System")

class SpendLimit(Base):
    __tablename__ = "spend_limits"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, unique=True, index=True, nullable=False)
    daily_limit = Column(Float, default=100000.0)
    monthly_limit = Column(Float, default=1000000.0)
    current_daily = Column(Float, default=0.0)
    current_monthly = Column(Float, default=0.0)

class PolicyRecommendation(Base):
    __tablename__ = "policy_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    pattern_detected = Column(String, nullable=False)
    recommended_name = Column(String, nullable=False)
    recommended_description = Column(String)
    conditions = Column(JSON, default=dict)
    max_amount = Column(Float)
    allowed_actions = Column(JSON, default=list)
    blocked_actions = Column(JSON, default=list)
    required_approval_level = Column(String, default="operator")
    status = Column(String, default="recommended") # recommended, deployed, dismissed
    deployed = Column(Boolean, default=False)
