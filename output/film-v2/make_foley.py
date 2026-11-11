"""Original, deliberately quiet mechanical test foley. No sampled assets."""
from pathlib import Path
import math, random, struct, wave

rate=48000
duration=18
rng=random.Random(19)
events=[(.98,.025,1850), (1.35,.11,690), (2.6,.07,920),
        (6.35,.10,570),(7.5,.045,1250),(8.7,.06,810),
        (9.6,.04,950),(12.9,.10,590),(13.85,.15,310),(14.8,.07,740)]
windows=[(3,6.35,-.8,.0),(6.7,8.9,0,.1),(10,12.9,0,.8),(15,17.6,.8,-.8)]
def smooth(x):
    x=max(0,min(1,x))
    return x*x*(3-2*x)
data=bytearray()
for i in range(rate*duration):
    t=i/rate
    left=right=0.
    noise=rng.uniform(-1,1)
    for start,end,pan0,pan1 in windows:
        if start<=t<=end:
            u=(t-start)/(end-start)
            env=smooth((t-start)/.18)*smooth((end-t)/.22)
            v=env*(.014*math.sin(2*math.pi*132*t)+.005*math.sin(2*math.pi*264*t)+.002*noise)
            pan=pan0+(pan1-pan0)*smooth(u)
            left+=v*math.sqrt((1-pan)/2)
            right+=v*math.sqrt((1+pan)/2)
    for when,amp,freq in events:
        dt=t-when
        if 0<=dt<.36:
            v=amp*(.58*math.sin(2*math.pi*freq*dt)*math.exp(-dt*43)+.3*noise*math.exp(-dt*85)+.12*math.sin(2*math.pi*freq*2.71*dt)*math.exp(-dt*24))
            pan=max(-.75,min(.75,(when-8)/10))
            left+=v*math.sqrt((1-pan)/2)
            right+=v*math.sqrt((1+pan)/2)
    data.extend(struct.pack('<hh',int(max(-1,min(1,left))*32767),int(max(-1,min(1,right))*32767)))
target=Path(__file__).with_name('mechanical-foley.wav')
with wave.open(str(target),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate);f.writeframes(data)
print(target)
