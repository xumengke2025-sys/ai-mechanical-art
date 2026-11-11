from pathlib import Path
import subprocess,sys,json,hashlib
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).parent
FF=next((ROOT.parent.parent/'.tools/video-runtime/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe'))
video=Path(sys.argv[1]); dest=Path(sys.argv[2]); dest.mkdir(parents=True,exist_ok=True)
full='--full' in sys.argv
frames=dest/'frames'; frames.mkdir(exist_ok=True)
cmd=[str(FF),'-hide_banner','-loglevel','error','-y','-i',str(video)]
cmd+=['-vf','scale=270:480' if full else 'fps=1,scale=270:480',str(frames/'f-%04d.jpg')]
subprocess.run(cmd,check=True)
files=sorted(frames.glob('f-*.jpg'));per=30 if full else 15;cols=6 if full else 5;rows=5 if full else 3
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',17)
for p in range((len(files)+per-1)//per):
    sheet=Image.new('RGB',(cols*270,rows*505),'#10212a');d=ImageDraw.Draw(sheet)
    for j,f in enumerate(files[p*per:(p+1)*per]):
        x=(j%cols)*270;y=(j//cols)*505;sheet.paste(Image.open(f),(x,y));idx=p*per+j;label=f'{idx:04d}  {idx/30:.3f}s' if full else f'{idx:.1f}s';d.text((x+6,y+482),label,font=font,fill='#d4e1dd')
    sheet.save(dest/f'sheet-{p:02d}.jpg',quality=92)
data={'video':str(video.resolve()),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'count':len(files),'mode':'all-decoded-frames' if full else '1fps','sheets':(len(files)+per-1)//per}
(dest/'index.json').write_text(json.dumps(data,indent=2),encoding='utf-8');print(json.dumps(data))
