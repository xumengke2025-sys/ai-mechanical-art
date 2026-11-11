from pathlib import Path
import json,hashlib,zipfile
R=Path(__file__).parent
files=[]
for p in R.iterdir():
 if p.is_file() and p.suffix in ['.mjs','.cjs','.html','.py','.json','.md','.ass','.srt','.txt']:files.append(p)
for d in ['vendor','assets']:files.extend(p for p in (R/d).rglob('*') if p.is_file())
for n in ['delivery-review.txt','av-review.json','av-consistency.json','delivery-manifest.json','audio-stats.json','determinism.json','mechanical-observations.json']:
 p=R/'qa'/n
 if p.exists():files.append(p)
files.extend((R/'qa/final-frames').glob('*.jpg'))
for d in ['sample-handoff','press-window']:files.extend((R/'qa'/d).glob('sheet-*.jpg'))
hashes={p.relative_to(R).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
(R/'delivery/source-sha256.json').write_text(json.dumps(hashes,ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(R/'delivery/audit-caseflow-source.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(R))
 z.write(R/'delivery/source-sha256.json','source-sha256.json')
print(json.dumps({'files':len(files),'zip_bytes':(R/'delivery/audit-caseflow-source.zip').stat().st_size}))
