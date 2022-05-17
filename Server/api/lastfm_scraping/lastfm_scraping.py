import requests
from bs4 import BeautifulSoup

def search_track(name, album):
    header = {"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"}
    param = {
        "q": f"{name} {album}"
    }
    url = "https://www.last.fm/fr/search/tracks"
    r = requests.get(url, params=param, headers=header)
    soup = BeautifulSoup(r.text, "html.parser")
    print(soup.prettify())
