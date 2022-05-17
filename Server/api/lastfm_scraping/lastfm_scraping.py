import requests
from bs4 import BeautifulSoup

def search_track(name, album):
    header = {"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"}
    param = {
        "q": f"{name} {album}"
    }
    url = "https://www.last.fm/fr/search/tracks"
    r = requests.get(url, params=param, headers=header)
    if r.status_code != 200:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    all_url_not_process = soup.find_all("td", {"class" : "chartlist-name"})
    if not all_url_not_process:
        return []
    all_url = []
    for url_not_process in all_url_not_process:
        url = f'https://www.last.fm{url_not_process.find("a").get("href")}'
        all_url.append(url)
    return all_url

def get_tags_from_url(url):
    header = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"}
    r = requests.get(url, headers=header)
    if r.status_code != 200:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    all_tags_not_process = soup.find_all("li", {"class" : "tag"})
    if not all_tags_not_process:
        return []
    tags = []
    for tag_not_process in all_tags_not_process:
        tags.append(tag_not_process.find("a").getText())
    return tags[:len(tags) // 2]

def get_tags_from_urls(all_urls):
    for url in all_urls:
        tags = get_tags_from_url(url)
        if tags:
            return tags
    return []



if __name__ == "__main__":
    all_url = search_track("u.", "niteboi")
    print(get_tags_from_urls(all_url))
