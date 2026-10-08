from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str # "teacher" or "student"
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: EmailStr
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None

class TokenData(BaseModel):
    email: Optional[str] = None

# Generation Request Schemas
class GenerationRequest(BaseModel):
    topic: str
    educational_level: str = "High School"
    source_material: Optional[str] = None
    language: Optional[str] = "English" # "English", "Telugu", "Hindi"

class MCQRequest(GenerationRequest):
    difficulty: str = "Medium"
    num_questions: int = 5
    num_options: int = 4

class QuizRequest(GenerationRequest):
    difficulty: str = "Medium"
    num_questions: int = 5
    question_type: str = "MCQ" # "MCQ", "True/False", "Short Answer"

class AssignmentRequest(GenerationRequest):
    assignment_type: str = "Essay"
    difficulty: str = "Medium"
    num_tasks: int = 3
    learning_objectives: str = ""
    instructions: Optional[str] = None

class SummaryRequest(GenerationRequest):
    length: str = "Medium" # "Short", "Medium", "Detailed"
    format: str = "Paragraphs" # "Paragraphs", "Bullet Points"

class ConceptRequest(GenerationRequest):
    style: str = "Simple" # "Simple", "Step-by-Step", "Detailed"
    include_example: bool = True

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    language: Optional[str] = "English"

# Material Schemas
class MaterialCreate(BaseModel):
    title: str
    type: str
    content: Any

class MaterialResponse(BaseModel):
    id: int
    title: str
    type: str
    content: Any
    created_at: datetime
    
    class Config:
        from_attributes = True

# Study Material Schemas
class StudyMaterialResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StudyMaterialDetailResponse(StudyMaterialResponse):
    extracted_text: str

class StudyMaterialAskRequest(BaseModel):
    question: str
    action_type: Optional[str] = "ask" # "ask", "summarize", "mcq", "quiz", "explain_simply", "important_questions"
    language: Optional[str] = "English"

# Quiz Submission / Practice Logging
class QuizSubmission(BaseModel):
    material_id: Optional[int] = None
    topic: str
    difficulty: str = "Medium"
    score: int
    total: int
    answers: Optional[List[Dict[str, Any]]] = None
    weak_points: Optional[List[str]] = None

class QuizAttemptResponse(BaseModel):
    id: int
    topic: Optional[str]
    difficulty: Optional[str]
    score: int
    total: int
    percentage: float
    created_at: datetime

    class Config:
        from_attributes = True

# Student Progress & Recommendations
class StudentProgressResponse(BaseModel):
    quizzes_attempted: int
    average_score: float
    questions_answered: int
    total_correct: int
    accuracy: float
    strong_topics: List[Dict[str, Any]]
    weak_topics: List[Dict[str, Any]]
    completed_topics: List[str]
    recent_activity: List[Dict[str, Any]]
    recommended_next_topic: Optional[str]
    recommended_difficulty: str

class RecommendationResponse(BaseModel):
    recommended_topics: List[Dict[str, Any]]
    weak_topics_to_revise: List[str]
    suggested_difficulty: str
    learning_streak: int

# Gamification
class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[str] = None

class GamificationResponse(BaseModel):
    xp: int
    level: int
    streak_days: int
    achievements: List[Achievement]
    completed_quizzes_count: int

# Teacher Analytics
class TeacherAnalyticsResponse(BaseModel):
    total_students: int
    total_quizzes_attempted: int
    average_class_score: float
    frequently_incorrect_topics: List[Dict[str, Any]]
    recent_student_activity: List[Dict[str, Any]]
    topic_performance_breakdown: List[Dict[str, Any]]
