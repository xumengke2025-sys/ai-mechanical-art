"""Prepare original audio, timed captions and the final delivery. Re-runnable."""
from pathlib import Path
import subprocess, json, wave, math, re, hashlib, sys, os
import numpy as np

R=Path(__file__).parent
FF=Path(os.environ.get('FFMPEG_PATH','D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'))
SR=44100; DUR=180; N=SR*DUR
content=json.loads((R/'content.json').read_text(encoding='utf-8'))
captions=[
 (0,4,'从异常到证据 · 精密审计实验室'),
 (4,8,'一次测评跨级改变，意味着什么？'),
 (8,11,'正常调整，还是值得核查的信号？'),
 (11,15,'审计首先需要看清变化的依据'),
 (15,20,'让同一份客户证据，贯穿整个过程'),
 (20,24,'开户档案、风险问卷、测评历史、交易记录'),
 (24,28,'按同一客户关联，统一字段口径'),
 (28,31,'每一条疑点，都要能返回原始来源'),
 (31,35,'缺失或无法匹配的材料，先进入待补证'),
 (35,39,'把审计人员的业务思路展开'),
 (39,44,'大模型辅助形成规则脚本草稿'),
 (44,49,'经过审核与验证，再绑定规则版本'),
 (49,55,'沿用月度跑批，让重复排查能够持续运行'),
 (55,59,'初筛，先看两类有依据的变化'),
 (59,64,'开户档案与风险问卷，按相同字段比对'),
 (64,68,'家庭年收入、职业、最高学历'),
 (68,72,'保留差异字段，真实性仍需后续核查'),
 (72,76,'同季度内，任意两次测评等级差至少两级'),
 (76,79,'上调与下调，都需要保留修改轨迹'),
 (79,83,'信息差异与跨级变化，形成初筛疑点'),
 (83,89,'再加入变更后的交易佐证，核查行为链条'),
 (89,92,'无异常、无交易佐证：持续关注'),
 (92,96,'信息强异常，但无交易佐证'),
 (96,100,'单项特征出现：一般关注'),
 (100,104,'强异常，叠加短期购入高风险产品佐证'),
 (104,108,'两项特征同时出现：重点关注'),
 (108,112,'无异常，但有交易佐证：一般关注'),
 (112,115,'四种证据组合，不代表已经认定违规'),
 (115,121,'沿归属索引，从客户记录继续向上'),
 (121,127,'客户 → 客户经理或经纪人 → 营业部'),
 (127,134,'按客户去重汇总，识别异常线索的聚集'),
 (134,140,'方案人数阈值：0—4 持续，5—9 一般，至少10人重点关注'),
 (140,146,'单客户证据组合，与机构人数阈值分别呈现'),
 (146,150,'设备指纹、交易流水、销售留痕与相关说明'),
 (150,154,'线索到达人工复核闸，继续核查真实性'),
 (154,158,'补证、排除、确认，均保留复核记录'),
 (158,165,'最终风险定性与处罚，必须由人工审核确认'),
 (165,170,'经审核的反馈，返回规则复盘与版本管理'),
 (170,174,'为下一轮月度监测，保留依据与经验'),
 (174,178,'持续发现 · 靶向核查 · 经验留存'),
 (178,180,'建设方案与匿名流程演示')
]

def ts(t,ass=False):
    if ass:
        q=round(t*100);return f'{q//360000}:{q//6000%60:02d}:{q//100%60:02d}.{q%100:02d}'
    q=round(t*1000);return f'{q//3600000:02d}:{q//60000%60:02d}:{q//1000%60:02d},{q%1000:03d}'

