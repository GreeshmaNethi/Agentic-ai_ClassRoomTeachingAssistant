from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, generation, library, study_materials, student_progress, teacher_analytics
from app.database import engine, Base
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(generation.router, prefix=f"{settings.API_V1_STR}/generate", tags=["generation"])
app.include_router(library.router, prefix=f"{settings.API_V1_STR}/library", tags=["library"])
app.include_router(study_materials.router, prefix=f"{settings.API_V1_STR}/study-materials", tags=["study-materials"])
app.include_router(student_progress.router, prefix=f"{settings.API_V1_STR}/student", tags=["student"])
app.include_router(teacher_analytics.router, prefix=f"{settings.API_V1_STR}/teacher", tags=["teacher"])

@app.get("/")
def root():
    return {"message": "Welcome to Agentic AI Classroom Teaching Assistant API"}
