from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # "teacher" or "student"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    materials = relationship("Material", back_populates="owner", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    study_materials = relationship("StudyMaterial", back_populates="user", cascade="all, delete-orphan")
    gamification = relationship("GamificationProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    type = Column(String, index=True) # "mcq", "quiz", "assignment", "summary", "concept", "practice"
    content = Column(JSON) # Store structured data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="materials")
    attempts = relationship("QuizAttempt", back_populates="material")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    topic = Column(String, index=True, nullable=True)
    difficulty = Column(String, nullable=True, default="Medium")
    score = Column(Integer, default=0)
    total = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    answers = Column(JSON, nullable=True) # User's submitted answers
    breakdown = Column(JSON, nullable=True) # {"correct_count": x, "incorrect_count": y, "weak_points": []}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="quiz_attempts")
    material = relationship("Material", back_populates="attempts")

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # "pdf", "txt"
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="study_materials")

class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=1)
    last_activity_date = Column(String, nullable=True) # "YYYY-MM-DD"
    achievements = Column(JSON, default=list) # List of badge ids: ["first_quiz", "quiz_master", ...]
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="gamification")
