import httpx
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
}


async def search_track_urls(name: str, artist: str) -> list[str]:
    url = "https://www.last.fm/fr/search/tracks"
    params = {"q": f"{name} {artist}"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params, headers=HEADERS)
    except httpx.HTTPError:
        return []
    if r.status_code != 200:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    cells = soup.find_all("td", {"class": "chartlist-name"})
    if not cells:
        return []
    return [f"https://www.last.fm{cell.find('a')['href']}" for cell in cells if cell.find("a")]


async def get_tags_from_url(url: str) -> list[str]:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, headers=HEADERS)
    except httpx.HTTPError:
        return []
    if r.status_code != 200:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    tag_items = soup.find_all("li", {"class": "tag"})
    if not tag_items:
        return []
    tags = [t.find("a").get_text() for t in tag_items if t.find("a")]
    return tags[: len(tags) // 2] if tags else []


async def scrape_tags(name: str, artist: str) -> list[str]:
    urls = await search_track_urls(name, artist)
    for url in urls:
        tags = await get_tags_from_url(url)
        if tags:
            return tags
    return []
