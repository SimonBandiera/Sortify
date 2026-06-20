import asyncio
from collections import defaultdict

_EMPTY: dict = {"current": 0, "total": 0, "track": "", "genre": "", "done": False, "error": None}


class SSEManager:
    def __init__(self):
        self._queues: dict[str, list[asyncio.Queue]] = defaultdict(list)
        self._status: dict[str, dict] = {}

    def get_status(self, playlist_id: str) -> dict | None:
        return self._status.get(playlist_id)

    def clear_status(self, playlist_id: str) -> None:
        self._status.pop(playlist_id, None)

    async def send(self, playlist_id: str, data: dict):
        s = self._status.setdefault(playlist_id, dict(_EMPTY))
        t = data.get("type")
        if t == "start":
            s["total"] = data.get("total", 0)
        elif t == "progress":
            for k in ("current", "total", "track", "genre"):
                if k in data:
                    s[k] = data[k]
        elif t == "finish":
            s["done"] = True
        elif t == "error":
            s["error"] = data.get("message", "unknown")
        for q in list(self._queues.get(playlist_id, [])):
            await q.put(data)

    async def broadcast_progress(self, playlist_id: str, current: int, total: int, track: str, genre: str):
        await self.send(playlist_id, {
            "type": "progress",
            "current": current,
            "total": total,
            "track": track,
            "genre": genre,
        })


ws_manager = SSEManager()
