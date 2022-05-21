import asyncio
import sys
import urllib
from flask import Flask, session, render_template, url_for, request, redirect, make_response, Markup
from api.spotify.api import get_access_token, refresh_access_token, update_token, get_user_playlist, get_playlist_track
from api.spotify.key import ClientSecret, ClientID
from flask_socketio import SocketIO, emit, send
from api.lastfm_scraping.lastfm_scraping import get_tags_from_urls, search_track
from threading import Thread
import queue

app = Flask(__name__)
socketio = SocketIO(app, manage_session=False, async_mode='threading', cors_allowed_origins="*")
BASE_URL = "http://localhost:5000"
global sess, actual
sess = {}
actual = {}


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


def thread_test2(q):
    while True:
        global actual
        task = q.get()
        if len(task) == 0:
            q.task_done()
            sys.exit(0)
        info = task[3]
        all_url = search_track(task[0], task[1])
        tags = get_tags_from_urls(all_url)
        for tag in tags:
            if tag in info:
                info[tag].add(task[2])
            else:
                info[tag] = set()
                info[tag].add(task[2])
        actual[task[5] + task[4]] += 1
        with app.test_request_context('/sort/' + task[5]):
            socketio.emit("start", {'max': task[6], 'playlist_id': task[5], 'id': task[4]})
            socketio.emit("update", {'actual': actual[task[5] + task[4]], 'id': task[4], 'playlist_id': task[5]})
        q.task_done()


def get_all_data(q, task):
    global actual
    playlist_id = task[0]
    sess = task[1]
    tracks = get_playlist_track(playlist_id, sess)
    max = str(len(tracks))
    with app.test_request_context('/sort/' + playlist_id):
        socketio.emit("start", {'max': max, 'playlist_id': playlist_id, 'id': task[2]})
    info = {}
    threads = []
    actual[playlist_id + task[2]] = 0
    queue_test = queue.Queue()
    for i in range(4):
        threads.append(Thread(target=thread_test2, args=(queue_test,), daemon=True).start())
    for track in tracks:
        queue_test.put((track["track"]["name"], track["track"]["artists"][0]["name"],
                        track["track"]["href"], info, task[2], playlist_id, max))
    for i in range(4):
        queue_test.put([])
    queue_test.join()
    with app.test_request_context('/sort/' + playlist_id):
        socketio.emit("finish", {"playlist_id": playlist_id, "id": task[2]})
    sess[playlist_id] = info
    sess['tracks'] = {}
    sess['tracks'][playlist_id] = tracks
    actual[playlist_id + task[2]] = -1
    sys.exit(0)


def thread_test(q):
    global actual
    while True:
        task = q.get()
        if (task[0] + task[2] in actual and actual[task[0] + task[2]] == -1) or task[0] + task[2] not in actual:
            Thread(target=get_all_data, args=(q, task), daemon=True).start()
        q.task_done()


queuer = queue.Queue()
worker = Thread(target=thread_test, args=(queuer,), daemon=True)
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
    temp = "https://api.spotify.com/v1/me/playlists"
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    if "access_token" not in sess[id]:
        return redirect("/")
    if 'pos' in request.args:
        if request.args["pos"] == "next" and sess[id]["next_dashboard"] is not None:
            temp = sess[id]["next_dashboard"]
        elif request.args["pos"] == "previous" and sess[id]["previous_dashboard"] is not None:
            temp = sess[id]["previous_dashboard"]
    user_playlist = get_user_playlist(sess[id], temp)
    if user_playlist == {}:
        return render_template("error.html", error="Request error")
    have_next = sess[id]["next_dashboard"] is not None
    have_previous = sess[id]["previous_dashboard"]
    return render_template("dashboard.html", user_playlist=user_playlist, next=have_next, previous=have_previous,
                           no_playlist=len(user_playlist["items"]) == 0)


# /dashboard?pos=next
# /dashboard?pos=previous

@app.route("/sort/<playlist_id>")
def sort(playlist_id):
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    queuer.put([playlist_id, sess[id], id])
    return render_template("sort.html", playlist_id=playlist_id, id=id)


@app.route("/create/<playlist_id>")
def create(playlist_id):
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    if playlist_id not in sess[id]:
        return redirect(url_for("dashboard"))
    print(sess[id][playlist_id])
    return render_template("create.html", info=sess[id][playlist_id], tracks=sess[id]['tracks'][playlist_id])


@app.route("/logout")
def logout():
    id = request.cookies.get("id")
    if id is None or check_cookie(id):
        return redirect(url_for("index"))
    sess[id] = {}
    return redirect("/")


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port="80", debug=True, ssl_context=('../cert.pem', '../key.pem'))
