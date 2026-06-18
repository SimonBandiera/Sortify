import base64

import httpx

from app.config import settings

TOKEN_URL = "https://accounts.spotify.com/api/token"


def _basic_header() -> dict[str, str]:
    creds = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
    b64 = base64.b64encode(creds.encode()).decode()
    return {
        "Authorization": f"Basic {b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }


async def exchange_code(code: str) -> dict | None:
    data = {
        "code": code,
        "redirect_uri": f"{settings.base_url}/spotify/callback",
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(TOKEN_URL, data=data, headers=_basic_header())
    if r.status_code != 200:
        return None
    return r.json()


async def refresh_token(refresh: str) -> dict | None:
    data = {
        "refresh_token": refresh,
        "grant_type": "refresh_token",
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(TOKEN_URL, data=data, headers=_basic_header())
    if r.status_code != 200:
        return None
    result = r.json()
    if "refresh_token" not in result:
        result["refresh_token"] = refresh
    return result
