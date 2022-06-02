import os
import urllib
from queue import Queue
from threading import Thread

from flask import Flask, render_template, request, redirect, make_response
from flask_socketio import SocketIO

from api.spotify.api import get_access_token, get_user_playlist, create_playlist
from api.spotify.key import ClientID

global users_by_id, users_by_session, actual
users_by_id = {}
users_by_session = {}
actual = {}

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")
if "FLASK_ENV" in os.environ and os.environ["FLASK_ENV"] == "development":
    BASE_URL = "http://localhost:5000"
else:
    BASE_URL = "https://www.sortify.fr"

from search_tags_playlist_thread import thread_manager
from user import User, get_user_by_id, get_user_by_session, user_update_token, have_access_token, id_valid, user_have_playlist
from api.sqlite3.api import get_all

thread_management_queue = Queue()
worker = Thread(target=thread_manager, args=(thread_management_queue,), daemon=True)
worker.start()


@socketio.on('wait_for_sort')
def sort_starting(data):
    if "id" not in data or "playlist_id" not in data or not data["playlist_id"] in get_user_by_session(data["id"]).playlists:
        return
    user = get_user_by_session(data["id"])
    user.playlists[data["playlist_id"]].start_websocket = True
    return


@app.route('/')
def index():
    user_id = request.cookies.get("id")
    if not id_valid(user_id):
        user = User()
        response = make_response(render_template("index.html", client_id=ClientID,
                                                 base_url=urllib.parse.quote(BASE_URL, safe='')))
        response.set_cookie("id", value=user.id)
        return response
    if not have_access_token(user_id):
        return redirect(BASE_URL + "/dashboard")
    return render_template("index.html", client_id=ClientID, base_url=urllib.parse.quote(BASE_URL, safe=''))


@app.route("/spotify/callback", methods=['POST', 'GET'])
def callback_spotify():
    user_id = request.cookies.get("id")
    if not id_valid(user_id):
        return redirect(BASE_URL + "/")
    if "code" in request.args:
        token = get_access_token(request.args["code"])
        if token == {}:
            return render_template("error.html", error="Request error")
        user_update_token(user_id, token)
        return redirect(BASE_URL + "/dashboard")
    if not "error" in request.args:
        return render_template("error.html", error="Sorry this page is not available")
    return render_template("error.html", error=request.args["error"])


@app.route("/dashboard")
def dashboard():
    user_id = request.cookies.get("id")
    if not id_valid(user_id) or not have_access_token(user_id):
        return redirect(BASE_URL + "/")
    user = get_user_by_id(user_id)
    user.user_dashboard_gestion(request.args)
    user_playlist = get_user_playlist(user)
    if user_playlist == {}:
        return render_template("error.html", error="Request error")
    have_next = user.dashboard_next is not None
    have_previous = user.dashboard_prev is not None
    return render_template("dashboard.html", user_playlist=user_playlist, next=have_next, previous=have_previous,
                           no_playlist=len(user_playlist["items"]) == 0, code=user.update_code)


@app.route("/sort/<playlist_id>")
def sort(playlist_id):
    user_id = request.cookies.get("id")
    if not id_valid(user_id):
        return redirect(BASE_URL + "/")
    user = get_user_by_id(user_id)
    if user_have_playlist(user_id, playlist_id) and user.playlists[playlist_id].sorted:
        return redirect(f"{BASE_URL}/create/{playlist_id}")
    user.add_playlist(playlist_id)
    thread_management_queue.put([playlist_id, user])
    return render_template("sort.html", playlist_id=playlist_id, id=user.session)


@app.route("/create/<playlist_id>", methods=['GET', 'POST'])
def create(playlist_id):
    if request.method == 'GET':
        user_id = request.cookies.get("id")
        if not id_valid(user_id) or not user_have_playlist(user_id, playlist_id):
            return redirect(BASE_URL + "/")
        user = get_user_by_id(user_id)
        return render_template("create.html", playlist_id=playlist_id, info=user.playlists[playlist_id])
    if request.method == 'POST':
        user_id = request.cookies.get("id")
        if not id_valid(user_id) or not user_have_playlist(user_id, playlist_id):
            return redirect(BASE_URL + "/")
        user = get_user_by_id(user_id)
        songs = set()
        if not "name" in request.form:
            return render_template("error.html", error="Request error")
        for key in request.form:
            if key != "name":
                for song in user.playlists[playlist_id].sorted_tracks[request.form[key]]:
                    songs.add(song)
        user.playlists[playlist_id].info = create_playlist(user, songs, request.form["name"])
        if user.playlists[playlist_id].info == {}:
            return render_template("error.html", error="Request error")
        return redirect(f"{BASE_URL}/finish/{playlist_id}")


@app.route("/finish/<playlist_id>")
def finish(playlist_id):
    user_id = request.cookies.get("id")
    if not id_valid(user_id) or not user_have_playlist(user_id, playlist_id) or \
            get_user_by_id(user_id).playlists[playlist_id].info == {}:
        return redirect(BASE_URL + "/")
    user = get_user_by_id(user_id)
    info = user.playlists[playlist_id].info
    user.playlists.pop(playlist_id, None)
    return render_template("finish.html", info=info)


@app.route("/logout")
def logout():
    user_id = request.cookies.get("id")
    if not id_valid(user_id):
        return redirect(BASE_URL + "/")
    user = get_user_by_id(user_id)
    users_by_session.pop(user.session, None)
    users_by_id.pop(user.id, None)
    return redirect(BASE_URL + "/")

@app.errorhandler(404)
def notfound(e):
    return render_template("error.html", error="404 there is nothing there."), 404


def convert_bytes(num):
    """
    this function will convert bytes to MB.... GB... etc
    """
    for x in ['bytes', 'KB', 'MB', 'GB', 'TB']:
        if num < 1024.0:
            return "%3.1f %s" % (num, x)
        num /= 1024.0


@app.route("/admin/<admin_id>")
def admin(admin_id):
    if admin_id == "dc32ff7c9c3c5e0a99cf50c77833b276656768cf52e91f44de92645296e00beb":
        size = convert_bytes(os.path.getsize("Server/db/tags_database.db"))
        nbr_pre_parse = len(get_all())
        return render_template("admin.html", len_pre_parse=nbr_pre_parse, size=size)
    return 404

if __name__ == '__main__':
    socketio.run(app)
