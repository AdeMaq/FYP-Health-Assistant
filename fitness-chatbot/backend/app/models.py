from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    fitness_level = Column(String(50), default="beginner")
    age = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)  # in kg
    height = Column(Integer, nullable=True)  # in cm
    goals = Column(JSON, default=[])
    dietary_restrictions = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    conversations = relationship("Conversation", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    ai_model_used = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    content = Column(Text)
    is_user = Column(Boolean, default=True)
    message_metadata = Column(JSON, default={})  # CHANGED: 'metadata' to 'message_metadata'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_name = Column(String(100))
    plan_type = Column(String(50))  # weight_loss, muscle_gain, maintenance
    duration_weeks = Column(Integer)
    exercises = Column(JSON)  # List of exercises with sets, reps, rest
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class YouTubeVideoCache(Base):
    __tablename__ = "youtube_video_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True)
    videos = Column(JSON)  # Cached video data
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)