from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, PersonaProfile, KnowledgeItem
from app.schemas import PersonaUpdateRequest, PersonaResponse, KnowledgeItemCreate, KnowledgeItemResponse
from app.auth import get_current_user
from app.services.embeddings_service import add_knowledge_item
from app.schemas import PersonaUpdateRequest, PersonaResponse, KnowledgeItemCreate, KnowledgeItemResponse, BulkCatalogRequest
from app.services.embeddings_service import add_knowledge_item, generate_faqs_from_catalog
router = APIRouter(prefix="/api/persona", tags=["persona"])


@router.get("", response_model=PersonaResponse)
def get_persona(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PersonaProfile).filter(PersonaProfile.user_id == current_user.id).first()


@router.put("", response_model=PersonaResponse)
def update_persona(
    payload: PersonaUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    persona = db.query(PersonaProfile).filter(PersonaProfile.user_id == current_user.id).first()
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(persona, field, value)
    db.commit()
    db.refresh(persona)
    return persona


@router.get("/knowledge", response_model=list[KnowledgeItemResponse])
def list_knowledge(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(KnowledgeItem).filter(KnowledgeItem.user_id == current_user.id).all()


@router.post("/knowledge", response_model=KnowledgeItemResponse)
def add_knowledge(
    payload: KnowledgeItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return add_knowledge_item(db, current_user.id, payload.question, payload.answer)


@router.delete("/knowledge/{item_id}")
def delete_knowledge(item_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(KnowledgeItem).filter(
        KnowledgeItem.id == item_id, KnowledgeItem.user_id == current_user.id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

@router.post("/knowledge/bulk-from-catalog", response_model=list[KnowledgeItemResponse])
def bulk_generate_knowledge(
    payload: BulkCatalogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return generate_faqs_from_catalog(db, current_user.id, payload.raw_text)
