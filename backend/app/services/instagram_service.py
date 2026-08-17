import httpx
from app.config import settings

GRAPH_BASE = "https://graph.instagram.com/v20.0"


def send_instagram_message(recipient_id: str, message: str, business_account_id: str = None, access_token: str = None) -> dict:
    """Sends a DM reply via Instagram Messaging API.
    NOTE: subject to the 24-hour messaging window rule.
    """
    business_account_id = business_account_id or settings.INSTAGRAM_BUSINESS_ACCOUNT_ID
    access_token = access_token or settings.INSTAGRAM_ACCESS_TOKEN

    url = f"{GRAPH_BASE}/{business_account_id}/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": message},
    }
    with httpx.Client(timeout=15) as client:
        resp = client.post(url, headers=headers, json=payload)
        if resp.status_code >= 400:
            raise Exception(f"Instagram API {resp.status_code}: {resp.text}")
        return resp.json()


def publish_post(image_url: str, caption: str) -> dict:
    """Two-step publish: create media container, then publish it."""
    headers = {"Authorization": f"Bearer {settings.INSTAGRAM_ACCESS_TOKEN}"}
    with httpx.Client(timeout=30) as client:
        create = client.post(
            f"{GRAPH_BASE}/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media",
            headers=headers,
            json={"image_url": image_url, "caption": caption},
        )
        create.raise_for_status()
        creation_id = create.json()["id"]

        publish = client.post(
            f"{GRAPH_BASE}/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish",
            headers=headers,
            json={"creation_id": creation_id},
        )
        publish.raise_for_status()
        return publish.json()
