"""Collect metadata and indexed final-video frames for the limited repair recheck."""
from pathlib import Path
import subprocess, json, os, hashlib
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parent
FF = os.environ.get('FFMPEG_PATH', 'D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe')
FP = os.environ.get('FFPROBE_PATH', 'D:/Codex/skills/video-shotcraft/workbench/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe')
video = R / 'audit-laboratory-film.mp4'
review = R / 'qa' / 'review-v2'
review.mkdir(exist_ok=True)
raw = subprocess.check_output([FP, '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate,duration,nb_frames,sample_rate,channels', '-of', 'json', str(video)])
media = json.loads(raw)
(R / 'qa' / 'media.json').write_text(json.dumps(media, ensure_ascii=False, indent=2), encoding='utf-8')
indices = sorted(set([2070, 2670, 2820, 3000, 3120, 3210, 3240, 3330, 3450, 4110, 4770, 5370] + list(range(2998, 3003)) + list(range(3238, 3243)) + list(range(3448, 3453))))
expr = '+'.join(f'eq(n\\,{n})' for n in indices)
subprocess.run([FF, '-v', 'error', '-y', '-i', str(video), '-vf', 'select=' + expr, '-vsync', '0', '-q:v', '2', str(review / 'extract-%03d.jpg')], check=True)
records = []
for i, n in enumerate(indices, 1):
    p = review / f'frame-{n:06d}.jpg'
    (review / f'extract-{i:03d}.jpg').replace(p)
    records.append({'frame': n, 'seconds': n / 30, 'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()})
(R / 'qa' / 'final-repaired-104.jpg').write_bytes((review / 'frame-003120.jpg').read_bytes())
for cut in (3000, 3240, 3450):
    strip = Image.new('RGB', (1920, 240), '#172421')
    draw = ImageDraw.Draw(strip)
    for j, n in enumerate(range(cut - 2, cut + 3)):
        with Image.open(review / f'frame-{n:06d}.jpg') as im:
            strip.paste(im.resize((384, 216)), (j * 384, 24))
        draw.text((j * 384 + 8, 5), f'frame {n} | {n/30:.6f}s', fill='#ecdec5')
    strip.save(review / f'cut-{cut:06d}.jpg', quality=95)
data = {'video_path': str(video), 'video_sha256': hashlib.sha256(video.read_bytes()).hexdigest(), 'frames': records, 'note': 'Extraction only; visual observation must be separately recorded.'}
(review / 'evidence-index.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'sha256': data['video_sha256'], 'extracted_frames': len(records), 'media': media}, ensure_ascii=False), flush=True)
