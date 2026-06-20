from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, Response
from jose import JWTError, jwt

from app.config import settings

ALGORITHM = "HS256"
COOKIE_NAME = "sortify_session"
MAX_AGE = 60 * 60 * 6


def create_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=6))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        return None


def set_session_cookie(response: Response, payload: dict) -> None:
    token = create_token(payload)
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=settings.base_url.startswith("https"),
        path="/",
    )


def get_session(request: Request) -> dict | None:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    return decode_token(token)


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


def require_session(request: Request) -> dict:
    session = get_session(request)
    if not session:
        raise HTTPException(status_code=401, detail="unauthorized")
    return session
