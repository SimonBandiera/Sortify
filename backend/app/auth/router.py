from time import time

from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse

from app.auth.session import clear_session_cookie, set_session_cookie
from app.auth.spotify_oauth import exchange_code
from app.config import settings

router = APIRouter(tags=["auth"])


@router.get("/spotify/callback")
async def spotify_callback(request: Request, code: str | None = None, error: str | None = None):
    if error:
        return RedirectResponse(f"{settings.base_url}/?error={error}")
    if not code:
        return RedirectResponse(settings.base_url)

    token_data = await exchange_code(code)
    if not token_data:
        return RedirectResponse(f"{settings.base_url}/?error=token_exchange_failed")

    response = RedirectResponse(f"{settings.base_url}/dashboard")
    set_session_cookie(response, {
        "access_token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "expires_at": int(time()) + int(token_data["expires_in"]),
    })
    return response


@router.get("/auth/logout")
async def logout():
    response = RedirectResponse(settings.base_url)
    clear_session_cookie(response)
    return response
