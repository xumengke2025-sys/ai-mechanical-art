from pathlib import Path
p=Path(__file__).parent/'scene.js'
s=p.read_text(encoding='utf-8').replace("diffuseColor.rgb*=.94+grain*.055", "diffuseColor.rgb*=.97+grain*.022").replace("smoothstep(.25,.85,pat)*.28", "smoothstep(.25,.85,pat)*.18")
s=s.replace("const corners=[[x0,a0],[x1,a0],[x1,a1],[x0,a1],[x0,a0]];", "const corners=[];for(let k=0;k<=8;k++)corners.push([mix(x0,x1,k/8),a0]);for(let k=1;k<=8;k++)corners.push([x1,mix(a0,a1,k/8)]);for(let k=1;k<=8;k++)corners.push([mix(x1,x0,k/8),a1]);for(let k=1;k<=8;k++)corners.push([x0,mix(a1,a0,k/8)]);")
s=s.replace(")),.008,'dark',at.g,3)", ")),.006,'copper',at.g,3)")
p.write_text(s,encoding='utf-8')
