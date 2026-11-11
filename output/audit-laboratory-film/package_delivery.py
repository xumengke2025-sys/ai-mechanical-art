"""Package editable sources and compact review evidence, excluding intermediate media."""
from pathlib import Path
import zipfile, json, hashlib

R = Path(__file__).resolve().parent
out = R / 'delivery' / 'audit-laboratory-source.zip'
out.parent.mkdir(exist_ok=True)
files = [p for p in R.iterdir() if p.is_file() and p.suffix in ('.mjs', '.cjs', '.py', '.html', '.json', '.md', '.txt', '.srt', '.ass')]
for folder in ('assets', 'vendor'):
    files.extend(p for p in (R / folder).rglob('*') if p.is_file())
for name in ('media.json', 'delivery-manifest.json', 'audio-stats.json', 'determinism.json', 'repair.json', 'delivery-review.txt'):
    p = R / 'qa' / name
    if p.exists():
        files.append(p)
for folder in ('review-v1', 'review-v2'):
    d = R / 'qa' / folder
    if d.exists():
        files.extend(p for p in d.iterdir() if p.is_file() and p.suffix in ('.json', '.txt') and p.name != 'frame-audit.json')
        if folder == 'review-v2':
            files.extend(p for p in d.iterdir() if p.is_file() and p.suffix == '.jpg')
for name in ('final-104.jpg', 'final-repaired-104.jpg', 'repair-comparison.jpg'):
    p = R / 'qa' / name
    if p.exists():
        files.append(p)
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in sorted(set(files)):
        z.write(p, str(Path('audit-laboratory-film') / p.relative_to(R)))
manifest = {'archive': str(out), 'bytes': out.stat().st_size, 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
            'files': len(set(files)), 'excludes': ['full-frame review images', 'intermediate render videos', 'final MP4s', 'source PDF']}
(R / 'delivery' / 'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False), flush=True)
