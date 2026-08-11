from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ContentItem, PersonaProfile
from app.schemas import ContentGenerateRequest, ContentItemResponse, ContentUpdateRequest
from app.auth import get_current_user
from app.agents.orchestrator import run_content_agent

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("", response_model=list[ContentItemResponse])
def list_content(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ContentItem).filter(ContentItem.user_id == current_user.id).order_by(
        ContentItem.created_at.desc()
    ).all()


@router.post("/generate", response_model=dict)
def generate_content(
    payload: ContentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Triggers the real Content Agent loop — the LLM decides what to write,
    checks past performance itself, and saves the draft."""
    persona = db.query(PersonaProfile).filter(PersonaProfile.user_id == current_user.id).first()
    result = run_content_agent(db, current_user, persona, payload.platform, payload.topic_hint)
    return result


@router.patch("/{content_id}", response_model=ContentItemResponse)
def update_content(
    content_id: str,
    payload: ContentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id, ContentItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{content_id}")
def delete_content(content_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ContentItem).filter(
        ContentItem.id == content_id, ContentItem.user_id == current_user.id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}
