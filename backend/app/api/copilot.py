from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.db.session import get_db
from backend.app.core.copilot import query_copilot

router = APIRouter(prefix="/copilot", tags=["copilot"])

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_with_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        response = query_copilot(req.query, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot query processing failed: {str(e)}")
