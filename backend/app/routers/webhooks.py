import os
import tempfile
from fastapi import APIRouter, Request, Query, HTTPException, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, SessionLocal
from app.models import User, PersonaProfile, Conversation, Message, MessageSender, Platform, ConversationStatus
from app.agents.orchestrator import run_support_agent
from app.services.whatsapp_service import get_media_url, download_media
from app.services.openai_service import transcribe_audio

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


# ---------------------------------------------------------------------------
# WhatsApp
# ---------------------------------------------------------------------------

@router.get("/whatsapp")
def verify_whatsapp(
    mode: str = Query(alias="hub.mode", default=""),
    token: str = Query(alias="hub.verify_token", default=""),
    challenge: str = Query(alias="hub.challenge", default=""),
):
    """Meta calls this once when you set up the webhook URL in App settings."""
    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        return int(challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def receive_whatsapp(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    print(f"[WHATSAPP WEBHOOK] Received payload: {payload}")

    try:
        entry = payload["entry"][0]["changes"][0]["value"]
        if "messages" not in entry:
            print("[WHATSAPP WEBHOOK] No 'messages' key — likely a status update, ignoring")
            return {"status": "ignored"}

        msg_data = entry["messages"][0]
        from_number = msg_data["from"]
        phone_number_id = entry["metadata"]["phone_number_id"]
        print(f"[WHATSAPP WEBHOOK] Message from {from_number} to phone_number_id {phone_number_id}")

        user = _find_user_by_whatsapp(db, phone_number_id)
        if not user:
            print(f"[WHATSAPP WEBHOOK] No matching user found for phone_number_id {phone_number_id}")
            return {"status": "no matching account"}
        print(f"[WHATSAPP WEBHOOK] Matched user: {user.email}")

        content = _extract_whatsapp_content(msg_data)
        if content is None:
            print(f"[WHATSAPP WEBHOOK] Unsupported message type: {msg_data.get('type')}")
            return {"status": "unsupported message type"}
        print(f"[WHATSAPP WEBHOOK] Extracted content: {content}")

        _handle_incoming_message(
            db, user, platform=Platform.WHATSAPP,
            customer_id=from_number, content=content["text"],
            was_voice_note=content["was_voice_note"],
        )
        print("[WHATSAPP WEBHOOK] _handle_incoming_message completed")
    except Exception as e:
        print(f"[WHATSAPP WEBHOOK] ERROR: {type(e).__name__}: {e}")

    return {"status": "received"}


def _extract_whatsapp_content(msg_data: dict) -> dict | None:
    msg_type = msg_data.get("type")

    if msg_type == "text":
        return {"text": msg_data["text"]["body"], "was_voice_note": False}

    if msg_type == "audio":
        media_id = msg_data["audio"]["id"]
        media_url = get_media_url(media_id)
        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
            download_media(media_url, tmp.name)
            transcript = transcribe_audio(tmp.name)
        os.unlink(tmp.name)
        return {"text": transcript, "was_voice_note": True}

    return None


def _find_user_by_whatsapp(db: Session, phone_number_id: str) -> User | None:
    persona = db.query(PersonaProfile).filter(
        PersonaProfile.whatsapp_phone_number_id == phone_number_id
    ).first()
    if persona:
        return db.query(User).filter(User.id == persona.user_id).first()

    # Single-tenant fallback: if this matches the platform's own default number
    # (used before any client has connected their own), route to the first user.
    if phone_number_id == settings.WHATSAPP_PHONE_NUMBER_ID:
        return db.query(User).first()
    return None


# ---------------------------------------------------------------------------
# Instagram
# ---------------------------------------------------------------------------

@router.get("/instagram")
def verify_instagram(
    mode: str = Query(alias="hub.mode", default=""),
    token: str = Query(alias="hub.verify_token", default=""),
    challenge: str = Query(alias="hub.challenge", default=""),
):
    if mode == "subscribe" and token == settings.INSTAGRAM_VERIFY_TOKEN:
        return int(challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/instagram")
async def receive_instagram(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    print(f"[INSTAGRAM WEBHOOK] Received payload: {payload}")

    try:
        entry = payload["entry"][0]
        messaging = entry.get("messaging", [])
        if not messaging:
            print("[INSTAGRAM WEBHOOK] No 'messaging' key found in entry — ignoring")
            return {"status": "ignored"}

        event = messaging[0]
        sender_id = event["sender"]["id"]
        recipient_id = event["recipient"]["id"]  # this is the connected IG business account
        text = event.get("message", {}).get("text")
        print(f"[INSTAGRAM WEBHOOK] sender={sender_id} recipient={recipient_id} text={text}")

        if not text:
            print(f"[INSTAGRAM WEBHOOK] Unsupported message type, event: {event}")
            return {"status": "unsupported message type"}

        user = _find_user_by_instagram(db, recipient_id)
        if not user:
            print(f"[INSTAGRAM WEBHOOK] No matching user for recipient_id {recipient_id}")
            return {"status": "no matching account"}
        print(f"[INSTAGRAM WEBHOOK] Matched user: {user.email}")

        _handle_incoming_message(
            db, user, platform=Platform.INSTAGRAM,
            customer_id=sender_id, content=text, was_voice_note=False,
        )
        print("[INSTAGRAM WEBHOOK] _handle_incoming_message completed")
    except Exception as e:
        print(f"[INSTAGRAM WEBHOOK] ERROR: {type(e).__name__}: {e}")

    return {"status": "received"}


def _find_user_by_instagram(db: Session, business_account_id: str) -> User | None:
    persona = db.query(PersonaProfile).filter(
        PersonaProfile.instagram_business_account_id == business_account_id
    ).first()
    if persona:
        return db.query(User).filter(User.id == persona.user_id).first()

    print(f"[INSTAGRAM WEBHOOK] Comparing incoming '{business_account_id}' (type {type(business_account_id)}) "
          f"vs settings.INSTAGRAM_BUSINESS_ACCOUNT_ID '{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}' "
          f"(type {type(settings.INSTAGRAM_BUSINESS_ACCOUNT_ID)})")

    if business_account_id == settings.INSTAGRAM_BUSINESS_ACCOUNT_ID:
        return db.query(User).first()
    return None


# ---------------------------------------------------------------------------
# Shared handling — this is where the agent actually gets invoked
# ---------------------------------------------------------------------------

def _handle_incoming_message(db: Session, user: User, platform: Platform, customer_id: str, content: str, was_voice_note: bool):
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.customer_id == customer_id,
        Conversation.platform == platform,
    ).first()

    if not conversation:
        conversation = Conversation(
            user_id=user.id, customer_id=customer_id, platform=platform,
            status=ConversationStatus.PENDING,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    db.add(Message(
        conversation_id=conversation.id, sender=MessageSender.CUSTOMER,
        content=content, was_voice_note=was_voice_note,
    ))
    conversation.status = ConversationStatus.PENDING
    db.commit()
    db.refresh(conversation)

    persona = db.query(PersonaProfile).filter(PersonaProfile.user_id == user.id).first()

    # This is the real agentic call — the LLM takes it from here.
    run_support_agent(db, conversation, user, persona)
