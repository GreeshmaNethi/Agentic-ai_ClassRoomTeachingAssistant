from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List, Dict, Any
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

ACHIEVEMENTS_CONFIG = [
    {
        "id": "first_quiz",
        "title": "First Step",
        "description": "Completed your first quiz or practice set.",
        "icon": "Award"
    },
    {
        "id": "ten_questions",
        "title": "Knowledge Seeker",
        "description": "Answered 10 or more questions in practice.",
        "icon": "Target"
    },
    {
        "id": "quiz_master",
        "title": "Quiz Master",
        "description": "Completed 5 separate quizzes successfully.",
        "icon": "Trophy"
    },
    {
        "id": "perfect_score",
        "title": "Flawless Performance",
        "description": "Scored a perfect 100% on a quiz attempt.",
        "icon": "Sparkles"
    },
    {
        "id": "study_material_pro",
        "title": "Document Scholar",
        "description": "Uploaded and analyzed study materials with AI.",
        "icon": "BookOpen"
    }
]

def update_student_gamification(db: Session, user: models.User, score: int, total: int):
    profile = db.query(models.GamificationProfile).filter(
        models.GamificationProfile.user_id == user.id
    ).first()

    today_str = date.today().isoformat()

    if not profile:
        profile = models.GamificationProfile(
            user_id=user.id,
            xp=0,
            level=1,
            streak_days=1,
            last_activity_date=today_str,
            achievements=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Calculate XP: 10 XP per question + 20 XP bonus per correct answer
    earned_xp = (total * 10) + (score * 20)
    profile.xp = (profile.xp or 0) + earned_xp
    profile.level = max(1, (profile.xp // 250) + 1)

    # Streak calculation
    if profile.last_activity_date:
        try:
            last_d = date.fromisoformat(profile.last_activity_date)
            diff = (date.today() - last_d).days
            if diff == 1:
                profile.streak_days = (profile.streak_days or 1) + 1
            elif diff > 1:
                profile.streak_days = 1
        except Exception:
            profile.streak_days = 1
    else:
        profile.streak_days = 1
    profile.last_activity_date = today_str

    # Achievements check
    unlocked = list(profile.achievements or [])
    attempts_count = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == user.id).count()
    total_answered = db.query(func.sum(models.QuizAttempt.total)).filter(models.QuizAttempt.user_id == user.id).scalar() or 0

    if attempts_count >= 1 and "first_quiz" not in unlocked:
        unlocked.append("first_quiz")
    if total_answered >= 10 and "ten_questions" not in unlocked:
        unlocked.append("ten_questions")
    if attempts_count >= 5 and "quiz_master" not in unlocked:
        unlocked.append("quiz_master")
    if total > 0 and score == total and "perfect_score" not in unlocked:
        unlocked.append("perfect_score")

    profile.achievements = unlocked
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/quiz/submit", response_model=schemas.QuizAttemptResponse)
def record_quiz_submission(
    sub: schemas.QuizSubmission,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    percentage = (sub.score / sub.total * 100.0) if sub.total > 0 else 0.0

    attempt = models.QuizAttempt(
        user_id=current_user.id,
        material_id=sub.material_id,
        topic=sub.topic.strip(),
        difficulty=sub.difficulty,
        score=sub.score,
        total=sub.total,
        percentage=round(percentage, 1),
        answers=sub.answers or [],
        breakdown={
            "correct": sub.score,
            "incorrect": max(0, sub.total - sub.score),
            "weak_points": sub.weak_points or []
        }
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Update Gamification (XP, Streak, Badges)
    update_student_gamification(db, current_user, sub.score, sub.total)

    return attempt

@router.get("/progress", response_model=schemas.StudentProgressResponse)
def get_student_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id
    ).order_by(models.QuizAttempt.created_at.desc()).all()

    if not attempts:
        return schemas.StudentProgressResponse(
            quizzes_attempted=0,
            average_score=0.0,
            questions_answered=0,
            total_correct=0,
            accuracy=0.0,
            strong_topics=[],
            weak_topics=[],
            completed_topics=[],
            recent_activity=[],
            recommended_next_topic=None,
            recommended_difficulty="Medium"
        )

    quizzes_attempted = len(attempts)
    questions_answered = sum(a.total for a in attempts)
    total_correct = sum(a.score for a in attempts)
    avg_score = round(sum(a.percentage for a in attempts) / quizzes_attempted, 1)
    accuracy = round((total_correct / questions_answered * 100.0), 1) if questions_answered > 0 else 0.0

    # Aggregate topic statistics
    topic_stats: Dict[str, Dict[str, Any]] = {}
    for a in attempts:
        t = (a.topic or "General Assessment").strip()
        if t not in topic_stats:
            topic_stats[t] = {"topic": t, "attempts": 0, "total_score": 0, "total_questions": 0}
        topic_stats[t]["attempts"] += 1
        topic_stats[t]["total_score"] += a.score
        topic_stats[t]["total_questions"] += a.total

    strong_topics = []
    weak_topics = []
    completed_topics = list(topic_stats.keys())

    for t, data in topic_stats.items():
        rate = (data["total_score"] / data["total_questions"] * 100.0) if data["total_questions"] > 0 else 0.0
        item = {
            "topic": t,
            "accuracy": round(rate, 1),
            "attempts": data["attempts"],
            "total_questions": data["total_questions"]
        }
        if rate >= 70.0:
            strong_topics.append(item)
        else:
            weak_topics.append(item)

    strong_topics.sort(key=lambda x: x["accuracy"], reverse=True)
    weak_topics.sort(key=lambda x: x["accuracy"])

    # Recent activity
    recent_activity = []
    for a in attempts[:8]:
        recent_activity.append({
            "id": a.id,
            "topic": a.topic or "Quiz",
            "difficulty": a.difficulty or "Medium",
            "score": a.score,
            "total": a.total,
            "percentage": a.percentage,
            "date": a.created_at.strftime("%b %d, %Y")
        })

    # Recommended next topic & difficulty
    rec_topic = weak_topics[0]["topic"] if weak_topics else (completed_topics[0] if completed_topics else None)
    rec_diff = "Hard" if accuracy >= 80 else ("Medium" if accuracy >= 50 else "Easy")

    return schemas.StudentProgressResponse(
        quizzes_attempted=quizzes_attempted,
        average_score=avg_score,
        questions_answered=questions_answered,
        total_correct=total_correct,
        accuracy=accuracy,
        strong_topics=strong_topics,
        weak_topics=weak_topics,
        completed_topics=completed_topics,
        recent_activity=recent_activity,
        recommended_next_topic=rec_topic,
        recommended_difficulty=rec_diff
    )

@router.get("/recommendations", response_model=schemas.RecommendationResponse)
def get_personalized_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id
    ).all()

    profile = db.query(models.GamificationProfile).filter(
        models.GamificationProfile.user_id == current_user.id
    ).first()
    streak = profile.streak_days if profile else 1

    if not attempts:
        return schemas.RecommendationResponse(
            recommended_topics=[
                {"topic": "Data Structures & Algorithms", "reason": "Recommended foundational CS syllabus topic", "difficulty": "Medium"},
                {"topic": "Operating Systems: Process Management", "reason": "High frequency conceptual questions", "difficulty": "Medium"},
                {"topic": "Database Normalization", "reason": "Core curriculum topic for self-evaluation", "difficulty": "Easy"}
            ],
            weak_topics_to_revise=[],
            suggested_difficulty="Medium",
            learning_streak=streak
        )

    # Find weak topics
    topic_scores: Dict[str, List[float]] = {}
    for a in attempts:
        t = (a.topic or "General").strip()
        if t not in topic_scores: topic_scores[t] = []
        topic_scores[t].append(a.percentage)

    weak = []
    strong = []
    for t, scores in topic_scores.items():
        avg = sum(scores) / len(scores)
        if avg < 65:
            weak.append((t, avg))
        else:
            strong.append((t, avg))

    weak.sort(key=lambda x: x[1])
    strong.sort(key=lambda x: x[1], reverse=True)

    recommendations = []
    for t, avg in weak[:3]:
        recommendations.append({
            "topic": t,
            "reason": f"Needs revision: your current accuracy is {round(avg, 1)}%",
            "difficulty": "Medium" if avg > 40 else "Easy"
        })

    # If student is doing great in strong topics, challenge them with harder difficulty
    for t, avg in strong[:2]:
        recommendations.append({
            "topic": t,
            "reason": f"Mastery challenge: you have {round(avg, 1)}% accuracy! Level up.",
            "difficulty": "Hard"
        })

    overall_avg = sum(a.percentage for a in attempts) / len(attempts)
    sugg_diff = "Hard" if overall_avg >= 75 else ("Medium" if overall_avg >= 50 else "Easy")

    return schemas.RecommendationResponse(
        recommended_topics=recommendations,
        weak_topics_to_revise=[w[0] for w in weak],
        suggested_difficulty=sugg_diff,
        learning_streak=streak
    )

@router.get("/gamification", response_model=schemas.GamificationResponse)
def get_gamification_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.GamificationProfile).filter(
        models.GamificationProfile.user_id == current_user.id
    ).first()

    today_str = date.today().isoformat()
    if not profile:
        profile = models.GamificationProfile(
            user_id=current_user.id,
            xp=0,
            level=1,
            streak_days=1,
            last_activity_date=today_str,
            achievements=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    completed_count = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id
    ).count()

    unlocked_set = set(profile.achievements or [])
    achievements_list = []
    for ach in ACHIEVEMENTS_CONFIG:
        achievements_list.append(schemas.Achievement(
            id=ach["id"],
            title=ach["title"],
            description=ach["description"],
            icon=ach["icon"],
            unlocked=(ach["id"] in unlocked_set)
        ))

    return schemas.GamificationResponse(
        xp=profile.xp or 0,
        level=profile.level or 1,
        streak_days=profile.streak_days or 1,
        achievements=achievements_list,
        completed_quizzes_count=completed_count
    )
