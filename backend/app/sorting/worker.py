import asyncio

from app.db.database import async_session
from app.playlists.spotify_client import get_playlist_tracks
from app.sorting.scraper import scrape_tags
from app.sorting.state import sort_results
from app.sorting.tag_cache import cache_tags, get_cached_tags
from app.ws.manager import ws_manager


async def run_sort(playlist_id: str, session: dict):
    tracks = await get_playlist_tracks(playlist_id, session)
    if not tracks:
        await ws_manager.send(playlist_id, {"type": "error", "message": "no_tracks"})
        return

    total = len(tracks)
    await ws_manager.send(playlist_id, {"type": "start", "total": total})

    sorted_tracks: dict[str, set[str]] = {}
    sem = asyncio.Semaphore(4)

    async def process_track(index: int, item: dict):
        track = item.get("track")
        if not track:
            return
        name = track.get("name", "")
        artist = track.get("artists", [{}])[0].get("name", "")
        uri = track.get("uri", "")

        async with sem:
            async with async_session() as db:
                tags = await get_cached_tags(db, name, artist)

            if not tags:
                tags = await scrape_tags(name, artist)
                if tags:
                    async with async_session() as db:
                        await cache_tags(db, name, artist, tags)

            for tag in tags:
                if tag:
                    sorted_tracks.setdefault(tag, set()).add(uri)

            genre_label = tags[0] if tags else ""
            await ws_manager.broadcast_progress(
                playlist_id, index + 1, total, f"{artist} — {name}", genre_label
            )

    tasks = [process_track(i, item) for i, item in enumerate(tracks)]
    await asyncio.gather(*tasks)

    sort_results[playlist_id] = {
        "sorted_tracks": sorted_tracks,
        "total_tracks": total,
    }

    await ws_manager.send(playlist_id, {"type": "finish"})
