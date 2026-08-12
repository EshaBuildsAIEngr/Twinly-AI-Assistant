"""
Tool layer for the agents.

Design principle: the LLM decides WHICH of these to call, IN WHAT ORDER,
and WHETHER to call them at all. Nothing here is a hardcoded "if X then Y"
business rule — that reasoning lives entirely in the model, driven by the
system prompt in orchestrator.py. This file only exposes capabilities.
"""

from sqlalchemy.orm import Session
from app.models import (
    Conversation, Message, MessageSender, ConversationStatus,
    ContentItem, ContentStatus, Platform, UsageLog, PersonaProfile
)
from app.services.embeddings_service import search_knowledge
from app.services.whatsapp_service import send_whatsapp_message
from app.services.instagram_service import send_instagram_message
from app.services.courier_service import track_order


# ---------------------------------------------------------------------------
# Tool schemas (OpenAI function-calling format)
# ---------------------------------------------------------------------------

SUPPORT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_faqs",
            "description": "Search the business's FAQs/policies to find grounded, accurate answers before replying. Always use this before answering questions about price, availability, delivery, or policy.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The customer's question, in its original language"}
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "send_reply",
            "description": "Send the final reply message to the customer on the same platform they messaged from. Only call this once you are confident in the answer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "The reply text, in the customer's language/tone"}
                },
                "required": ["message"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "offer_discount",
            "description": "Offer a percentage discount to a customer who is bargaining, if and only if bargaining is enabled for this business and the requested/offered percent is within the allowed maximum.",
            "parameters": {
                "type": "object",
                "properties": {
                    "percent": {"type": "number", "description": "Discount percent to offer, e.g. 5 for 5%"}
                },
                "required": ["percent"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "track_order",
            "description": "Look up delivery status for a customer's order using their courier tracking number, if they've asked 'where is my order'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "tracking_number": {"type": "string"},
                    "courier": {"type": "string", "description": "leopards | tcs | trax — ask the customer if unsure, default to leopards"},
                },
                "required": ["tracking_number"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_owner",
            "description": "Escalate this conversation to the human business owner instead of replying yourself. Use for complaints, custom/bulk orders, refund requests, anything requiring a judgment call, or anything outside the FAQs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Short reason for escalation, shown to the owner"}
                },
                "required": ["reason"],
            },
        },
    },
]

CONTENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_past_content_performance",
            "description": "Look at this business's past posts and their engagement stats, to see what has worked before.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "save_content_draft",
            "description": "Save a finished caption + hashtags as a draft for the owner to review.",
            "parameters": {
                "type": "object",
                "properties": {
                    "caption": {"type": "string"},
                    "hashtags": {"type": "string", "description": "space-separated hashtags"},
                },
                "required": ["caption", "hashtags"],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def tool_search_faqs(db: Session, user_id: str, query: str) -> dict:
    results = search_knowledge(db, user_id, query)
    if not results:
        return {"results": [], "note": "No matching FAQ found — do not guess, escalate if unsure."}
    return {"results": results}


def tool_send_reply(db: Session, conversation: Conversation, message: str) -> dict:
    print(f"[TOOL send_reply] Attempting to send: {message[:80]}...")
    msg = Message(conversation_id=conversation.id, sender=MessageSender.AGENT, content=message)
    db.add(msg)
    conversation.status = ConversationStatus.REPLIED
    db.add(UsageLog(user_id=conversation.user_id, action_type="reply"))
    db.commit()

    persona = db.query(PersonaProfile).filter(PersonaProfile.user_id == conversation.user_id).first()

    try:
        if conversation.platform == Platform.WHATSAPP:
            result = send_whatsapp_message(
                conversation.customer_id, message,
                phone_number_id=persona.whatsapp_phone_number_id if persona else None,
                access_token=persona.whatsapp_access_token if persona else None,
            )
            print(f"[TOOL send_reply] WhatsApp API response: {result}")
        elif conversation.platform == Platform.INSTAGRAM:
            result = send_instagram_message(
                conversation.customer_id, message,
                business_account_id=persona.instagram_business_account_id if persona else None,
                access_token=persona.instagram_access_token if persona else None,
            )
            print(f"[TOOL send_reply] Instagram API response: {result}")
    except Exception as e:
        print(f"[TOOL send_reply] SEND FAILED: {type(e).__name__}: {e}")
        return {"status": "saved_but_send_failed", "error": str(e)}

    return {"status": "sent"}


def tool_offer_discount(persona: PersonaProfile, percent: float) -> dict:
    if not persona.bargaining_allowed:
        return {"allowed": False, "note": "Bargaining is disabled for this business — do not offer a discount."}
    if percent > persona.bargaining_min_percent:
        return {
            "allowed": False,
            "note": f"Requested {percent}% exceeds the max allowed {persona.bargaining_min_percent}%. Offer the max instead, or escalate.",
        }
    return {"allowed": True, "approved_percent": percent}


def tool_track_order(tracking_number: str, courier: str = "leopards") -> dict:
    return track_order(tracking_number, courier)


def tool_escalate(db: Session, conversation: Conversation, reason: str) -> dict:
    conversation.status = ConversationStatus.ESCALATED
    db.add(Message(conversation_id=conversation.id, sender=MessageSender.AGENT,
                    content=f"[Escalated to owner: {reason}]"))
    db.commit()
    # Production upgrade path: notify owner directly on WhatsApp here.
    return {"status": "escalated"}


def tool_get_past_performance(db: Session, user_id: str) -> dict:
    posts = (
        db.query(ContentItem)
        .filter(ContentItem.user_id == user_id, ContentItem.status == ContentStatus.POSTED)
        .order_by(ContentItem.posted_at.desc())
        .limit(10)
        .all()
    )
    if not posts:
        return {"posts": [], "note": "No post history yet — use general best practices for this niche."}
    return {
        "posts": [
            {"caption": p.caption[:120], "engagement": p.engagement_stats}
            for p in posts
        ]
    }


def tool_save_draft(db: Session, user_id: str, platform: str, caption: str, hashtags: str) -> dict:
    item = ContentItem(
        user_id=user_id,
        platform=Platform(platform),
        caption=caption,
        hashtags=hashtags,
        status=ContentStatus.DRAFT,
    )
    db.add(item)
    db.add(UsageLog(user_id=user_id, action_type="content_draft"))
    db.commit()
    db.refresh(item)
    return {"status": "saved", "content_id": item.id}
