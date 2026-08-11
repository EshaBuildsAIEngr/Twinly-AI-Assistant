from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import User, Conversation, Message, MessageSender, ConversationStatus, PersonaProfile
from app.schemas import ConversationResponse, SendReplyRequest
from app.auth import get_current_user
from app.agents import tools as T

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Conversation).options(joinedload(Conversation.messages)).filter(
        Conversation.user_id == current_user.id
    )
    if status:
        query = query.filter(Conversation.status == status)
    return query.order_by(Conversation.updated_at.desc()).all()


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convo = db.query(Conversation).options(joinedload(Conversation.messages)).filter(
        Conversation.id == conversation_id, Conversation.user_id == current_user.id
    ).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.post("/{conversation_id}/reply")
def send_manual_reply(
    conversation_id: str,
    payload: SendReplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Used when the owner edits/overrides an escalated conversation and replies themselves."""
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id, Conversation.user_id == current_user.id
    ).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = T.tool_send_reply(db, convo, payload.content)
    convo.status = ConversationStatus.REPLIED
    db.commit()
    return result
