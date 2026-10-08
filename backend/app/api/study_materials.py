from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import io
import pypdf
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user
from app.agent.workflow import WorkflowAgent
from app.api.generation import handle_generation_error

router = APIRouter()

def extract_text_from_file(filename: str, content_bytes: bytes) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext == "pdf":
        try:
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text_pages = []
            for i, page in enumerate(reader.pages[:40]): # Limit to first 40 pages for optimal extraction
                extracted = page.extract_text()
                if extracted:
                    text_pages.append(extracted)
            return "\n\n".join(text_pages).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF document: {str(e)}")
    elif ext in ["txt", "md", "csv"]:
        try:
            return content_bytes.decode("utf-8", errors="ignore").strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read text file: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or TXT document.")

@router.post("/upload", response_model=schemas.StudyMaterialResponse)
async def upload_study_material(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    filename = file.filename or "uploaded_document"
    content_bytes = await file.read()
    
    if len(content_bytes) > 20 * 1024 * 1024: # 20 MB max
        raise HTTPException(status_code=400, detail="File size exceeds maximum 20MB limit.")

    extracted_text = extract_text_from_file(filename, content_bytes)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="No readable text could be extracted from this document.")

    ext = filename.split(".")[-1].lower() if "." in filename else "txt"
    
    # Generate quick 2-line summary preview
    summary_preview = extracted_text[:250] + "..." if len(extracted_text) > 250 else extracted_text

    study_mat = models.StudyMaterial(
        user_id=current_user.id,
        filename=filename,
        file_type=ext,
        file_size=len(content_bytes),
        extracted_text=extracted_text,
        summary=summary_preview
    )
    db.add(study_mat)
    db.commit()
    db.refresh(study_mat)
    return study_mat

@router.get("", response_model=List[schemas.StudyMaterialResponse])
def get_user_study_materials(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.StudyMaterial).filter(
        models.StudyMaterial.user_id == current_user.id
    ).order_by(models.StudyMaterial.created_at.desc()).all()

@router.get("/{id}", response_model=schemas.StudyMaterialDetailResponse)
def get_study_material_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    mat = db.query(models.StudyMaterial).filter(
        models.StudyMaterial.id == id,
        models.StudyMaterial.user_id == current_user.id
    ).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
    return mat

@router.delete("/{id}")
def delete_study_material(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    mat = db.query(models.StudyMaterial).filter(
        models.StudyMaterial.id == id,
        models.StudyMaterial.user_id == current_user.id
    ).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
    db.delete(mat)
    db.commit()
    return {"message": "Study material deleted successfully."}

@router.post("/{id}/ask")
def ask_study_material(
    id: int,
    req: schemas.StudyMaterialAskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    mat = db.query(models.StudyMaterial).filter(
        models.StudyMaterial.id == id,
        models.StudyMaterial.user_id == current_user.id
    ).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")

    action = req.action_type or "ask"
    lang = req.language or "English"

    try:
        if action == "ask":
            agent = WorkflowAgent({
                "document_text": mat.extracted_text,
                "question": req.question,
                "language": lang
            }, "qna")
            res = agent.ask_document()
            return {"type": "answer", "data": res.model_dump()}

        elif action == "summarize":
            agent = WorkflowAgent({
                "topic": mat.filename,
                "source_material": mat.extracted_text,
                "length": "Detailed",
                "format": "Paragraphs",
                "language": lang
            }, "summary")
            res = agent.summarize_topic()
            return {"type": "summary", "data": res.model_dump()}

        elif action == "mcq":
            agent = WorkflowAgent({
                "topic": mat.filename,
                "source_material": mat.extracted_text,
                "num_questions": 5,
                "difficulty": "Medium",
                "num_options": 4,
                "language": lang
            }, "mcq")
            res = agent.generate_mcqs()
            return {"type": "mcq", "data": res.model_dump()}

        elif action == "quiz":
            agent = WorkflowAgent({
                "topic": mat.filename,
                "source_material": mat.extracted_text,
                "num_questions": 5,
                "difficulty": "Medium",
                "question_type": "MCQ",
                "language": lang
            }, "quiz")
            res = agent.generate_quiz()
            return {"type": "quiz", "data": res.model_dump()}

        elif action == "explain_simply":
            agent = WorkflowAgent({
                "topic": f"Key concepts in {mat.filename}",
                "source_material": mat.extracted_text,
                "style": "Simple",
                "include_example": True,
                "language": lang
            }, "concept")
            res = agent.explain_concept()
            return {"type": "concept", "data": res.model_dump()}

        elif action == "important_questions":
            agent = WorkflowAgent({
                "topic": mat.filename,
                "document_text": mat.extracted_text,
                "language": lang
            }, "important_questions")
            res = agent.generate_important_questions()
            return {"type": "important_questions", "data": res.model_dump()}

        else:
            raise HTTPException(status_code=400, detail="Invalid action type requested.")

    except Exception as e:
        raise handle_generation_error(e)
