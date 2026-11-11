from pathlib import Path
import subprocess,json,sys
from PIL import Image,ImageDraw
R=Path(__file__).parent;FF='D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
def extract(video,out,times,origin=0,cols=4,tw=480):
 out.mkdir(exist_ok=True,parents=True);thumbs=[]
 for i,t in enumerate(times):
  p=out/f'{i:03d}-{t+origin:.3f}.jpg';frame=round(t*30);subprocess.run([FF,'-v','error','-y','-i',str(video),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-q:v','2',str(p)],check=True);thumbs.append((p,t+origin))
 for k in range(0,len(thumbs),cols*4):
  batch=thumbs[k:k+cols*4];rows=(len(batch)+cols-1)//cols;im=Image.new('RGB',(cols*tw,rows*(tw*9//16+27)),(20,29,35));d=ImageDraw.Draw(im)
  for j,(p,t) in enumerate(batch):
   pic=Image.open(p);pic.thumbnail((tw,tw*9//16));x=j%cols*tw;y=j//cols*(tw*9//16+27);im.paste(pic,(x,y));d.text((x+9,y+tw*9//16+5),f'{t:06.3f}s',(230,230,220))
  im.save(out/f'sheet-{k//(cols*4):02d}.jpg',quality=94)
if '--samples' in sys.argv:
 extract(R/'renders/sample-convergence.mp4',R/'qa/sample-convergence',[0,1,2,2.9667,3,3.0333,4,5,6,6.9667,7,7.0333,8,9,10,10.9],27)
 extract(R/'renders/sample-press.mp4',R/'qa/sample-press',[i/10 for i in range(40)],50)
else:
 times=[0,2.9,3,6.9,7,10,11.9,12,14,16.9,17,20,21.9,22,24,26.9,27,29.9667,30,33.9667,34,36,37.4667,37.5,39,40.9667,41,44,46.9667,47,49.9667,50,51.5,53,53.9667,54,56,58,59.9667]
 extract(R/'audit-convergence-60.mp4',R/'qa/final-frames',times)
