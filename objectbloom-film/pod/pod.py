"""Create / talk to / stop the render pod.   python3 pod/pod.py create [gpus] | sh '<cmd>' | bg '<cmd>' | put local remote | get remote local | stop
State (pod id and its token) lives in out/pod.json, which is not committed. The RunPod API key is injected by the session's
network proxy; outside this environment set RUNPOD_API_KEY."""
import base64, json, os, secrets, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, '..', 'out', 'pod.json')
API = 'https://rest.runpod.io/v1'

def api(method, path, body=None):
    cmd = ['curl', '-sS', '-m', '60', '-X', method, API + path, '-H', 'Content-Type: application/json']
    if os.environ.get('RUNPOD_API_KEY'): cmd += ['-H', 'Authorization: Bearer ' + os.environ['RUNPOD_API_KEY']]
    if body is not None: cmd += ['--data-binary', json.dumps(body)]
    t = subprocess.run(cmd, capture_output=True, text=True).stdout
    try: return json.loads(t) if t.strip() else {}
    except Exception: return {'error': t[:600]}

def st(): return json.load(open(STATE))
def url(): return f"https://{st()['id']}-8000.proxy.runpod.net"
def curl(args, **kw): return subprocess.run(['curl', '-sS', '-H', 'X-Token: ' + st()['token']] + args, **kw)

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'create':
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 4
        gpu = sys.argv[3] if len(sys.argv) > 3 else 'NVIDIA GeForce RTX 4090'
        tok = secrets.token_hex(16)
        boot = base64.b64encode(open(os.path.join(HERE, 'srv.py'), 'rb').read()).decode()
        body = {'name': 'objectbloom-film', 'imageName': 'runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04', 'gpuTypeIds': [gpu], 'gpuCount': n,
                'containerDiskInGb': 40, 'volumeInGb': 0, 'ports': ['8000/http'], 'cloudType': sys.argv[4] if len(sys.argv) > 4 else 'SECURE',
                'env': {'POD_TOKEN': tok, 'BOOT_B64': boot, 'NVIDIA_DRIVER_CAPABILITIES': 'all'},
                'dockerStartCmd': ['bash', '-c', 'mkdir -p /workspace && echo $BOOT_B64 | base64 -d > /srv.py && python3 /srv.py']}
        r = api('POST', '/pods', body)
        if 'id' in r:
            os.makedirs(os.path.dirname(STATE), exist_ok=True)
            json.dump({'id': r['id'], 'token': tok, 'gpus': n, 'gpu': gpu}, open(STATE, 'w'))
            print('created', r['id'], r.get('costPerHr'), 'per hour')
        else:
            print(json.dumps(r)[:900])
    elif c == 'worker':
        # python3 pod/pod.py worker NAME JOB RES SAMPLES [gpu] : an extra render node that pulls work from the hub
        name, job, res, smp = sys.argv[2:6]
        gpu = sys.argv[6] if len(sys.argv) > 6 else 'NVIDIA GeForce RTX 4090'
        hub = st()
        boot = base64.b64encode(open(os.path.join(HERE, 'worker.sh'), 'rb').read()).decode()
        body = {'name': f'objectbloom-film-{name}', 'imageName': 'runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04', 'gpuTypeIds': [gpu], 'gpuCount': 1,
                'containerDiskInGb': 30, 'volumeInGb': 0, 'cloudType': sys.argv[7] if len(sys.argv) > 7 else 'SECURE',
                'env': {'HUB': url(), 'HUB_TOKEN': hub['token'], 'JOB': job, 'RES': res, 'SAMPLES': smp, 'BOOT_B64': boot, 'NVIDIA_DRIVER_CAPABILITIES': 'all'},
                'dockerStartCmd': ['bash', '-c', 'echo $BOOT_B64 | base64 -d > /w.sh && bash /w.sh; sleep infinity']}
        r = api('POST', '/pods', body)
        if 'id' in r:
            hub.setdefault('workers', {})[name] = r['id']
            json.dump(hub, open(STATE, 'w'))
            print('worker', name, r['id'], r.get('costPerHr'))
        else:
            print(json.dumps(r)[:300])
    elif c == 'stopworkers':
        for i, pid in st().get('workers', {}).items():
            print(i, api('DELETE', '/pods/' + pid))
    elif c == 'status': 
        r = api('GET', '/pods/' + st()['id']); print({k: r.get(k) for k in ('id', 'desiredStatus', 'costPerHr', 'gpuCount', 'lastStatusChange')})
    elif c == 'stop': print(api('DELETE', '/pods/' + st()['id']))
    elif c == 'sh': sys.stdout.write(curl(['-m', '95', '-X', 'POST', '--data-binary', sys.argv[2], url() + '/sh'], capture_output=True, text=True).stdout)
    elif c == 'bg': print(curl(['-m', '30', '-X', 'POST', '--data-binary', sys.argv[2], url() + '/bg'], capture_output=True, text=True).stdout)
    elif c == 'put': print(curl(['-m', '900', '-T', sys.argv[2], url() + '/f/' + sys.argv[3]], capture_output=True, text=True).stdout)
    elif c == 'get': curl(['-m', '1800', '-f', '-o', sys.argv[3], url() + '/f/' + sys.argv[2]])