def prepare():
    (R/'renders').mkdir(exist_ok=True);(R/'qa').mkdir(exist_ok=True)
    (R/'captions.srt').write_text('\n\n'.join(f'{i+1}\n{ts(a)} --> {ts(b)}\n{s}' for i,(a,b,s) in enumerate(captions))+'\n',encoding='utf-8')
    header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,34,&H00E8F1F5,&H00E8F1F5,&H001A231F,&H60000000,0,0,0,0,100,100,1,0,1,1.6,1.0,2,80,80,35,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    (R/'captions.ass').write_text(header+''.join(f'Dialogue: 0,{ts(a,True)},{ts(b,True)},Default,,0,0,0,,{{\\fad(120,120)}}{s}\n' for a,b,s in captions),encoding='utf-8-sig')
    prose='从异常到证据 · 现场讲述稿\n\n资料来源：2026年7月《AI 驱动・审计非现场智能监测体系建设》。本片为建设方案和匿名流程演示。\n\n'
    for c in content['chapters']:
        prose+=f"{ts(c['start'])[:8]}—{ts(c['end'])[:8]}  {c['title']}\n{c['text']}\n来源：PDF第{','.join(map(str,c['source']))}页\n\n"
    prose+='参数边界：材料未定义短期天数、强异常完整计算口径、字段更新容差及全部去重边界；片中不自行编造。缺数据进入待补证，不按无异常处理。客户证据组合与机构人数阈值分开展示。\n'
    (R/'讲述稿.txt').write_text(prose,encoding='utf-8')
    rng=np.random.default_rng(2317);music=np.zeros((N,2),np.float32);fx=np.zeros_like(music);sources={};cache={}
    for midi,name in [(48,'C3'),(60,'C4'),(72,'C5')]:
        data=subprocess.check_output([str(FF),'-v','error','-i',str(R/'assets'/f'piano-{name}.mp3'),'-f','f32le','-ac','1','-ar',str(SR),'-'])
        y=np.frombuffer(data,np.float32).copy();y/=max(.01,float(np.max(np.abs(y))));sources[midi]=y
    def place(track,y,t,amp=1,pan=0):
        i=round(t*SR)
        if i<0 or i>=N:return
        y=y[:N-i];track[i:i+len(y),0]+=y*(amp*math.sqrt((1-pan)*.5));track[i:i+len(y),1]+=y*(amp*math.sqrt((1+pan)*.5))
    def note(midi,d=2.8):
        key=(midi,d)
        if key not in cache:
            base=min(sources,key=lambda n:abs(n-midi));s=sources[base];rate=2**((midi-base)/12)
            idx=np.arange(min(round(d*SR),int(len(s)/rate)))*rate;y=np.interp(idx,np.arange(len(s)),s).astype(np.float32)
            a=min(300,len(y));b=min(round(.35*SR),len(y));y[:a]*=np.linspace(0,1,a);y[-b:]*=np.linspace(1,0,b);cache[key]=y
        return cache[key]
    chords=[[50,57,62,66],[47,54,59,62],[43,55,59,62],[45,57,61,64],[43,55,59,62],[50,57,62,66],[40,55,59,64],[45,57,61,64]]
    melody=[66,69,74,73,71,69,66,64,62,66,69,71,74,73,69,66]
    for bar in range(60):
        t=bar*3;c=chords[bar%8];amp=.85 if 28<=bar<39 else 1.0
        place(music,note(c[0],3.0),t,.16*amp,-.22)
        for k in range(4):place(music,note(c[1+k%3],2.4),t+(k+.5)*.75,.065*amp,[-.12,.16,.24,-.16][k])
        if bar%4!=3:
            for k in range(2):place(music,note(melody[(bar*2+k)%16],2.6),t+.375+k*1.125,.085*amp,.16)
    for e in content['audioEvents']:
        typ=e['type'];d={'rail':1.8,'glass':1.0,'paper':.26,'clack':.16,'tick':.08}[typ];u=np.arange(round(d*SR))/SR
        if typ=='rail':y=(rng.normal(0,.22,len(u))+.24*np.sin(2*np.pi*145*u))*np.sin(np.pi*u/d)**2;vol=.016
        elif typ=='glass':y=(np.sin(2*np.pi*1420*u)+.3*np.sin(2*np.pi*2347*u))*np.exp(-u*6)*np.minimum(u/.006,1);vol=.025
        elif typ=='paper':y=rng.normal(0,.5,len(u));y=(y+np.roll(y,1)+np.roll(y,2))/3*np.sin(np.pi*u/d)**2;vol=.025
        elif typ=='clack':y=(np.sin(2*np.pi*620*u)+.35*np.sin(2*np.pi*1700*u))*np.exp(-u*48)+rng.normal(0,.18,len(u))*np.exp(-u*100);y*=np.minimum(u/.0015,1);vol=.065
        else:y=rng.normal(0,.7,len(u))*np.exp(-u*90)*np.minimum(u/.001,1);vol=.025
        place(fx,y.astype(np.float32),e['t'],vol,.18*math.sin(e['t']*.08))
    for delay,gain in [(.043,.16),(.089,.10),(.151,.05)]:
        k=round(delay*SR);music[k:]+=music[:-k,::-1]*gain
    music*=.035/max(float(np.sqrt(np.mean(music**2))),.001);mix=music+fx
    fade=np.ones(N,np.float32);a=round(2*SR);b=round(4*SR);fade[:a]=np.linspace(0,1,a);fade[-b:]=np.linspace(1,0,b);mix*=fade[:,None]
    peak=float(np.max(np.abs(mix)))
    if peak>.40:mix*=.40/peak
    with wave.open(str(R/'renders'/'soundtrack.wav'),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
    stats={'duration':DUR,'sample_rate':SR,'channels':2,'peak':float(np.max(np.abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'audio_events':len(content['audioEvents']),'narration':False,'listened':False}
    (R/'qa'/'audio-stats.json').write_text(json.dumps(stats,indent=2));print(json.dumps(stats),flush=True)

def finalize():
    part_prefix='repaired-' if '--repaired' in sys.argv else ''
    parts=[f'{part_prefix}part-{i:02d}.mp4' for i in (1,2)]
    if '--segments' in sys.argv:parts=json.loads((R/'renders'/'delivery-segments.json').read_text(encoding='utf-8'))
    cat=R/'renders'/'concat.txt';cat.write_text(''.join(f"file '{p}'\n" for p in parts),encoding='utf-8')
    silent=R/'renders'/'full-silent.mp4'
    def run(args):subprocess.run([str(FF),'-hide_banner','-loglevel','warning','-y',*map(str,args)],check=True,cwd=R)
    run(['-f','concat','-safe','0','-i',cat,'-c','copy',silent])
    run(['-i',silent,'-i',R/'renders'/'soundtrack.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',R/'audit-laboratory-clean.mp4'])
    run(['-i',R/'audit-laboratory-clean.mp4','-vf','ass=captions.ass','-c:v','libx264','-preset','fast','-crf','17','-threads','4','-c:a','copy','-movflags','+faststart',R/'audit-laboratory-film.mp4'])
    result={}
    for name in ['audit-laboratory-film.mp4','audit-laboratory-clean.mp4']:
        p=R/name;r=subprocess.run([str(FF),'-hide_banner','-i',str(p),'-map','0:v','-map','0:a','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
        (R/'qa'/f'{p.stem}-decode.txt').write_text(r.stderr,encoding='utf-8')
        if r.returncode:raise RuntimeError(r.stderr[-4000:])
        result[name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode_exit':r.returncode,'actual_decode':r.stderr[-1200:]}
    (R/'qa'/'delivery-manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False),flush=True)

if '--finalize' in sys.argv:finalize()
else:prepare()
