from concurrent.futures import ThreadPoolExecutor
from sys import exit
from threading import Thread
from api.lastfm_scraping.lastfm_scraping import get_tags_from_urls, search_track
from api.spotify.api import get_playlist_track
from api.sqlite3.api import add_tags, get_tags
from main import socketio, app
import time

def end_scrapers(user, playlist_id):
    user.playlists[playlist_id].progress += 1
    with app.test_request_context('/sort/' + playlist_id):
        socketio.emit("start", {'max': user.playlists[playlist_id].len_tracks, 'playlist_id': playlist_id, 'id': user.session})
        socketio.emit("update", {'actual': user.playlists[playlist_id].progress, 'id': user.session,
                                 'playlist_id': playlist_id})

def put_tags_in_sort_list(all_music_sorted, tags, track_uri):
    for tag in tags:
        if tag == "":
            continue
        if tag in all_music_sorted:
            all_music_sorted[tag].add(track_uri)
        else:
            all_music_sorted[tag] = set()
            all_music_sorted[tag].add(track_uri)

def scrapers(task):
    track_name = task[0]
    track_artist_name = task[1]
    track_uri = task[2]
    user = task[3]
    playlist_id = task[4]

    tags_indatabase = get_tags(track_name, track_artist_name)
    if tags_indatabase:
        put_tags_in_sort_list(user.playlists[playlist_id].sorted_tracks, tags_indatabase[0][2:6], track_uri)
        end_scrapers(user, playlist_id)
        return

    all_url = search_track(track_name, track_artist_name)
    if all_url == {}:
        end_scrapers(user, playlist_id)
        return

    tags = get_tags_from_urls(all_url)
    put_tags_in_sort_list(user.playlists[playlist_id].sorted_tracks, tags, track_uri)
    if tags:
        add_tags(track_name, track_artist_name, tags)
    end_scrapers(user, playlist_id)


def thread_scraper_manager(task):
    playlist_id = task[0]
    user = task[1]
    user.playlists[playlist_id].sorting = True
    user.playlists[playlist_id].tracks = get_playlist_track(playlist_id, user)
    timeout = time.time()

    while not user.playlists[playlist_id].start_websocket and time.time() > timeout + 10:
        pass
    if time.time() > timeout + 10:
        exit(0)
    if user.playlists[playlist_id].tracks == {}:
        with app.test_request_context('/sort/' + playlist_id):
            socketio.emit("notfound", {'playlist_id': playlist_id, 'id': user.session})
        exit(0)
    user.playlists[playlist_id].len_tracks = str(len(user.playlists[playlist_id].tracks))
    with app.test_request_context('/sort/' + playlist_id):
        socketio.emit("start", {'max': user.playlists[playlist_id].len_tracks, 'playlist_id': playlist_id, 'id': user.session})

    list_execution = []
    for track in user.playlists[playlist_id].tracks:
        list_execution.append((track["track"]["name"],
                               track["track"]["artists"][0]["name"],
                               track["track"]["uri"],
                               user,
                               playlist_id))

    with ThreadPoolExecutor(max_workers=4) as executor:
        executor.map(scrapers, list_execution)

    with app.test_request_context('/sort/' + playlist_id):
        socketio.emit("finish", {"playlist_id": playlist_id, "id": user.session})

    user.playlists[playlist_id].sorted = True
    exit(0)


def thread_manager(q):
    while True:
        task = q.get()
        playlist_id = task[0]
        user = task[1]
        if not user.playlists[playlist_id].sorted and not user.playlists[playlist_id].sorting:
            Thread(target=thread_scraper_manager, args=(task,), daemon=True).start()
        q.task_done()
