import uuid
import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Enum, Boolean,
    Integer, Float, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class SubscriptionTier(str, enum.Enum):
    TRIAL = "trial"
    STARTER = "starter"
    PRO = "pro"
    EXPIRED = "expired"


class Platform(str, enum.Enum):
    WHATSAPP = "whatsapp"
    INSTAGRAM = "instagram"


class ConversationStatus(str, enum.Enum):
    PENDING = "pending"
    REPLIED = "replied"
    ESCALATED = "escalated"


class MessageSender(str, enum.Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    OWNER = "owner"


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    POSTED = "posted"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.TRIAL)
    trial_ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    persona = relationship("PersonaProfile", back_populates="user", uselist=False)
    conversations = relationship("Conversation", back_populates="user")
    content_items = relationship("ContentItem", back_populates="user")


class PersonaProfile(Base):
    __tablename__ = "persona_profiles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True)
    tone_description = Column(Text, default="")
    sample_messages = Column(JSON, default=list)  # list of example replies
    business_info = Column(Text, default="")       # products, pricing, policies
    preferred_language = Column(String, default="roman_urdu")  # roman_urdu | english | auto
    bargaining_allowed = Column(Boolean, default=False)
    bargaining_min_percent = Column(Float, default=0.0)  # max discount % agent can offer
    whatsapp_connected = Column(Boolean, default=False)
    whatsapp_phone_number_id = Column(String, nullable=True)  # this client's own WABA phone number id
    whatsapp_access_token = Column(String, nullable=True)     # this client's own long-lived token
    instagram_connected = Column(Boolean, default=False)
    instagram_business_account_id = Column(String, nullable=True)
    instagram_access_token = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="persona")


class KnowledgeItem(Base):
    """FAQ / policy entries used for RAG-grounded support replies."""
    __tablename__ = "knowledge_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # stored as list[float]
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    customer_id = Column(String, nullable=False)  # phone number or IG-scoped user id
    customer_name = Column(String, nullable=True)
    platform = Column(Enum(Platform), nullable=False)
    status = Column(Enum(ConversationStatus), default=ConversationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    conversation_id = Column(UUID(as_uuid=False), ForeignKey("conversations.id"))
    sender = Column(Enum(MessageSender), nullable=False)
    content = Column(Text, nullable=False)
    was_voice_note = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    platform = Column(Enum(Platform), nullable=False)
    caption = Column(Text, nullable=False)
    hashtags = Column(String, default="")
    status = Column(Enum(ContentStatus), default=ContentStatus.DRAFT)
    scheduled_time = Column(DateTime, nullable=True)
    posted_at = Column(DateTime, nullable=True)
    engagement_stats = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="content_items")


class UsageLog(Base):
    """Tracks replies/content generated per user per period, used for plan limits & cost control."""
    __tablename__ = "usage_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    action_type = Column(String, nullable=False)  # "reply" | "content_draft"
    created_at = Column(DateTime, default=datetime.utcnow)
