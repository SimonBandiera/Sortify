from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.session import require_session
from app.playlists.spotify_client import (
    create_playlist,
    get_current_user,
    get_playlist_by_id,
    get_user_playlists,
)
from app.sorting.state import sort_results

Session = Annotated[dict, Depends(require_session)]

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


@router.get("")
async def list_playlists(session: Session):
    data = await get_user_playlists(session)
    if data is None:
        return JSONResponse({"error": "spotify_error"}, status_code=502)
    return data


@router.get("/lookup/{playlist_id}")
async def lookup_playlist(playlist_id: str, session: Session):
    data = await get_playlist_by_id(playlist_id, session)
    if data is None:
        return JSONResponse({"error": "not_found"}, status_code=404)
    return data


@router.get("/{playlist_id}/genres")
async def get_sort_result(playlist_id: str, session: Session):
    result = sort_results.get(playlist_id)
    if not result:
        return JSONResponse({"error": "not_found"}, status_code=404)
    genres = {
        genre: list(uris)
        for genre, uris in result["sorted_tracks"].items()
    }
    return {
        "genres": genres,
        "total_tracks": result["total_tracks"],
    }


@router.post("/{playlist_id}/create")
async def create_sorted_playlist(playlist_id: str, request: Request, session: Session):
    body = await request.json()
    name = body.get("name", "Sortify Playlist")
    selected_genres: list[str] = body.get("genres", [])

    result = sort_results.get(playlist_id)
    if not result:
        return JSONResponse({"error": "sort_not_found"}, status_code=404)

    uris: set[str] = set()
    for genre in selected_genres:
        if genre in result["sorted_tracks"]:
            uris.update(result["sorted_tracks"][genre])

    if not uris:
        return JSONResponse({"error": "no_tracks"}, status_code=400)

    user = await get_current_user(session)
    if not user or "id" not in user:
        return JSONResponse({"error": "spotify_error"}, status_code=502)

    playlist = await create_playlist(session, user["id"], name, list(uris))
    if not playlist:
        return JSONResponse({"error": "create_failed"}, status_code=502)

    sort_results.pop(playlist_id, None)

    playlist["owner_name"] = user.get("display_name") or user.get("id")
    return playlist
