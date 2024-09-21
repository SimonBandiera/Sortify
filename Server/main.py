import os

from dotenv import load_dotenv

load_dotenv()
import urllib
from queue import Queue
from threading import Thread

from flask import Flask, render_template, request, redirect, g, make_response, send_from_directory, abort
import flask_babel
from flask_babel import Babel
from markupsafe import Markup
from flask_socketio import SocketIO
from api.spotify.api import get_access_token, get_user_playlist, create_playlist
from api.spotify.key import ClientID

global users_by_id, users_by_session, actual
users_by_id = {}
users_by_session = {}
actual = {}


LNGS = os.listdir("./translations")
def get_locale():
    user = getattr(g, 'user', None)
    if user is not None:
        return user.locale
    return request.accept_languages.best_match(LNGS)

def get_timezone():
    user = getattr(g, 'user', None)
    if user is not None:
        return user.timezone

def format_gradient(string, *args):
    try:
        if len(args) == 0:
            return string
        splitted = string.split()
        length = len(splitted)
        string_formated = ""
        args_index = 0
        current_args = args[args_index][0]
        if current_args == "half":
            current_args = (length + 1)// 2
        for i in range(length):
            if splitted[i] == splitted[current_args]:
                if len(args[args_index]) == 1:
                    string_formated += Markup(f'<span class="gradiant">{splitted[i]}</span>')
                else:
                    length_index = len(splitted[i])
                    a1 =  (length_index + 1) // 2 if args[args_index][1][0] == "half" else args[args_index][1][0]
                    if len(args[args_index][1]) == 1:
                        a2 = length_index + 1
                    else:
                        a2 = (length_index + 1) // 2 if args[args_index][1][1] == "half" else args[args_index][1][1]
                    string_formated += Markup(f'{splitted[i][:a1]}<span class="gradiant">{splitted[i][a1:a2]}</span>{splitted[i][a2:]}')
                args_index += 1
                if args_index == len(args):
                    string_formated += " " + " ".join(splitted[i + 1:])
                    return string_formated
                current_args = args[args_index][0]
                if current_args == "half":
                    current_args = (length + 1) // 2
            else:
                string_formated += splitted[i]
            if i < length - 1:
                string_formated += ' '
    except Exception as e:
        return string
    return string
app = Flask(__name__)
app.jinja_env.globals.update(format_gradient=format_gradient, Markup=Markup, locale=get_locale)
babel = Babel(app, locale_selector=get_locale, timezone_selector=get_timezone)
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

BASE_URL=os.environ.get('BASE_URL')

from search_tags_playlist_thread import thread_manager
from user import User, get_user_by_id, get_user_by_session, user_update_token, have_access_token, id_valid, user_have_playlist

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

@app.route("/spotify/callback", methods=['POST', 'GET'])
def callback_spotify():
    user_id = request.cookies.get("id")
    need_new_user = not id_valid(user_id)
    if "code" in request.args:
        token = get_access_token(request.args["code"])
        if token == {}:
            return render_template("error.html", error="Request error")
        response = make_response(redirect(BASE_URL + "/dashboard"))
        if need_new_user:
            user = User()
            user_id = user.id
        response.set_cookie("id", value=user_id)
        user_update_token(user_id, token)
        return response
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

@app.route('/robots.txt')
@app.route('/sitemap.txt')
def static_from_root():
    return send_from_directory(app.static_folder, request.path[1:])
@app.route('/')
@app.route('/<lng>')
def index(lng = None):
    if lng is not None and lng not in LNGS + ["en"]:
        abort(404)

    user_id = request.cookies.get("id")
    if not id_valid(user_id):
        user = User()
        response = make_response(render_template("index.html", client_id=ClientID,
                                                 base_url=urllib.parse.quote(BASE_URL, safe='')))
        response.set_cookie("id", value=user.id)
        return response
    if have_access_token(user_id):
        return redirect(BASE_URL + "/dashboard")
    if lng is None:
        return render_template("index.html", client_id=ClientID, base_url=urllib.parse.quote(BASE_URL, safe=''))
    with flask_babel.force_locale(lng):
        return render_template("index.html", client_id=ClientID, base_url=urllib.parse.quote(BASE_URL, safe=''))

@app.errorhandler(404)
def notfound(e):
    return render_template("error.html", error="404 there is nothing there."), 404


if __name__ == '__main__':
    socketio.run(app)
