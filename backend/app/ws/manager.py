import asyncio
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, playlist_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[playlist_id].append(ws)

    def disconnect(self, playlist_id: str, ws: WebSocket):
        self._connections[playlist_id] = [
            c for c in self._connections[playlist_id] if c is not ws
        ]
        if not self._connections[playlist_id]:
            del self._connections[playlist_id]

    async def send(self, playlist_id: str, data: dict):
        for ws in self._connections.get(playlist_id, []):
            try:
                await ws.send_json(data)
            except Exception:
                pass

    async def broadcast_progress(self, playlist_id: str, current: int, total: int, track: str, genre: str):
        await self.send(playlist_id, {
            "type": "progress",
            "current": current,
            "total": total,
            "track": track,
            "genre": genre,
        })


ws_manager = ConnectionManager()
