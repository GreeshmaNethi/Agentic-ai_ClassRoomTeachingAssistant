from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic AI Classroom Teaching Assistant"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Supports PostgreSQL (Render) via DATABASE_URL, falls back to SQLite locally
    DATABASE_URL: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./teaching_assistant.db"
    
    GEMINI_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    def get_database_uri(self) -> str:
        if self.DATABASE_URL:
            # Render gives postgres:// but SQLAlchemy needs postgresql://
            uri = self.DATABASE_URL
            if uri.startswith("postgres://"):
                uri = uri.replace("postgres://", "postgresql://", 1)
            return uri
        return self.SQLALCHEMY_DATABASE_URI

settings = Settings()
