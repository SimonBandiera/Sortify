##
## EPITECH PROJECT, 2021
## spotify
## File description:
## server.py
##

from http.server import HTTPServer, BaseHTTPRequestHandler
from sys import argv
from main import handler
from urllib.parse import urlparse, parse_qs

BIND_HOST = 'localhost'
PORT = 8888

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        handler(parse_qs(urlparse(self.path).query).get('code', None))

    def do_POST(self):
        content_length = int(self.headers.get('content-length', 0))
        body = self.rfile.read(content_length)
        self.write_response(body)

    def write_response(self, content):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(content)

print(f'Listening on http://{BIND_HOST}:{PORT}\n')
httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()
