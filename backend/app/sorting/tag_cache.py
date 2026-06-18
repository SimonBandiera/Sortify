from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import TagCache


async def get_cached_tags(db: AsyncSession, song: str, artist: str) -> list[str] | None:
    stmt = select(TagCache).where(
        TagCache.namesong == song,
        TagCache.nameartist == artist,
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if not row:
        return None
    return [t for t in [row.tag1, row.tag2, row.tag3, row.tag4] if t]


async def cache_tags(db: AsyncSession, song: str, artist: str, tags: list[str]) -> None:
    padded = (tags + ["", "", "", ""])[:4]
    entry = TagCache(
        namesong=song,
        nameartist=artist,
        tag1=padded[0],
        tag2=padded[1],
        tag3=padded[2],
        tag4=padded[3],
    )
    await db.merge(entry)
    await db.commit()
