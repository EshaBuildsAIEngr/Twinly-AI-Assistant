import json
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.config import settings
from app.models import PushSubscription


def send_push_to_user(db: Session, user_id: str, title: str, body: str, url: str = "/dashboard"):
    subs = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()

    for sub in subs:
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({"title": title, "body": body, "url": url}),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_CLAIM_EMAIL},
            )
        except WebPushException as e:
            if getattr(e.response, "status_code", None) in (404, 410):
                db.delete(sub)
                db.commit()
            else:
                print(f"[PUSH] Failed to send to {sub.endpoint[:50]}...: {e}")