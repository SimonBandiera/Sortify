import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

LASTFM_API = "https://ws.audioscrobbler.com/2.0/"


async def _lastfm_request(client: httpx.AsyncClient, params: dict) -> list[str]:
    try:
        r = await client.get(LASTFM_API, params={**params, "api_key": settings.lastfm_api_key, "format": "json"})
    except httpx.HTTPError:
        return []
    if r.status_code != 200:
        return []
    data = r.json()
    tag_list = data.get("toptags", {}).get("tag", [])
    if not tag_list:
        return []
    return [t["name"] for t in tag_list[:4] if t.get("name") and int(t.get("count", 0)) > 0]


async def scrape_tags(name: str, artist: str) -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        tags = await _lastfm_request(client, {"method": "track.getTopTags", "artist": artist, "track": name})
        if tags:
            return tags
        tags = await _lastfm_request(client, {"method": "artist.getTopTags", "artist": artist})
        return tags
