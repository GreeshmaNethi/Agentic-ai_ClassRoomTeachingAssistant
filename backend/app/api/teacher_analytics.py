from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

@router.get("/analytics", response_model=schemas.TeacherAnalyticsResponse)
def get_teacher_class_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Retrieve all student users
    student_users = db.query(models.User).filter(models.User.role == "student").all()
    student_ids = [s.id for s in student_users]
    total_students = len(student_users)

    # Get all quiz attempts from students (or all attempts if few students exist)
    attempts = db.query(models.QuizAttempt).all()
    total_attempts = len(attempts)

    if not attempts:
        return schemas.TeacherAnalyticsResponse(
            total_students=total_students,
            total_quizzes_attempted=0,
            average_class_score=0.0,
            frequently_incorrect_topics=[],
            recent_student_activity=[],
            topic_performance_breakdown=[]
        )

    avg_score = round(sum(a.percentage for a in attempts) / total_attempts, 1)

    # Group by topic
    topic_data: Dict[str, Dict[str, Any]] = {}
    for a in attempts:
        t = (a.topic or "General Assessment").strip()
        if t not in topic_data:
            topic_data[t] = {
                "topic": t,
                "total_attempts": 0,
                "total_score": 0,
                "total_questions": 0,
                "scores": []
            }
        topic_data[t]["total_attempts"] += 1
        topic_data[t]["total_score"] += a.score
        topic_data[t]["total_questions"] += a.total
        topic_data[t]["scores"].append(a.percentage)

    topic_breakdown = []
    freq_incorrect = []

    for t, val in topic_data.items():
        topic_avg = round(sum(val["scores"]) / len(val["scores"]), 1)
        item = {
            "topic": t,
            "average_score": topic_avg,
            "attempts": val["total_attempts"],
            "difficulty": "Challenging" if topic_avg < 60 else ("Moderate" if topic_avg < 80 else "Mastered")
        }
        topic_breakdown.append(item)
        if topic_avg < 65:
            freq_incorrect.append(item)

    freq_incorrect.sort(key=lambda x: x["average_score"])
    topic_breakdown.sort(key=lambda x: x["attempts"], reverse=True)

    # Recent student activity
    recent_activity = []
    for a in attempts[-10:]:
        u = db.query(models.User).filter(models.User.id == a.user_id).first()
        recent_activity.append({
            "id": a.id,
            "student_name": u.name or u.email.split("@")[0] if u else "Student",
            "student_email": u.email if u else "student@edu.com",
            "topic": a.topic or "Quiz",
            "score": a.score,
            "total": a.total,
            "percentage": a.percentage,
            "date": a.created_at.strftime("%b %d, %Y %H:%M")
        })

    return schemas.TeacherAnalyticsResponse(
        total_students=total_students,
        total_quizzes_attempted=total_attempts,
        average_class_score=avg_score,
        frequently_incorrect_topics=freq_incorrect,
        recent_student_activity=list(reversed(recent_activity)),
        topic_performance_breakdown=topic_breakdown
    )
