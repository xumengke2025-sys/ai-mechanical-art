from pathlib import Path
import subprocess, hashlib, json
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).parent
ff=next((root.parent.parent/'.tools/video-runtime/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe'))
video=root/'delivery/mechanical-whale-refined.mp4'
out=root/'qa/final-sampled';out.mkdir(exist_ok=True)
frames=out/'frames';frames.mkdir(exist_ok=True)
subprocess.run([str(ff),'-v','error','-y','-i',str(video),'-vf','fps=2,scale=270:480',str(frames/'f-%03d.jpg')],check=True)
files=sorted(frames.glob('f-*.jpg'))
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',17)
for page in range(4):
    sheet=Image.new('RGB',(1350,1515),'#10212a');d=ImageDraw.Draw(sheet)
    for j,p in enumerate(files[page*15:page*15+15]):
        x=j%5*270;y=j//5*505;sheet.paste(Image.open(p),(x,y));d.text((x+6,y+482),f'{(page*15+j)/2:.2f}s',font=font,fill='#d2dddd')
    sheet.save(out/f'sheet-{page}.jpg',quality=93)
for t in [6.7,11.2,20.5,25.5,28.9]:
    subprocess.run([str(ff),'-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(out/f'detail-{t}.png')],check=True)
index={'video':str(video),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'method':'2fps sampled final frames; NOT full-frame audit','sampled_frames':len(files),'detail_seconds':[6.7,11.2,20.5,25.5,28.9]}
(out/'index.json').write_text(json.dumps(index,indent=2),encoding='utf-8');print(json.dumps(index))
