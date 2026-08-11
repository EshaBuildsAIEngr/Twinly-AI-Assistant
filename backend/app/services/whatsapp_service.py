import httpx
from app.config import settings

GRAPH_BASE = "https://graph.facebook.com/v20.0"


def send_whatsapp_message(to: str, message: str, phone_number_id: str = None, access_token: str = None) -> dict:
    """Sends a free-form text message via WhatsApp Cloud API.
    NOTE: only works within the 24-hour customer service window, or with an
    approved template outside that window.

    phone_number_id/access_token let each connected client use their own
    WhatsApp number; falls back to the platform default (.env) for single-tenant use.
    """
    phone_number_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
    access_token = access_token or settings.WHATSAPP_ACCESS_TOKEN

    url = f"{GRAPH_BASE}/{phone_number_id}/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": message},
    }
    with httpx.Client(timeout=15) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()


def get_media_url(media_id: str) -> str:
    url = f"{GRAPH_BASE}/{media_id}"
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}
    with httpx.Client(timeout=15) as client:
        resp = client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()["url"]


def download_media(media_url: str, dest_path: str) -> str:
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}
    with httpx.Client(timeout=30) as client:
        resp = client.get(media_url, headers=headers)
        resp.raise_for_status()
        with open(dest_path, "wb") as f:
            f.write(resp.content)
    return dest_path
