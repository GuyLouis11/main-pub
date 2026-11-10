"""Tiny file-and-command server that runs on the render pod (started by the pod's start command).
Every request needs the X-Token header. PUT/GET /f/<path> writes/reads a file under /workspace;
POST /sh runs a shell command and returns its output; POST /bg starts one in the background (log in /workspace/logs)."""
import os, subprocess, sys, time, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
TOKEN, ROOT = os.environ['POD_TOKEN'], '/workspace'
os.makedirs(ROOT + '/logs', exist_ok=True)

class H(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def log_message(self, *a): pass
    def ok(self, body=b'ok', code=200):
        if isinstance(body, str): body = body.encode()
        self.send_response(code); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
    def auth(self):
        if self.headers.get('X-Token') != TOKEN:
            self.ok('no', 403); return False
        return True
    def path_of(self):
        p = os.path.normpath(os.path.join(ROOT, urllib.parse.unquote(self.path[3:]).lstrip('/')))
        return p if p.startswith(ROOT) else None
    def do_GET(self):
        if not self.auth(): return
        if self.path.startswith('/f/'):
            p = self.path_of()
            if not p or not os.path.isfile(p): return self.ok('missing', 404)
            n = os.path.getsize(p)
            self.send_response(200); self.send_header('Content-Length', str(n)); self.end_headers()
            with open(p, 'rb') as f:
                while True:
                    b = f.read(1 << 20)
                    if not b: break
                    self.wfile.write(b)
        else: self.ok('up')
    def do_PUT(self):
        if not self.auth(): return
        p = self.path_of(); n = int(self.headers.get('Content-Length', 0))
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'wb') as f:
            while n > 0:
                b = self.rfile.read(min(n, 1 << 20))
                if not b: break
                f.write(b); n -= len(b)
        self.ok()
    def do_POST(self):
        if not self.auth(): return
        cmd = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode()
        if self.path == '/bg':
            name = time.strftime('%H%M%S')
            subprocess.Popen(['bash', '-c', cmd], cwd=ROOT, stdout=open(f'{ROOT}/logs/{name}.log', 'wb'), stderr=subprocess.STDOUT, start_new_session=True)
            return self.ok(name)
        try:
            r = subprocess.run(['bash', '-c', cmd], cwd=ROOT, capture_output=True, timeout=85)
            self.ok(r.stdout + r.stderr)
        except subprocess.TimeoutExpired:
            self.ok('timeout', 504)

ThreadingHTTPServer(('0.0.0.0', 8000), H).serve_forever()
