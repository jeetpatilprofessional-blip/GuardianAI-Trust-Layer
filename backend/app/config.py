import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GuardianAI – Trust Layer for Autonomous Financial Agents"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "guardian_ai_enterprise_secret_key_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Fallback to local SQLite database if POSTGRES_URL is not configured
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./guardian_ai.db"
    )

    class Config:
        case_sensitive = True

settings = Settings()
