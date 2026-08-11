from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Conversation, ConversationStatus, ContentItem, ContentStatus, UsageLog
from app.schemas import AnalyticsSummaryResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def summary(days: int = 7, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)

    replies_sent = db.query(UsageLog).filter(
        UsageLog.user_id == current_user.id,
        UsageLog.action_type == "reply",
        UsageLog.created_at >= since,
    ).count()

    messages_handled = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.updated_at >= since,
    ).count()

    escalations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.status == ConversationStatus.ESCALATED,
        Conversation.updated_at >= since,
    ).count()

    posts_published = db.query(ContentItem).filter(
        ContentItem.user_id == current_user.id,
        ContentItem.status == ContentStatus.POSTED,
        ContentItem.posted_at >= since,
    ).count()

    return AnalyticsSummaryResponse(
        messages_handled=messages_handled,
        replies_sent=replies_sent,
        escalations=escalations,
        posts_published=posts_published,
        period_days=days,
    )
