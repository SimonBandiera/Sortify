from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app.auth.session import get_session, set_session_cookie
from app.playlists.spotify_client import (
    create_playlist,
    get_current_user,
    get_user_playlists,
)
from app.sorting.state import sort_results

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


def _require_session(request: Request) -> dict | None:
    return get_session(request)


@router.get("")
async def list_playlists(request: Request):
    session = _require_session(request)
    if not session:
        return JSONResponse({"error": "unauthorized"}, status_code=401)

    data = await get_user_playlists(session)
    if data is None:
        return JSONResponse({"error": "spotify_error"}, status_code=502)
    return data


@router.get("/{playlist_id}/genres")
async def get_sort_result(playlist_id: str, request: Request):
    session = _require_session(request)
    if not session:
        return JSONResponse({"error": "unauthorized"}, status_code=401)

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
async def create_sorted_playlist(playlist_id: str, request: Request):
    session = _require_session(request)
    if not session:
        return JSONResponse({"error": "unauthorized"}, status_code=401)

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

    return playlist
