from pathlib import Path
import json, subprocess, sys
from PIL import Image, ImageDraw
R=Path(__file__).parent
FF='D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
def sheets(items,out,cols=4,tw=480):
 out.mkdir(parents=True,exist_ok=True)
 for k in range(0,len(items),16):
  batch=items[k:k+16];height=tw*9//16;im=Image.new('RGB',(tw*cols,((len(batch)+cols-1)//cols)*(height+26)),(16,27,34));draw=ImageDraw.Draw(im)
  for j,(p,t) in enumerate(batch):
   with Image.open(p) as source:
    pic=source.copy();pic.thumbnail((tw,height));x=j%cols*tw;y=j//cols*(height+26);im.paste(pic,(x,y));draw.text((x+10,y+height+6),f'{t:.3f}s',(230,230,215))
  im.save(out/f'sheet-{k//16:02d}.jpg',quality=95)
def extract(video,out,frames,origin=0):
 out.mkdir(parents=True,exist_ok=True)
 expr='+'.join(f'eq(n\\,{f})' for f in frames)
 subprocess.run([FF,'-v','error','-y','-i',str(video),'-vf','select='+expr,'-fps_mode','vfr','-q:v','2',str(out/'cap-%03d.jpg')],check=True)
 items=[]
 for i,f in enumerate(frames):
  p=out/f'{i:03d}-{f/30+origin:.3f}.jpg';(out/f'cap-{i+1:03d}.jpg').replace(p);items.append((p,f/30+origin))
 sheets(items,out)
 (out/'index.json').write_text(json.dumps([{'frame':f,'time':f/30+origin,'image':str(items[i][0].resolve()),'sheet':str((out/f'sheet-{i//16:02d}.jpg').resolve())} for i,f in enumerate(frames)],ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__':
 if '--preview' in sys.argv:
  states=json.loads((R/'qa/states.json').read_text(encoding='utf-8'))['states'];sheets([(R/'qa'/f'frame-{s["t"]:g}.png',s['t']) for s in states],R/'qa/preview')
 else:
  # 5fps samples plus exact contact, final frame and dense flip intervals.
  frames=sorted(set(list(range(0,900,6))+[899,732,604,619,680,693]+list(range(66,99,3))+list(range(210,264,3))+list(range(354,405,3))+list(range(501,546,3))+list(range(570,624,2))+list(range(624,696,3))))
  extract(R/'audit-alert-30.mp4',R/'qa/final-samples',frames)
