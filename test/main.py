##
## EPITECH PROJECT, 2021
## spotify
## File description:
## main.py
##

from email import header
from email.mime import base
from key import id, secret
import requests
import base64
import os

def get_link(scopes):
    redirect_uri = 'http://localhost:8888/spotify/callback'
    url = f'https://accounts.spotify.com/authorize?client_id={id}&scopes={scopes}&response_type=code&redirect_uri={redirect_uri}'
    r = requests.get(url)
    print(url)
    return url

def handler(code):
    url = 'https://accounts.spotify.com/api/token'
    data = {
        'code' : code,
        'redirect_uri' : 'http://localhost:8888/spotify/callback',
        'grant_type' : 'authorization_code'
    }
    head = {
        'Authorization' : base64.b64encode(("basic".join(id).join(":").join(secret)).encode('ascii')),
    }
    r = requests.post(url, params=data, headers=head)
    print(r)
    return

if __name__ == "__main__":
    get_link('playlist-read-private')