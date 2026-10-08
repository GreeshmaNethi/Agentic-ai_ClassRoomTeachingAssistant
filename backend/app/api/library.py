from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

@router.post("", response_model=schemas.MaterialResponse)
@router.post("/", response_model=schemas.MaterialResponse)
def save_material(material: schemas.MaterialCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_material = models.Material(
        title=material.title,
        type=material.type,
        content=material.content,
        user_id=current_user.id
    )
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material

@router.get("", response_model=List[schemas.MaterialResponse])
@router.get("/", response_model=List[schemas.MaterialResponse])
def get_library(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    materials = db.query(models.Material).filter(models.Material.user_id == current_user.id).order_by(models.Material.created_at.desc()).all()
    return materials

@router.get("/{material_id}", response_model=schemas.MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    material = db.query(models.Material).filter(models.Material.id == material_id, models.Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    material = db.query(models.Material).filter(models.Material.id == material_id, models.Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
