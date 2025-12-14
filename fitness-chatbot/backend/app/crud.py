# app/crud.py - FIXED VERSION
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, email: str, password: str, fitness_level: str = "beginner"):
    hashed_password = pwd_context.hash(password)
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        fitness_level=fitness_level
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_conversation(db: Session, title: str, user_id: int = None, ai_model_used: str = "openai"):
    db_conversation = models.Conversation(
        user_id=user_id,
        title=title,
        ai_model_used=ai_model_used
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def create_message(db: Session, conversation_id: int, content: str, is_user: bool = True, metadata: dict = None):
    db_message = models.Message(
        conversation_id=conversation_id,
        content=content,
        is_user=is_user,
        message_metadata=metadata or {}
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_user_conversations(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Conversation).filter(
        models.Conversation.user_id == user_id
    ).offset(skip).limit(limit).all()

def get_conversation_messages(db: Session, conversation_id: int):
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at).all()

def create_workout_plan(db: Session, plan_data: dict, user_id: int = None):
    db_plan = models.WorkoutPlan(
        user_id=user_id,
        plan_name=plan_data.get("plan_name", "Workout Plan"),
        plan_type=plan_data.get("plan_type", "general"),
        duration_weeks=plan_data.get("duration_weeks", 1),
        exercises=plan_data.get("exercises", {})
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_user_workout_plans(db: Session, user_id: int):
    return db.query(models.WorkoutPlan).filter(
        models.WorkoutPlan.user_id == user_id
    ).order_by(models.WorkoutPlan.created_at.desc()).all()