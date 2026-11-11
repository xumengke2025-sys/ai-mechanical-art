from pathlib import Path
import json,hashlib,zipfile
R=Path(__file__).parent
D=R/'delivery';D.mkdir(exist_ok=True)
files=[p for p in R.iterdir() if p.is_file() and p.suffix in ['.mjs','.cjs','.html','.py','.json','.md','.ass','.srt','.txt']]
for d in ['vendor','assets']:files.extend(p for p in (R/d).rglob('*') if p.is_file())
for n in ['delivery-review.txt','av-review.json','delivery-manifest.json','audio-stats.json','determinism.json','determinism-pixels.json','motion-audit.json','alert-handoff-check.json']:
 p=R/'qa'/n
 if p.exists():files.append(p)
files.append(R/'qa/final-samples/index.json')
files.extend((R/'qa/final-samples').glob('*.jpg'))
files=sorted(set(files))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
hashes={p.relative_to(R).as_posix():sha(p) for p in files}
(D/'source-sha256.json').write_text(json.dumps(hashes,ensure_ascii=False,indent=2),encoding='utf-8')
out=D/'audit-alert-30-source.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(R))
 z.write(D/'source-sha256.json','source-sha256.json')
with zipfile.ZipFile(out) as z:
 bad=z.testzip()
 mismatches=[name for name,h in hashes.items() if hashlib.sha256(z.read(name)).hexdigest()!=h]
result={'files':len(files),'zip_bytes':out.stat().st_size,'zip_sha256':sha(out),'crc_error':bad,'hash_mismatches':mismatches}
(D/'package-validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
if bad or mismatches:raise SystemExit(1)
