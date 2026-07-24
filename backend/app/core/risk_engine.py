def calculate_risk(
    amount: float,
    customer_trust_score: float, # 0 to 100
    device_recognition: float, # 0 to 1
    location: str, # "matching" or "mismatch"
    fraud_score: float, # 0 to 100
    historical_behavior: str, # "normal" or "suspicious"
    agent_trust_score: float = 100.0 # 0 to 100
) -> tuple[float, str]:
    """
    Computes a risk score (0-100) and a risk level classification.
    Stricter penalty is applied if agent_trust_score is low.
    """
    # 1. Base components
    # Amount risk: 0 for 0, 100 for ₹100,000 or more
    amount_factor = min(amount / 50000.0 * 100.0, 100.0) * 0.20 # 20% weight
    
    # Customer trust factor: higher trust = lower risk
    customer_factor = (100.0 - customer_trust_score) * 0.20 # 20% weight
    
    # Device factor: lower device recognition = higher risk
    device_factor = (1.0 - device_recognition) * 100.0 * 0.15 # 15% weight
    
    # Location factor: mismatch = 100 risk, matching = 0 risk
    location_factor = (100.0 if location == "mismatch" else 0.0) * 0.15 # 15% weight
    
    # ML Fraud score: 0 to 100
    fraud_factor = fraud_score * 0.20 # 20% weight
    
    # Historical behavior factor: suspicious = 100 risk, normal = 0 risk
    behavior_factor = (100.0 if historical_behavior == "suspicious" else 0.0) * 0.10 # 10% weight

    # 2. Raw risk score
    raw_risk = (
        amount_factor +
        customer_factor +
        device_factor +
        location_factor +
        fraud_factor +
        behavior_factor
    )
    
    # 3. Apply Agent Trust Penalty
    # If the requesting agent has a low trust score, escalate the risk.
    if agent_trust_score < 90.0:
        penalty = (90.0 - agent_trust_score) * 1.5 # max penalty of ~15-20 points
        raw_risk += penalty
    
    # Ensure range [0, 100]
    final_risk = min(max(raw_risk, 0.0), 100.0)
    
    # 4. Classify Risk Level
    if final_risk <= 30.0:
        risk_level = "Low"
    elif final_risk <= 60.0:
        risk_level = "Medium"
    elif final_risk <= 85.0:
        risk_level = "High"
    else:
        risk_level = "Critical"
        
    return round(final_risk, 2), risk_level
