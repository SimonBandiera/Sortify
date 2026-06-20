import asyncio
from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.session import require_session
from app.sorting.worker import run_sort
from app.ws.manager import ws_manager

router = APIRouter(prefix="/api/sort", tags=["sorting"])

Session = Annotated[dict, Depends(require_session)]

_active_sorts: dict[str, asyncio.Task] = {}

_EMPTY = {"current": 0, "total": 0, "track": "", "genre": "", "done": False, "error": None}


@router.get("/{playlist_id}/status")
async def sort_status(playlist_id: str, session: Session):
    status = ws_manager.get_status(playlist_id)

    # Sort already finished — return it once, then clear so next visit re-sorts
    if status and (status.get("done") or status.get("error")):
        ws_manager.clear_status(playlist_id)
        _active_sorts.pop(playlist_id, None)
        return status

    # Start if not currently running
    if playlist_id not in _active_sorts or _active_sorts[playlist_id].done():
        ws_manager.clear_status(playlist_id)
        _active_sorts[playlist_id] = asyncio.create_task(run_sort(playlist_id, session))
        return dict(_EMPTY)

    return status or dict(_EMPTY)
