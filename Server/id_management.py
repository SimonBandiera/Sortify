from main import users_by_id, users_by_session
import secrets

def create_id():
    string = str(secrets.token_hex(32))
    while string in users_by_id or string in users_by_session:
        string = str(secrets.token_hex(32))
    return string

def check_cookie(id):
    if id not in users_by_id:
        return 1
    return 0
