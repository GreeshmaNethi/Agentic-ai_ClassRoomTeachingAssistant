from fastapi import APIRouter, Depends, HTTPException
from app import schemas, models
from app.agent.workflow import WorkflowAgent
from app.services.llm_service import generate_chat_response
from app.core.security import get_current_user

router = APIRouter()

def handle_generation_error(e: Exception) -> HTTPException:
    err_msg = str(e)
    if 'API Key is not configured' in err_msg:
        return HTTPException(status_code=503, detail="AI service is not configured. Please set GEMINI_API_KEY in the backend .env file.")
    if 'unavailable' in err_msg.lower() or '503' in err_msg:
        return HTTPException(status_code=503, detail="AI service is temporarily unavailable due to high demand. Please try again in a few minutes.")
    if '429' in err_msg or 'RESOURCE_EXHAUSTED' in err_msg:
        return HTTPException(status_code=429, detail="API rate limit reached. Please wait a moment and try again.")
    return HTTPException(status_code=500, detail=f"Generation failed: {err_msg}")

@router.post("/mcq")
def generate_mcq(req: schemas.MCQRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "mcq")
        result = agent.generate_mcqs()
        return result.model_dump()
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/quiz")
def generate_quiz(req: schemas.QuizRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "quiz")
        result = agent.generate_quiz()
        return {
            "title": result.title,
            "questions": [q.model_dump() for q in result.questions],
            "total_generated": len(result.questions),
            "requested": req.num_questions,
        }
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/assignment")
def generate_assignment(req: schemas.AssignmentRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "assignment")
        result = agent.generate_assignment()
        return result.model_dump()
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/summarize")
def summarize_topic(req: schemas.SummaryRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "summary")
        result = agent.summarize_topic()
        return result.model_dump()
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/concept")
def explain_concept(req: schemas.ConceptRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "concept")
        result = agent.explain_concept()
        return result.model_dump()
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/practice")
def generate_practice(req: schemas.QuizRequest, current_user: models.User = Depends(get_current_user)):
    try:
        agent = WorkflowAgent(req.model_dump(), "quiz")
        result = agent.generate_quiz()
        return {
            "title": result.title,
            "questions": [q.model_dump() for q in result.questions],
            "total_generated": len(result.questions),
            "requested": req.num_questions,
        }
    except Exception as e:
        raise handle_generation_error(e)

@router.post("/chat")
def chat_with_assistant(req: schemas.ChatRequest, current_user: models.User = Depends(get_current_user)):
    try:
        messages = req.history.copy()
        system_instruction = "You are a helpful educational assistant."
        if req.language and req.language != "English":
            system_instruction += f" MANDATORY: Respond fully in {req.language} language."
        messages.append({"role": "user", "content": req.message})
        reply = generate_chat_response(messages, system_instruction=system_instruction)
        return {"reply": reply}
    except Exception as e:
        raise handle_generation_error(e)
