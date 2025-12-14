# app/main.py - COMPLETELY FIXED VERSION
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

from .config import settings
from .database import get_db, engine, Base
from .models import User, Conversation, Message

from .schemas import (
    ChatRequest, ChatResponse, 
    WorkoutPlanRequest, WorkoutPlanResponse,
    DietPlanRequest, DietPlanResponse,
    YouTubeSearchRequest, YouTubeSearchResponse,
    UserCreate, UserResponse
)

from .api.ai_providers import AIService
from .api.youtube_api import YouTubeService
from .services.chat_service import ChatService
from .crud import create_user, get_user_by_email

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI Fitness Chatbot with Multi-Model Support",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
youtube_service = YouTubeService()
chat_service = ChatService()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Fitness Chatbot API",
        "version": settings.version,
        "status": "operational",
        "features": [
            "AI-powered fitness advice",
            "Workout plan generation",
            "Diet plan creation",
            "YouTube workout videos",
            "Multi-model AI support"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Main chat endpoint for fitness queries
    """
    try:
        # Analyze the question type
        analysis = ai_service.analyze_fitness_question(request.query)
        
        # Prepare messages for AI
        messages = [
            {"role": "user", "content": request.query}
        ]
        
        # Get AI response
        ai_response = await ai_service.get_chat_response(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Check if we should also search for videos
        youtube_videos = []
        if analysis["type"] == "workout" and request.include_videos:
            youtube_videos = await youtube_service.search_videos(
                query=request.query,
                max_results=3
            )
        
        # Prepare response - FIXED: Use ai_model instead of model_used
        response = ChatResponse(
            response=ai_response["content"],
            ai_model=ai_response["model"],
            question_type=analysis["type"],
            youtube_videos=youtube_videos if youtube_videos else None,
            tokens_used=ai_response.get("tokens_used", 0)
        )
        
        # Save to database if user_id provided
        if request.user_id:
            # Save conversation logic here
            pass
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-workout-plan", response_model=WorkoutPlanResponse)
async def generate_workout_plan(
    request: WorkoutPlanRequest,
    db: Session = Depends(get_db)
):
    """
    Generate personalized workout plan
    """
    try:
        workout_plan = await ai_service.generate_workout_plan(
            user_data=request.user_data.dict() if request.user_data else {},
            goal=request.goal,
            duration=request.duration
        )
        
        # Add YouTube videos if requested
        youtube_videos = []
        if request.include_videos:
            search_query = f"{request.goal} {request.duration} workout"
            youtube_videos = await youtube_service.search_videos(
                query=search_query,
                max_results=4
            )
        
        return WorkoutPlanResponse(
            plan=workout_plan,
            youtube_videos=youtube_videos,
            generated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-diet-plan", response_model=DietPlanResponse)
async def generate_diet_plan(
    request: DietPlanRequest,
    db: Session = Depends(get_db)
):
    """
    Generate personalized diet plan
    """
    try:
        diet_plan = await ai_service.generate_diet_plan(
            user_data=request.user_data.dict() if request.user_data else {},
            goal=request.goal,
            diet_type=request.diet_type
        )
        
        return DietPlanResponse(
            plan=diet_plan,
            generated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search-videos", response_model=YouTubeSearchResponse)
async def search_videos(
    request: YouTubeSearchRequest
):
    """
    Search for workout videos on YouTube
    """
    try:
        videos = await youtube_service.search_videos(
            query=request.query,
            max_results=request.max_results
        )
        
        return YouTubeSearchResponse(
            query=request.query,
            videos=videos,
            total_results=len(videos)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video-categories")
async def get_video_categories():
    """
    Get available video categories
    """
    return [
        {"id": "cardio", "name": "Cardio & HIIT", "icon": "❤️"},
        {"id": "strength", "name": "Strength Training", "icon": "💪"},
        {"id": "yoga", "name": "Yoga & Stretching", "icon": "🧘"},
        {"id": "beginner", "name": "Beginner Friendly", "icon": "👶"},
        {"id": "advanced", "name": "Advanced Workouts", "icon": "🔥"}
    ]

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "chat":
                query = data.get("query", "")
                model = data.get("model", "openai")
                
                # Get AI response
                ai_response = await ai_service.get_chat_response(
                    messages=[{"role": "user", "content": query}],
                    model=model
                )
                
                # Send response back
                await websocket.send_json({
                    "type": "response",
                    "content": ai_response["content"],
                    "ai_model": ai_response["model"]  # Fixed: ai_model instead of model_used
                })
                
            elif message_type == "typing":
                # Handle typing indicator
                await websocket.send_json({
                    "type": "typing",
                    "status": data.get("status", True)
                })
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })

# User management endpoints
@app.post("/api/users", response_model=UserResponse)
async def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user
    """
    try:
        # Call create_user with individual parameters
        db_user = create_user(
            db=db,
            username=user.username,
            email=user.email,
            password=user.password,
            fitness_level=user.fitness_level.value if hasattr(user.fitness_level, 'value') else user.fitness_level
        )
        # Convert to response
        return UserResponse(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            fitness_level=db_user.fitness_level,
            created_at=db_user.created_at,
            is_active=db_user.is_active
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "details": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )