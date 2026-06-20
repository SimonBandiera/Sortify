import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)

from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.router import router as auth_router
from app.auth.session import require_session
from app.config import settings
from app.db.database import init_db
from app.playlists.router import router as playlists_router
from app.playlists.spotify_client import get_current_user
from app.sorting.router import router as sorting_router

Session = Annotated[dict, Depends(require_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Sortify API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(playlists_router)
app.include_router(sorting_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/me")
async def me(session: Session):
    user = await get_current_user(session)
    if not user:
        return JSONResponse({"error": "spotify_error"}, status_code=502)
    return user
