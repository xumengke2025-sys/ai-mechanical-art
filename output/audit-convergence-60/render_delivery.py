from pathlib import Path
import subprocess,sys,json,datetime
R=Path(__file__).parent
log=R/'renders/delivery-log.txt'
with log.open('a',encoding='utf-8') as out:
 def step(cmd):
  out.write('\n'+datetime.datetime.now().isoformat()+' '+repr(cmd)+'\n');out.flush();subprocess.run(cmd,cwd=R,stdout=out,stderr=subprocess.STDOUT,check=True)
 for a,b,n in [(0,30,'part-01'),(30,60,'part-02')]:
  p=R/f'renders/{n}.mp4';m=Path(str(p)+'.manifest.json')
  if not(p.exists() and m.exists()):step(['node','render.cjs','--start',str(a),'--end',str(b),'--out',f'renders/{n}.mp4'])
 step([sys.executable,'finish.py','--finalize'])
 (R/'renders/complete.json').write_text(json.dumps({'complete':True,'timestamp':datetime.datetime.now().isoformat()}))
