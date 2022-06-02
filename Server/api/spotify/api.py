import pprint

from api.spotify.key import ClientSecret, ClientID, header_basic, basic
import requests
from time import time
import os

if "FLASK_ENV" in os.environ and os.environ["FLASK_ENV"] == "development":
    BASE_URL = "http://localhost:5000"
else:
    BASE_URL = "https://www.sortify.fr"


def check_refresh(user):
    if user.expires_in <= time():
        token = refresh_access_token(user)
        if token == {}:
            return 1
        user.user_update_token(token)
    return 0

def get_access_token(code):
    param = {
        'code': code,
        'redirect_uri': f"{BASE_URL}/spotify/callback",
        'grant_type': 'authorization_code'
    }
    r = requests.post('https://accounts.spotify.com/api/token', params=param, headers=header_basic)
    if r.status_code != 200:
        return {}
    return r.json()


def refresh_access_token(user):
    param = {
        'refresh_token': user.refresh_token,
        'grant_type': 'refresh_token'
    }
    r = requests.post('https://accounts.spotify.com/api/token', params=param, headers=header_basic)
    if r.status_code != 200:
        return {}
    data = r.json()
    data["refresh_token"] = user.refresh_token
    return data


def get_user_playlist(user):
    user.next_dashboard = None
    user.prev_dashboard = None
    if check_refresh(user):
        return {}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    r = requests.get(user.dashboard_url, headers=bearer)
    if r.status_code != 200:
        return {}
    value = r.json()
    user.dashboard_next = value["next"]
    user.dashboard_prev = value["previous"]
    return r.json()


def get_playlist_track(playlist_id, user):
    tracks = []
    param = {"fields": "items(track(name,uri,artists(name))),total,limit",
             "offset": 0}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    maximum = 1
    while param["offset"] < maximum:
        if check_refresh(user):
            return {}
        r = requests.get(f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks", params=param, headers=bearer)
        if r.status_code != 200:
            return {}
        maximum = r.json()["total"]
        param["offset"] += 100
        tracks += r.json()["items"]

    liste = []
    for track in tracks:
        if track["track"] is not None and "album" not in track["track"]:
            liste.append(track)
    return liste


def create_playlist(user, songs, name):
    if check_refresh(user):
        return {}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    r = requests.get("https://api.spotify.com/v1/me", headers=bearer)
    if r.status_code != 200:
        return {}
    data = r.json()
    if "id" not in data:
        return {}
    user_id = data["id"]
    datas = {
        "name": name,
        "description": "Playlist automatically create by Sortify (sortify.fr)",
        "public": False
    }
    if check_refresh(user):
        return {}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    r = requests.post(f"https://api.spotify.com/v1/users/{user_id}/playlists", headers=bearer, json=datas)
    if r.status_code != 201:
        return {}
    info = r.json()
    if check_refresh(user):
        return {}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    act = 0
    maximum = len(songs)
    songs = list(songs)
    while act < maximum:
        params = {
            'uris': ",".join(songs[act: min(maximum, act + 50)])
        }
        if check_refresh(user):
            return {}
        r = requests.post(f"https://api.spotify.com/v1/playlists/{info['id']}/tracks", headers=bearer, params=params)
        if r.status_code != 201:
            return {}
        act += 50

    if check_refresh(user):
        return {}
    param = {"fields": "images,name,tracks(total),external_urls",
             "offset": 0}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {user.access_token}'
    }
    r = requests.get(f"https://api.spotify.com/v1/playlists/{info['id']}", headers=bearer, params=param)
    if r.status_code != 200:
        return {}
    return r.json()