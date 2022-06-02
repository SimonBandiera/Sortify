from id_management import *
from main import users_by_id, users_by_session
from time import time

class Playlist:
    def __init__(self, id):
        self.id = id
        self.start_websocket = False
        self.sorted_tracks = {}
        self.tracks = []
        self.progress = 0
        self.len_tracks = "0"
        self.sorted = False
        self.sorting = False
        self.info = {}

class User:
    def __init__(self):
        self.id = create_id()
        self.session = create_id()
        self.dashboard_url = "https://api.spotify.com/v1/me/playlists"
        self.dashboard_next = None
        self.dashboard_prev = None
        self.access_token = None
        self.expires_in = None
        self.refresh_token = None
        self.update_code = 0
        self.playlists = {}
        users_by_id[self.id] = self
        users_by_session[self.session] = self
        return

    def user_have_access_token(self):
        return self.access_token is not None

    def user_update_token(self, token):
        self.access_token = token["access_token"]
        self.expires_in = int(token["expires_in"] + time())
        self.refresh_token = token["refresh_token"]
        return

    def user_dashboard_gestion(self, args):
        if 'pos' in args and "c" in args:
            if args["pos"] == "next" and self.dashboard_next is not None and int(args["c"]) != self.update_code:
                self.dashboard_url = self.dashboard_next
                self.update_code = self.update_code + 1 % 2
            elif args["pos"] == "prev" and self.dashboard_prev is not None and int(args["c"]) != self.update_code:
                self.dashboard_url = self.dashboard_prev
                self.update_code = self.update_code + 1 % 2

    def have_playlist(self, playlist_id):
        return playlist_id in self.playlists

    def add_playlist(self, playlist_id):
        self.playlists[playlist_id] = Playlist(playlist_id)


def user_update_token(user_id, token):
    users_by_id[user_id].user_update_token(token)

def get_user_by_id(user_id):
    return users_by_id[user_id]

def get_user_by_session(session):
    return users_by_session[session]

def have_access_token(user_id):
    return users_by_id[user_id].user_have_access_token()

def id_valid(user_id):
    return user_id in users_by_id

def user_have_playlist(user_id, playlist_id):
    return playlist_id in get_user_by_id(user_id).playlists
