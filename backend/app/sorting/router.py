import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.auth.session import decode_token
from app.sorting.worker import run_sort
from app.ws.manager import ws_manager

router = APIRouter(tags=["sorting"])


@router.websocket("/ws/sort/{playlist_id}")
async def sort_websocket(websocket: WebSocket, playlist_id: str):
    token = websocket.cookies.get("sortify_session")
    session = decode_token(token) if token else None
    if not session:
        await websocket.close(code=4001, reason="unauthorized")
        return

    await ws_manager.connect(playlist_id, websocket)
    task = asyncio.create_task(run_sort(playlist_id, session))

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(playlist_id, websocket)
        task.cancel()
