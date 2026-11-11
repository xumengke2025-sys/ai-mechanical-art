from pathlib import Path
p=Path(__file__).parent/'scene.js';s=p.read_text(encoding='utf-8')
s=s.replace('(.98+1.15*c)','(1.42+.91*c)')
s=s.replace('mechanism.add(crown)','skeleton.add(crown)')
s=s.replace("const bands=[];", "const bands=[];")
# Volume-derived forcing prevents acceleration before the bell starts expelling water.
s=s.replace('const motion=[{y:0,v:0}];', "function cavityVolume(t){const m=meridian(contraction(t)),bottom=m.at(-1).y;let volume=0;for(let i=0;i<N;i++){const a=m[i],b=m[i+1];volume+=PI*(a.x+b.x)*((a.y+b.y)/2-bottom)*(b.x-a.x);}return volume;}\nconst motion=[{y:0,v:0}];")
s=s.replace('dc=(contraction(t)-contraction(t-1/120))*120','dc=(cavityVolume(t-1/120)-cavityVolume(t))*120/4')
s=s.replace('oralArms:4,linkError:err','oralArms:4,cavityVolume:cavityVolume(t),linkError:err')
p.write_text(s,encoding='utf-8')
