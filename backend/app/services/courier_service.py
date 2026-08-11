"""
Local Pakistani courier tracking — stub implementation.

Each courier has its own tracking API with its own auth. This gives one
consistent interface the agent can call; wire up the real API calls once
you have accounts with the specific courier(s) you use.

Leopards Courier API docs: https://merchant.leopardscourier.com (API access on request)
TCS API: requires a corporate account + API key from TCS business team
Trax: https://trax.pk (API access via their business dashboard)
"""

import httpx
from app.config import settings


def track_order(tracking_number: str, courier: str = "leopards") -> dict:
    """Returns shipment status for a tracking number.

    This is a stub — replace the body with a real call once you have courier
    API credentials. Keeping the function signature stable means the agent
    tool layer (tools.py) doesn't need to change when you wire up the real API.
    """
    # Example shape of what a real integration would look like (Leopards):
    #
    # url = "https://merchant.leopardscourier.com/api/trackBookedPacket/format/json/"
    # params = {"api_key": settings.LEOPARDS_API_KEY, "api_password": settings.LEOPARDS_API_PASSWORD,
    #           "track_numbers": tracking_number}
    # with httpx.Client(timeout=15) as client:
    #     resp = client.get(url, params=params)
    #     resp.raise_for_status()
    #     return resp.json()

    return {
        "tracking_number": tracking_number,
        "courier": courier,
        "status": "unavailable",
        "note": "Courier API not yet connected — add credentials in courier_service.py to enable live tracking.",
    }
