import urllib
from flask import Flask, session, render_template, url_for, request, redirect, make_response
from api.spotify.api import get_access_token, refresh_access_token, update_token, get_user_playlist, get_playlist_track
from api.spotify.key import ClientSecret, ClientID
from flask_socketio import SocketIO, emit, send
import secrets
from threading import Thread
import queue

app = Flask(__name__)
socketio = SocketIO(app, manage_session=False, async_mode='threading', cors_allowed_origins="*")
BASE_URL = "http://localhost:5000"
global sess
sess = {}


def create_id():
    m = -1
    for i in sess:
        m = i
    m = 1 + int(m)
    sess[str(m)] = {}
    return str(m)


def check_cookie(id):
    if id not in sess:
        return 1
    return 0


def thread_test(q):
    while True:
        task = q.get()
        playlist_id = task[0]
        sess = task[1]
        get_playlist_track(playlist_id, sess)
        with app.test_request_context('/sort/' + playlist_id):
            socketio.emit("finish")
        print(f"finish {playlist_id}")
        q.task_done()


queue = queue.Queue()
worker = Thread(target=thread_test, args=(queue,), daemon=True)
worker.start()


@app.route('/')
def index():
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        id = create_id()
        response = make_response(render_template("index.html", client_id=ClientID,
                                                 base_url=urllib.parse.quote(BASE_URL, safe='')))
        response.set_cookie("id", value=id)
        return response
    if "access_token" in sess[id]:
        return redirect(url_for("dashboard"))
    return render_template("index.html", client_id=ClientID, base_url=urllib.parse.quote(BASE_URL, safe=''))


@app.route("/spotify/callback", methods=['POST', 'GET'])
def callback_spotify():
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    if "code" in request.args:
        token = get_access_token(request.args["code"])
        if token == {}:
            return render_template("error.html", error="Request error")
        update_token(token, sess[id])
        return redirect(url_for("dashboard"))
    if not "error" in request.args:
        return render_template("error.html", error="Sorry this page is not available")
    return render_template("error.html", error=request.args["error"])


@app.route("/dashboard")
def dashboard():
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    if "access_token" not in sess[id]:
        return redirect("/")
    user_playlist = get_user_playlist(sess[id])
    if user_playlist == {}:
        return render_template("error.html", error="Request error")
    have_next = sess[id]["next_dashboard"] is not None
    have_previous = sess[id]["previous_dashboard"] is not None
    return render_template("dashboard.html", user_playlist=user_playlist, next=have_next, previous=have_previous,
                           no_playlist=len(user_playlist["items"]) == 0, )


@app.route("/sort/<playlist_id>")
def sort(playlist_id):
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    queue.put([playlist_id, sess[id]])
    return render_template("sort.html")


@app.route("/logout")
def logout():
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    sess[id].pop("access_token", None)
    sess[id].pop("expires_in", None)
    sess[id].pop("refresh_token", None)
    sess[id].pop("next_dashboard", None)
    sess[id].pop("previous_dashboard", None)
    sess[id].pop("thread", None)
    return redirect("/")


if __name__ == '__main__':
    socketio.run(app)
