from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.api import auth, agents, policies, governance, analytics, copilot, monitor, sandbox, digital_twin
from backend.app.db.session import engine, Base

# Create tables (SQLite fallback makes this instant)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Amex Trust Layer for Autonomous Financial Agents - Governance & Compliance API Engine",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS setup for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific dashboard domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(policies.router, prefix=settings.API_V1_STR)
app.include_router(governance.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(monitor.router, prefix=settings.API_V1_STR)
app.include_router(sandbox.router, prefix=settings.API_V1_STR)
app.include_router(digital_twin.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "api_docs": "/docs"
    }
