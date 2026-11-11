"""Resumable render: six 30-second segments, two workers, then finalize."""
from pathlib import Path
import subprocess, concurrent.futures, json, hashlib, sys, shutil, datetime, traceback

R=Path(__file__).resolve().parent
render_dir=R/'renders'
node=shutil.which('node')
source_names=['scene.mjs','instruments.mjs','mechanics.mjs','timeline.mjs']
hashes={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in source_names}
parts=[f'repair-{a:03d}-{a+30:03d}.mp4' for a in range(0,180,30)]
(render_dir/'delivery-segments.json').write_text(json.dumps(parts),encoding='utf-8')
def log(message):
    with (render_dir/'delivery-run.log').open('a',encoding='utf-8') as f:f.write(f'{datetime.datetime.now().isoformat()} {message}\n')
def work(a):
    p=render_dir/f'repair-{a:03d}-{a+30:03d}.mp4'
    manifest=Path(str(p)+'.manifest.json')
    if p.exists() and manifest.exists():
        m=json.loads(manifest.read_text(encoding='utf-8'))
        if m.get('sourceHashes')==hashes and m.get('frames')==900 and m.get('sha256')==hashlib.sha256(p.read_bytes()).hexdigest():
            log(f'REUSE {p.name}');return
    log(f'START {p.name}')
    with Path(str(p)+'.log').open('w',encoding='utf-8') as f:
        subprocess.run([node,str(R/'render.cjs'),'--start',str(a),'--end',str(a+30),'--out',f'renders/{p.name}'],cwd=R,stdout=f,stderr=subprocess.STDOUT,check=True)
    log(f'COMPLETE {p.name}')
try:
    log('START DELIVERY')
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(work,range(0,180,30)))
    log('FINALIZE')
    with (render_dir/'delivery-finalize.log').open('w',encoding='utf-8') as f:
        subprocess.run([sys.executable,str(R/'finish.py'),'--finalize','--segments'],cwd=R,stdout=f,stderr=subprocess.STDOUT,check=True)
        subprocess.run([sys.executable,str(R/'postflight.py')],cwd=R,stdout=f,stderr=subprocess.STDOUT,check=True)
    log('COMPLETE DELIVERY')
except Exception:
    log(traceback.format_exc())
    raise
