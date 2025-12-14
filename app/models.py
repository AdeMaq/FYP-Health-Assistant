from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default_user"

class ChatResponse(BaseModel):
    intent: str
    entities: Dict[str, Any]
    response: Any

class AgentRequest(BaseModel):
    goal: str
    user_id: Optional[str] = "default_user"
    max_steps: Optional[int] = 5
