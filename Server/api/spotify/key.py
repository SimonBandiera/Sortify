import base64
import os

def encode_base64(string):
    return base64.b64encode(string.encode('ascii')).decode('utf-8')

ClientID = "5eace6156f1d41fca43cff8818b9419e"
ClientSecret = os.environ.get("SPOTIFY_CLIENT_SECRET")

basic = f"Basic {encode_base64(ClientID + ':' + ClientSecret)}"

header_basic = {
    'Authorization': basic,
    'Content-Type': 'application/x-www-form-urlencoded'
}
