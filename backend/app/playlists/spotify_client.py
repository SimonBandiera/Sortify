from time import time

import httpx

from app.auth.session import create_token
from app.auth.spotify_oauth import refresh_token

SPOTIFY_API = "https://api.spotify.com/v1"


def _bearer(access_token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


async def _ensure_fresh_token(session: dict) -> dict:
    if session.get("expires_at", 0) <= int(time()):
        new_tokens = await refresh_token(session["refresh_token"])
        if new_tokens:
            session["access_token"] = new_tokens["access_token"]
            session["refresh_token"] = new_tokens["refresh_token"]
            session["expires_at"] = int(time()) + int(new_tokens["expires_in"])
    return session


async def get_user_playlists(session: dict) -> dict | None:
    session = await _ensure_fresh_token(session)
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{SPOTIFY_API}/me/playlists",
            headers=_bearer(session["access_token"]),
            params={"limit": 50},
        )
    if r.status_code != 200:
        return None
    return r.json()


async def get_playlist_tracks(playlist_id: str, session: dict) -> list | None:
    session = await _ensure_fresh_token(session)
    tracks: list = []
    offset = 0
    total = 1

    async with httpx.AsyncClient() as client:
        while offset < total:
            session = await _ensure_fresh_token(session)
            r = await client.get(
                f"{SPOTIFY_API}/playlists/{playlist_id}/tracks",
                headers=_bearer(session["access_token"]),
                params={
                    "fields": "items(track(name,uri,artists(name))),total,limit",
                    "offset": offset,
                },
            )
            if r.status_code != 200:
                return None
            data = r.json()
            total = data.get("total", 0)
            offset += 100
            tracks.extend(data.get("items", []))

    return [t for t in tracks if t.get("track") is not None]


async def get_current_user(session: dict) -> dict | None:
    session = await _ensure_fresh_token(session)
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{SPOTIFY_API}/me",
            headers=_bearer(session["access_token"]),
        )
    if r.status_code != 200:
        return None
    return r.json()


async def create_playlist(session: dict, user_id: str, name: str, uris: list[str]) -> dict | None:
    session = await _ensure_fresh_token(session)
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{SPOTIFY_API}/users/{user_id}/playlists",
            headers=_bearer(session["access_token"]),
            json={
                "name": name,
                "description": "Playlist automatically created by Sortify",
                "public": False,
            },
        )
        if r.status_code != 201:
            return None
        playlist = r.json()

        for i in range(0, len(uris), 100):
            session = await _ensure_fresh_token(session)
            batch = uris[i : i + 100]
            r = await client.post(
                f"{SPOTIFY_API}/playlists/{playlist['id']}/tracks",
                headers=_bearer(session["access_token"]),
                json={"uris": batch},
            )
            if r.status_code not in (200, 201):
                return None

        session = await _ensure_fresh_token(session)
        r = await client.get(
            f"{SPOTIFY_API}/playlists/{playlist['id']}",
            headers=_bearer(session["access_token"]),
            params={"fields": "id,name,images,tracks(total),external_urls"},
        )
        if r.status_code != 200:
            return playlist
        return r.json()
