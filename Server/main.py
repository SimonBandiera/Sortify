import urllib
from flask import Flask, session, render_template, url_for, request, redirect
from api.spotify.api import get_access_token, refresh_access_token, update_token, get_user_playlist
from api.spotify.key import ClientSecret, ClientID
import secrets
import pprint

app = Flask(__name__)
app.secret_key = secrets.token_hex()
BASE_URL = "http://localhost:5000"


@app.route('/')
def index():
    if "access_token" in session:
        return redirect(url_for("dashboard"))
    return render_template("index.html", client_id=ClientID, base_url=urllib.parse.quote(BASE_URL, safe=''))


@app.route("/spotify/callback", methods=['POST', 'GET'])
def callback_spotify():
    if "code" in request.args:
        token = get_access_token(request.args["code"])
        if token == {}:
            return render_template("error.html", error="Request error")
        update_token(token)
        return redirect(url_for("dashboard"))
    if not "error" in request.args:
        return render_template("error.html", error="Sorry this page is not available")
    return render_template("error.html", error=request.args["error"])


@app.route("/dashboard")
def dashboard():
    if "access_token" not in session:
        return redirect("/")
    user_playlist = get_user_playlist()
    if user_playlist == {}:
        return render_template("error.html", error="Request error")
    pprint.pprint(user_playlist)
    have_next = session["next_dashboard"] is not None
    have_previous = session["previous_dashboard"] is not None
    return render_template("dashboard.html", user_playlist=user_playlist, next=have_next, previous=have_previous,
                           no_playlist=len(user_playlist["items"]) == 0)

@app.route("/sort/<playlist_id>")
def sort(playlist_id):
    return playlist_id

@app.route("/logout")
def logout():
    session.pop("access_token", None)
    session.pop("expires_in", None)
    session.pop("refresh_token", None)
    session.pop("next_dashboard", None)
    session.pop("previous_dashboard", None)
    return redirect("/")

if __name__ == '__main__':
    app.debug = True
    app.run()
