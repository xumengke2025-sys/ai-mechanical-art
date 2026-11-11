"""Original 30-second cue; piano samples: Alexander Holm / Salamander / CC BY 3.0."""
from pathlib import Path
import numpy as np,subprocess,wave,json
ROOT=Path(__file__).parent;SR=48000;D=30;N=SR*D
FF=next((ROOT.parent.parent/'.tools/video-runtime/imageio_ffmpeg/binaries').glob('ffmpeg-*.exe'))
rng=np.random.default_rng(731);track=np.zeros((N,2),dtype=np.float64)
def add(signal,at,gain=.1,pan=0):
    start=int(at*SR);a=max(0,start);b=min(N,start+len(signal))
    if a>=b:return
    s=signal[a-start:b-start]*gain
    track[a:b,0]+=s*np.sqrt((1-pan)/2);track[a:b,1]+=s*np.sqrt((1+pan)/2)
samples={}
for midi,key in [(48,'C3'),(60,'C4'),(72,'C5')]:
    p=ROOT.parent/'probation-film/assets'/f'piano-{key}.mp3'
    raw=subprocess.run([str(FF),'-v','error','-i',str(p),'-f','f32le','-ac','1','-ar',str(SR),'pipe:1'],capture_output=True,check=True).stdout
    samples[midi]=np.frombuffer(raw,np.float32)
def piano(midi,at,gain=.13,pan=0):
    base=min(samples,key=lambda x:abs(x-midi));src=samples[base];rate=2**((midi-base)/12)
    idx=np.arange(0,len(src)-1,rate);s=np.interp(idx,np.arange(len(src)),src)
    length=min(len(s),int(6*SR));s=s[:length];env=np.minimum(1,np.arange(length)/(SR*.012));env*=np.minimum(1,(length-np.arange(length))/(SR*.6))
    add(s*env,at,gain,pan)
# Spacious D minor / B-flat / F / C(add9), no per-cut impact music.
notes=[(0,50,.15,-.15),(1.4,57,.11,.2),(2.8,64,.08,-.3),(4.1,65,.10,.25),(5.6,69,.08,.05),
       (7.5,46,.14,-.2),(9,53,.11,.2),(10.5,60,.09,-.1),(12,62,.11,.3),(13.5,65,.08,0),
       (15,41,.14,-.1),(16.5,53,.11,.2),(18,60,.13,-.2),(19.4,64,.11,.3),(20.8,67,.09,-.1),
       (22.5,48,.13,-.2),(24,55,.10,.2),(25.4,62,.10,-.1),(26.8,64,.08,.2)]
for at,m,g,p in notes:piano(m,at,g,p)
# Soft bowed harmonic beds, slow attack; low level leaves mechanics exposed.
for at,chord in [(0,[38,45,53]),(7.5,[34,41,50]),(15,[41,48,57]),(22.5,[36,43,50])]:
    t=np.arange(int(8*SR))/SR;env=np.minimum(1,t/2)*np.minimum(1,(8-t)/2)
    for j,m in enumerate(chord):
        f=440*2**((m-69)/12);v=.002*np.sin(2*np.pi*4.8*t+j)
        tone=sum(np.sin(2*np.pi*f*k*t+v*k)*(.48**(k-1)) for k in range(1,5))
        add(tone*env,at,.011,(-.3+j*.3))
# World hush and mechanically synchronized tail-water pulses.
t=np.arange(N)/SR;noise=rng.normal(0,1,N);low=np.convolve(noise,np.ones(150)/150,mode='same')
u=np.clip((t-18)/5,0,1);phase=.86*t+.16*(5*(2.5*u**4-3*u**5+u**6)+np.maximum(0,t-23))
swim=np.clip((t-9)/2,0,1);pulse=(.5+.5*np.cos(1.8*phase))**5
add(low*(.025+.045*pulse*swim),0,1,-.2);add(np.roll(low,700)*.023,0,1,.4)
# Damped metallic pin sounds, quiet enough to remain texture.
for at in np.arange(4.4,29,.72):
    tt=np.arange(int(.14*SR))/SR;click=(np.sin(2*np.pi*1170*tt)+.35*np.sin(2*np.pi*2630*tt))*np.exp(-tt*65)
    add(click,at,.004 if at<18 else .0018,.15*np.sin(at))
for at in [4.2,9.3,14.3,17.0]:
    tt=np.arange(int(.9*SR))/SR;tone=(np.sin(2*np.pi*392*tt)+.2*np.sin(2*np.pi*1082*tt))*np.exp(-tt*6)*np.minimum(1,tt/.008)
    add(tone,at,.012,-.1)
# Deterministic stereo room/diffusion tails, all fades fit the 30 s delivery.
dry=track.copy()
for sec,g,cross in [(.137,.20,True),(.263,.14,False),(.431,.10,True),(.719,.07,False),(1.113,.045,True)]:
    n=int(sec*SR);track[n:]+=dry[:-n,::-1] * g if cross else dry[:-n]*g
env=np.minimum(1,t/.8)*np.clip((30-t)/2.1,0,1);track*=env[:,None]
peak=float(np.max(np.abs(track)));track*=min(2.7,.75/max(peak,1e-6));peak=float(np.max(np.abs(track)))
out=ROOT/'renders/soundtrack.wav';out.parent.mkdir(exist_ok=True)
with wave.open(str(out),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(track,-1,1)*32767).astype('<i2').tobytes())
(ROOT/'qa/audio-technical.json').write_text(json.dumps({'duration':D,'sample_rate':SR,'peak':peak,'rms':float(np.sqrt(np.mean(track**2))),'listened':False,'piano_credit':'Alexander Holm, Salamander Grand Piano, CC BY 3.0; edited/pitched/reverberated','notes':notes},indent=2),encoding='utf-8')
print(str(out));print('peak',peak)
