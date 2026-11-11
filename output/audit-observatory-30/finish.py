"""30-second revision: remapped sound/captions, final mux and technical checks."""
from pathlib import Path
import subprocess,json,wave,math,hashlib,sys,os
import numpy as np
R=Path(__file__).parent
FF=Path('D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe')
PROBE=Path('D:/Codex/skills/video-shotcraft/workbench/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe')
SR=44100;DUR=30;N=SR*DUR
def run(args,**kw):return subprocess.run([str(FF),'-hide_banner','-loglevel','warning','-y',*map(str,args)],check=True,cwd=R,**kw)
def ts(t,ass=False):
 h=int(t//3600);m=int(t//60)%60;s=t%60
 return f'{h}:{m:02d}:{s:05.2f}' if ass else f'{h:02d}:{m:02d}:{int(s):02d},{round((s%1)*1000):03d}'
def prepare():
 data=json.loads((R/'content.json').read_text(encoding='utf-8'));caps=data['captions'];(R/'captions.srt').write_text('\n\n'.join(f'{i+1}\n{ts(a)} --> {ts(b)}\n{s}' for i,(a,b,s) in enumerate(caps))+'\n',encoding='utf-8')
 header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,34,&H00EAF3F1,&H00EAF3F1,&H00182022,&H60000000,0,0,0,0,100,100,1,0,1,1.7,1,2,80,80,36,1
Style: Title,Microsoft YaHei,56,&H00D6E9E5,&H00D6E9E5,&H00131D23,&H60000000,0,0,0,0,100,100,5,0,1,1.6,1,8,80,80,95,1
Style: Small,Microsoft YaHei,23,&H00B9CACA,&H00B9CACA,&H00131D23,&H60000000,0,0,0,0,100,100,2,0,1,1.1,0,8,80,80,170,1
Style: Note,Microsoft YaHei,20,&H00C2D0CB,&H00C2D0CB,&H00131D23,&H60000000,0,0,0,0,100,100,1,0,1,1.1,0,1,58,58,87,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 events=''
 for a,b,s in caps:
  placement=''
  events+=f'Dialogue: 0,{ts(a,True)},{ts(b,True)},Default,,0,0,0,,{{\\fad(90,90){placement}}}{s}\n'
 events+='Dialogue: 2,0:00:00.00,0:00:30.00,Note,,0,0,0,,{\\fad(100,100)}建设方案 · 虚构客户案例\n'
 (R/'captions.ass').write_text(header+events,encoding='utf-8-sig')
 prose='审计仪器庭院 · 30秒多视角版\n\n开场：AI非现场审计，一次测评跨级，如何核查？\n基于《AI 驱动・审计非现场智能监测体系建设》PDF第16、19—24页。沿用已核对的25页材料。建设方案与虚构匿名案例演示，无口播，配乐与拟音。\n\n'
 prose+='\n'.join(f'{ts(a)[:8]}—{ts(b)[:8]}  {s}' for a,b,s in caps)
 prose+='\n\n案例边界：A017、M04、B02为虚构匿名标识，学历本科/硕士及后续交易为解释性示例。R1到R3是原文例子，同季度差值至少2级，上下调均覆盖。侧重展示先后关系，不编造交易间隔、金额、产品匹配标准或风险打分。设备指纹只是核查依据，不能直接证明本人操作；归属不等同责任成立。案例结束于人工复核，不编造最终违规结论。MVP月度跑批；AI规则草稿须审核验证。最终风险定性与处罚人工确认。机械与玻璃为解释性比喻，非物理仿真或历史复原。\n'
 (R/'讲述稿.txt').write_text(prose,encoding='utf-8')
 rng=np.random.default_rng(6319);music=np.zeros((N,2),np.float32);fx=np.zeros_like(music);sources={};cache={}
 for midi,name in [(48,'C3'),(60,'C4'),(72,'C5')]:
  y=np.frombuffer(subprocess.check_output([str(FF),'-v','error','-i',str(R/'assets'/f'piano-{name}.mp3'),'-f','f32le','-ac','1','-ar',str(SR),'-']),np.float32).copy();y/=max(.01,float(np.max(abs(y))));sources[midi]=y
 def place(track,y,t,amp=1,pan=0):
  i=round(t*SR)
  if i<0 or i>=N:return
  y=y[:N-i];track[i:i+len(y),0]+=y*amp*math.sqrt((1-pan)*.5);track[i:i+len(y),1]+=y*amp*math.sqrt((1+pan)*.5)
 def note(midi,d=1.6):
  key=(midi,d)
  if key not in cache:
   base=min(sources,key=lambda n:abs(n-midi));s=sources[base];rate=2**((midi-base)/12);idx=np.arange(min(round(d*SR),int(len(s)/rate)))*rate;y=np.interp(idx,np.arange(len(s)),s).astype(np.float32);a=min(300,len(y));b=min(round(.22*SR),len(y));y[:a]*=np.linspace(0,1,a);y[-b:]*=np.linspace(1,0,b);cache[key]=y
  return cache[key]
 chords=[[50,57,62,65],[46,53,58,62],[43,55,58,62],[45,57,61,64]]
 # 120 BPM, compact piano ostinato plus a quiet original mechanical pulse.
 for k in range(15):
  t=k*2;c=chords[k%4];place(music,note(c[0],2),t,.14,-.15)
  for j in range(8):place(music,note(c[1+j%3],1.4),t+j*.25,.045+(j%2)*.012,(-1 if j%2 else 1)*.24)
  if k%2==0:place(music,note(c[3]+12,2.0),t+.75,.075,.13)
 for t in np.arange(0,27,.5):
  u=np.arange(round(.10*SR))/SR;y=(np.sin(2*np.pi*(76*u-120*u*u))+.10*rng.normal(size=len(u)))*np.exp(-u*48)*np.minimum(u/.002,1);place(fx,y.astype(np.float32),float(t),.025,0)
 for e in data['audioEvents']:
  typ=e['type'];d={'rail':1.5,'glass':.8,'clack':.18,'tick':.08}[typ];u=np.arange(round(d*SR))/SR
  if typ=='rail':y=(rng.normal(0,.22,len(u))+.2*np.sin(2*np.pi*150*u))*np.sin(np.pi*u/d)**2;vol=.017
  elif typ=='glass':y=(np.sin(2*np.pi*1410*u)+.3*np.sin(2*np.pi*2251*u))*np.exp(-u*7)*np.minimum(u/.005,1);vol=.030
  elif typ=='clack':y=(np.sin(2*np.pi*540*u)+.3*np.sin(2*np.pi*1720*u))*np.exp(-u*45)+rng.normal(0,.16,len(u))*np.exp(-u*100);y*=np.minimum(u/.0015,1);vol=.070
  else:y=rng.normal(0,.7,len(u))*np.exp(-u*90)*np.minimum(u/.001,1);vol=.027
  place(fx,y.astype(np.float32),e['t'],vol,.15*math.sin(e['t']))
 for delay,gain in [(.047,.15),(.101,.08)]:
  k=round(delay*SR);music[k:]+=music[:-k,::-1]*gain
 music*=.043/max(float(np.sqrt(np.mean(music**2))),.001);mix=music+fx;fade=np.ones(N,np.float32);fade[:round(.15*SR)]=np.linspace(0,1,round(.15*SR));fade[-round(2*SR):]=np.linspace(1,0,round(2*SR));mix*=fade[:,None];peak=float(np.max(abs(mix)))
 if peak>.7:mix*=.7/peak
 with wave.open(str(R/'renders/soundtrack.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
 stats={'duration':DUR,'sample_rate':SR,'channels':2,'peak':float(np.max(abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'bpm':120,'narration':False,'listened':False};(R/'qa/audio-stats.json').write_text(json.dumps(stats,indent=2));print(json.dumps(stats),flush=True)
def finalize():
 run(['-i',R/'renders/full-silent.mp4','-i',R/'renders/soundtrack.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',R/'audit-observatory-30-clean.mp4'])
 run(['-i',R/'audit-observatory-30-clean.mp4','-vf','ass=captions.ass','-c:v','libx264','-preset','fast','-crf','17','-threads','4','-c:a','copy','-movflags','+faststart',R/'audit-observatory-30.mp4'])
 result={}
 for name in ['audit-observatory-30.mp4','audit-observatory-30-clean.mp4']:
  p=R/name;q=subprocess.run([str(FF),'-v','error','-i',str(p),'-map','0:v','-map','0:a','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace');(R/'qa'/f'{p.stem}-decode.txt').write_text(q.stderr,encoding='utf-8')
  if q.returncode:raise RuntimeError(q.stderr)
  meta=json.loads(subprocess.check_output([str(PROBE),'-v','error','-show_streams','-show_format','-of','json',str(p)]));result[name]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'decode_exit':0,'metadata':meta}
 (R/'qa/delivery-manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print('FINALIZED',flush=True)
if '--finalize' in sys.argv:finalize()
else:prepare()
