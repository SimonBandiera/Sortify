##
## EPITECH PROJECT, 2021
## spotify
## File description:
## lastfm.py
##

from api.lastfm.lib import *

class Lastfm:
    def __init__(self, api_key, secret):
        self.api_key = api_key
        self.secret = secret
        self.url = "http://ws.audioscrobbler.com/2.0/"
    
    def search_music(self, track):
        params = {'method': 'track.search', 'track': track,
                  'api_key': self.api_key, 'format': 'json',
                  'autocorrect': '1'}
        r = requests.get(self.url, params=params)
        json = r.json()
        return json
    
    def get_music_tag(self, artist, track):
        params = {'method': 'track.getInfo', 'api_key': self.api_key,
                  'artist': (artist), 'track': (track), 'format': 'json',
                  'autocorrect': '1'}
        r = requests.get(self.url, params=params)
        json = r.json()
        return json

    def parse_json(self, json):
        liste = []
        if "track" in json and "toptags" in json["track"] and "tag" in json["track"]["toptags"]:
            liste = clean(json["track"]["toptags"]["tag"])
            if liste == []:
                liste = html_scrap(json["track"]["url"], 1)
                return liste
        return None
    
    def get_tag(self, artist, track):
        liste = self.parse_json(self.get_music_tag(artist, track))
        if liste == None:
            return self.parse_json(self.get_music_tag(artist, clean_string(track)))
        return liste


if __name__ == '__main__':
    from key import API_KEY, SHARED_SECRET
    musique = Lastfm(API_KEY, SHARED_SECRET)
    tags = musique.get_tag('Mustard', "Ballin' feat (with dbzuafez) dzbudz")
    print(tags)

# test.search_music("KERAUNOS KILLER (Speed Up)"))
# '4Wheel', 'KERAUNOS KILLER (Speed Up)'