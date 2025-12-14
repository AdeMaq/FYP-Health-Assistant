# app/schemas.py - FIXED VERSION
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class FitnessLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class GoalType(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    ENDURANCE = "endurance"
    STRENGTH = "strength"
    MAINTENANCE = "maintenance"

class DietType(str, Enum):
    BALANCED = "balanced"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    KETO = "keto"
    MEDITERRANEAN = "mediterranean"

class AIModel(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"

# Request/Response Models
class ChatRequest(BaseModel):
    query: str = Field(..., description="User's fitness question")
    model: AIModel = Field(default=AIModel.OPENAI, description="AI model to use")
    user_id: Optional[int] = Field(None, description="User ID for personalization")
    temperature: float = Field(default=0.7, ge=0, le=1, description="Creativity level")
    max_tokens: int = Field(default=1000, ge=50, le=4000, description="Max response length")
    include_videos: bool = Field(default=True, description="Include YouTube videos")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI response")
    ai_model: str = Field(..., description="AI model used for response")  # Changed from model_used
    question_type: str = Field(..., description="Type of question asked")
    youtube_videos: Optional[List[Dict[str, Any]]] = Field(None, description="Related workout videos")
    tokens_used: int = Field(0, description="Tokens consumed")
    
    model_config = {
        "protected_namespaces": ()  # Disable protected namespace warning
    }

class UserData(BaseModel):
    age: Optional[int] = Field(None, ge=13, le=100, description="User age")
    weight: Optional[float] = Field(None, ge=30, le=200, description="Weight in kg")
    height: Optional[float] = Field(None, ge=100, le=250, description="Height in cm")
    fitness_level: FitnessLevel = Field(default=FitnessLevel.BEGINNER)
    goals: List[GoalType] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    equipment: List[str] = Field(default_factory=lambda: ["bodyweight"])
    injuries: List[str] = Field(default_factory=list)
    calorie_target: Optional[int] = Field(None, ge=1000, le=5000)

class WorkoutPlanRequest(BaseModel):
    goal: GoalType = Field(..., description="Workout goal")
    duration: str = Field("1 week", description="Plan duration")
    user_data: Optional[UserData] = Field(None, description="User information")
    include_videos: bool = Field(default=True, description="Include exercise videos")

class WorkoutPlanResponse(BaseModel):
    plan: Dict[str, Any] = Field(..., description="Generated workout plan")
    youtube_videos: List[Dict[str, Any]] = Field(default_factory=list, description="Exercise videos")
    generated_at: str = Field(..., description="Generation timestamp")

class DietPlanRequest(BaseModel):
    goal: GoalType = Field(..., description="Diet goal")
    diet_type: DietType = Field(default=DietType.BALANCED, description="Type of diet")
    user_data: Optional[UserData] = Field(None, description="User information")

class DietPlanResponse(BaseModel):
    plan: Dict[str, Any] = Field(..., description="Generated diet plan")
    generated_at: str = Field(..., description="Generation timestamp")

class YouTubeSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    max_results: int = Field(default=5, ge=1, le=20, description="Number of results")
    category: Optional[str] = Field(None, description="Video category filter")

class YouTubeSearchResponse(BaseModel):
    query: str = Field(..., description="Search query")
    videos: List[Dict[str, Any]] = Field(..., description="Found videos")
    total_results: int = Field(..., description="Number of videos found")

# User Models - Use simple email validation instead of EmailStr
class UserBase(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    username: str = Field(..., min_length=3, max_length=50)
    fitness_level: FitnessLevel = Field(default=FitnessLevel.BEGINNER)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Conversation Models
class MessageBase(BaseModel):
    content: str
    is_user: bool = True
    message_metadata: Optional[Dict[str, Any]] = None  # Changed from 'metadata'

class MessageResponse(MessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    messages: List[MessageResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True