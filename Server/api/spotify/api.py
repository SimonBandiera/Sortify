from api.spotify.key import ClientSecret, ClientID, header_basic, basic
from flask import session
import requests
from time import time

BASE_URL = "http://localhost:5000"

def update_token(token):
    session["access_token"] = token["access_token"]
    session["expires_in"] = int(token["expires_in"] + time())
    session["refresh_token"] = token["refresh_token"]
    return

def get_access_token(code):
    param = {
        'code' : code,
        'redirect_uri' : f"{BASE_URL}/spotify/callback",
        'grant_type' : 'authorization_code'
    }
    r = requests.post('https://accounts.spotify.com/api/token', params=param, headers=header_basic)
    print(r.json())
    if r.status_code != 200:
        return {}
    return r.json()

def refresh_access_token(refresh_token):
    param = {
        'refresh_token' : refresh_token,
        'grant_type' : 'refresh_token'
    }
    r = requests.post('https://accounts.spotify.com/api/token', params=param, headers=header_basic)
    print(r.json())
    if r.status_code != 200:
        return {}
    return r.json()

def get_user_playlist():
    session["next_dashboard"] = None
    session["previous_dashboard"] = None
    if session["expires_in"] <= time():
        token = refresh_access_token()
        if token == {}:
            return {}
        update_token(token)
    bearer = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
              'Accept': 'application/json',
              'Content-Type' : 'application/json',
              'Authorization' : f'Bearer {session["access_token"]}'}
    r = requests.get("https://api.spotify.com/v1/me/playlists", headers=bearer)
    if r.status_code != 200:
        return {}
    value = r.json()
    session["next_dashboard"] = value["next"]
    session["previous_dashboard"] = value["previous"]
    return r.json()
