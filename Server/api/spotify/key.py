import base64

def encode_base64(string):
    return base64.b64encode(string.encode('ascii')).decode('utf-8')

ClientID = "b81becc5e2514fb493ae425f3f1c7476"
ClientSecret = "0233bf718a6e4e9aaa65e8e105fe8802"

basic = f"Basic {encode_base64(ClientID + ':' + ClientSecret)}"
header_basic = {
    'Authorization': basic,
    'Content-Type': 'application/x-www-form-urlencoded'
}
