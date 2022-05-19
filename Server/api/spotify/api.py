from api.spotify.key import ClientSecret, ClientID, header_basic, basic
import requests
import pprint
from time import time

BASE_URL = "http://localhost:5000"


def update_token(token, sess):
    sess["access_token"] = token["access_token"]
    sess["expires_in"] = int(token["expires_in"] + time())
    sess["refresh_token"] = token["refresh_token"]
    return


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


def refresh_access_token(refresh_token):
    param = {
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    }
    r = requests.post('https://accounts.spotify.com/api/token', params=param, headers=header_basic)
    if r.status_code != 200:
        return {}
    return r.json()

def get_user_playlist(sess, url):
    sess["next_dashboard"] = None
    sess["previous_dashboard"] = None
    if sess["expires_in"] <= time():
        token = refresh_access_token(sess["refresh_token"])
        if token == {}:
            return {}
        update_token(token, sess)
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {sess["access_token"]}'
    }
    r = requests.get(url, headers=bearer)
    if r.status_code != 200:
        return {}
    value = r.json()
    sess["next_dashboard"] = value["next"]
    sess["previous_dashboard"] = value["previous"]
    return r.json()


def get_playlist_track(playlist_id, sess):
    tracks = []
    if sess["expires_in"] <= time():
        token = refresh_access_token(sess["refresh_token"])
        if token == {}:
            return {}
        update_token(token, sess)
    param = {"fields": "items(track(name,href,artists(name))),total,limit",
             "offset": 0}
    bearer = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {sess["access_token"]}'
    }
    max = 1
    while param["offset"] < max:
        r = requests.get(f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks", params=param, headers=bearer)
        if r.status_code != 200:
            return {}
        max = r.json()["total"]
        param["offset"] += 100
        tracks += r.json()["items"]

    liste = []
    for track in tracks:
        if track["track"] is not None and "album" not in track["track"]:
            liste.append(track)
    return liste

