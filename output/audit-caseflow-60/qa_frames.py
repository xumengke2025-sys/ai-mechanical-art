from pathlib import Path
import subprocess,json,sys
from PIL import Image,ImageDraw
R=Path(__file__).parent;FF='D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
def extract(video,out,times,origin=0,cols=4,tw=480):
 out.mkdir(exist_ok=True,parents=True);thumbs=[]
 frames=[round(t*30) for t in times]
 if frames!=sorted(set(frames)):raise ValueError('Use ascending, unique decoded frames')
 expr='+'.join(f'eq(n\\,{f})' for f in frames)
 subprocess.run([FF,'-v','error','-y','-i',str(video),'-vf','select='+expr,'-fps_mode','vfr','-q:v','2',str(out/'capture-%03d.jpg')],check=True)
 for i,t in enumerate(times):
  p=out/f'{i:03d}-{t+origin:.3f}.jpg';(out/f'capture-{i+1:03d}.jpg').replace(p);thumbs.append((p,t+origin))
 for k in range(0,len(thumbs),cols*4):
  batch=thumbs[k:k+cols*4];rows=(len(batch)+cols-1)//cols;im=Image.new('RGB',(cols*tw,rows*(tw*9//16+27)),(20,29,35));d=ImageDraw.Draw(im)
  for j,(p,t) in enumerate(batch):
   pic=Image.open(p);pic.thumbnail((tw,tw*9//16));x=j%cols*tw;y=j//cols*(tw*9//16+27);im.paste(pic,(x,y));d.text((x+9,y+tw*9//16+5),f'{t:06.3f}s',(230,230,220))
  im.save(out/f'sheet-{k//(cols*4):02d}.jpg',quality=94)
if __name__=='__main__':
 if '--samples' in sys.argv:
  extract(R/'renders/sample-handoff.mp4',R/'qa/sample-handoff',[i*.5 for i in range(17)],11.5)
 else:
  times=[0,2.9,3,4.3,5.3,6.3,7.8,10,11.4667,11.5,12.5,13.8,14,15.5,17.5,18.1,19.4667,19.5,21,22,23,24.2,25.3,27,29.4667,29.5,31,32,33.5,35.5,37.5,39.3667,39.4,40.5,41.5,43,44,46,47.3667,47.4,49,49.6,50,51.5,52.1,53,53.9667,54,55.9667,56,57.5,59.5,59.9667]
  extract(R/'audit-caseflow-60.mp4',R/'qa/final-frames',times)
