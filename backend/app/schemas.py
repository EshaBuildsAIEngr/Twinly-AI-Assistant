from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---- Auth ----
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    business_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    business_name: str
    subscription_tier: str
    trial_ends_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---- Persona ----
class PersonaUpdateRequest(BaseModel):
    tone_description: Optional[str] = None
    sample_messages: Optional[List[str]] = None
    business_info: Optional[str] = None
    preferred_language: Optional[str] = None
    bargaining_allowed: Optional[bool] = None
    bargaining_min_percent: Optional[float] = None


class PersonaResponse(BaseModel):
    tone_description: str
    sample_messages: list
    business_info: str
    preferred_language: str
    bargaining_allowed: bool
    bargaining_min_percent: float
    whatsapp_connected: bool
    instagram_connected: bool

    class Config:
        from_attributes = True


# ---- Knowledge / FAQ ----
class KnowledgeItemCreate(BaseModel):
    question: str
    answer: str


class KnowledgeItemResponse(BaseModel):
    id: str
    question: str
    answer: str

    class Config:
        from_attributes = True


# ---- Conversations ----
class MessageResponse(BaseModel):
    id: str
    sender: str
    content: str
    was_voice_note: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: Optional[str]
    platform: str
    status: str
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class SendReplyRequest(BaseModel):
    content: str


# ---- Content ----
class ContentGenerateRequest(BaseModel):
    platform: str
    topic_hint: Optional[str] = None


class ContentItemResponse(BaseModel):
    id: str
    platform: str
    caption: str
    hashtags: str
    status: str
    scheduled_time: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ContentUpdateRequest(BaseModel):
    caption: Optional[str] = None
    hashtags: Optional[str] = None
    status: Optional[str] = None
    scheduled_time: Optional[datetime] = None


# ---- Analytics ----
class AnalyticsSummaryResponse(BaseModel):
    messages_handled: int
    replies_sent: int
    escalations: int
    posts_published: int
    period_days: int
