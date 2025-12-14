from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = "dummy-openai-key"
    google_api_key: str = "dummy-google-key"
    youtube_api_key: str = "dummy-youtube-key"
    gemini_api_key: str = "dummy-gemini-key"
    
    # Database
    database_url: str = "sqlite:///./fitness_chatbot.db"
    
    # App Settings
    app_name: str = "Fitness Chatbot API"
    version: str = "1.0.0"
    environment: str = "development"
    secret_key: str = "dummy-secret-key-change-in-production"
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # AI Settings
    default_ai_model: str = "openai"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False  # Allow case-insensitive matching

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()