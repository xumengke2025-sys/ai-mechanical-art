from pathlib import Path
import subprocess,hashlib,json,sys
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).parent
ff=next((root.parent.parent/'.tools/video-runtime/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe'))
sample='--sample' in sys.argv
video=root/('renders/pulse-study.mp4' if sample else 'delivery/mechanical-jellyfish.mp4')
out=root/'qa'/('pulse-study' if sample else 'final');out.mkdir(exist_ok=True)
frames=out/'frames';frames.mkdir(exist_ok=True)
subprocess.run([str(ff),'-v','error','-y','-i',str(video),'-vf',('fps=4,scale=216:384' if sample else 'scale=180:320'),str(frames/'f-%04d.jpg')],check=True)
files=sorted(frames.glob('f-*.jpg'));font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',13)
cols=6;rows=4 if sample else 5;tilew=216 if sample else 180;tileh=384 if sample else 320;per=cols*rows;pages=[]
for start in range(0,len(files),per):
 sheet=Image.new('RGB',(tilew*cols,(tileh+20)*rows),'#10252d');d=ImageDraw.Draw(sheet)
 for j,f in enumerate(files[start:start+per]):
  x=(j%cols)*tilew;y=(j//cols)*(tileh+20);sheet.paste(Image.open(f),(x,y));tm=18+(start+j)/4 if sample else (start+j)/30;d.text((x+3,y+tileh+2),f'{start+j} / {tm:.2f}s',font=font,fill='#d7ddd8')
 dst=out/f'sheet-{start//per:02d}.jpg';sheet.save(dst,quality=92);pages.append(str(dst))
if not sample:
 for t in [0,6.7,9.8,12.5,17,20.5,22.5,28.5]:subprocess.run([str(ff),'-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(out/f'detail-{t}.png')],check=True)
idx={'video':str(video),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'frame_count':len(files),'coverage':'4fps sample' if sample else 'all decoded frames, extraction only; viewing recorded separately','pages':pages}
(out/'index.json').write_text(json.dumps(idx,indent=2),encoding='utf-8');print(json.dumps(idx))
