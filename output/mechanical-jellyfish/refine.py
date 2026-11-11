from pathlib import Path
p=Path(__file__).parent/'scene.js'
s=p.read_text(encoding='utf-8')
s=s.replace('p.y+.025*Math.cos(ang*24)*q**8','p.y+.025*Math.sin(ang*24)*q**8')
s=s.replace('const shaft=start.clone().lerp(end,.48)','const shaft=start.clone().add(end.clone().sub(start).normalize().multiplyScalar(.38))')
s=s.replace('full?100:45,across=8','full?160:64,across=12')
s=s.replace('V(.17*Math.cos(angle),.26,.17*Math.sin(angle))','V(.32*Math.cos(angle),.26,.32*Math.sin(angle))')
s=s.replace('.19*Math.cos(theta)+.22*Math.sin(t*.42-q*2.4+a.k)','.24*Math.cos(theta)+.10*Math.sin(t*.42-q*2.4+a.k)')
s=s.replace('.19*Math.sin(theta)+.18*Math.sin(t*.38-q*2.8+a.k)','.24*Math.sin(theta)+.08*Math.sin(t*.38-q*2.8+a.k)')
s=s.replace('angle+q*2.3+.13*Math.sin(t*.55-q*2)','angle+q*4.2+.18*Math.sin(t*.55-q*2)')
s=s.replace('(.16+.30*Math.sin(PI*q)**.7)*(1-.78*q**3)','(.12+.24*Math.sin(PI*q)**.7)*(1-.78*q**3)*(1+.14*Math.sin(q*TAU*9+a.k))')
s=s.replace('ruff=.11*Math.sin(q*TAU*13+t*.65-q*2+a.k)','ruff=.028*Math.sin(q*TAU*9+t*.65-q*2+a.k)')
s=s.replace('j.membrane.material.opacity=.24','j.membrane.material.opacity=.38')
s=s.replace("const main=buildJelly(true)","const main=buildJelly(true)")
# Lace is a small repeating woven mesh: open holes, not blank rigid sheets.
target='const timeUniform={value:0};'
lace="""const lc=document.createElement('canvas');lc.width=128;lc.height=256;const lx=lc.getContext('2d');lx.fillStyle='#fff';lx.fillRect(0,0,128,256);lx.fillStyle='#000';for(let row=0;row<16;row++)for(let col=0;col<8;col++){lx.beginPath();lx.ellipse(col*16+(row%2?8:0),row*16,3.5,5,0,0,TAU);lx.fill();}const laceTex=new T.CanvasTexture(lc);laceTex.wrapS=laceTex.wrapT=T.RepeatWrapping;laceTex.repeat.set(1,8);mat.ivory.alphaMap=laceTex;mat.ivory.alphaTest=.35;
"""
s=s.replace(target,lace+target)
target='const radial=48,angular=144'
extra="""if(full)for(let k=0;k<8;k++){const angle=k/8*TAU,pg=new T.Group();pg.position.set(.46*Math.cos(angle),1.37,.46*Math.sin(angle));pg.rotation.y=-angle;mechanism.add(pg);const wheel=mesh(new T.TorusGeometry(.09,.014,6,28),'copper',pg);for(let z=0;z<6;z++){const a=z/6*TAU,spoke=rod(.008,'brass',pg);setRod(spoke,V(0,0,0),V(.085*Math.cos(a),.085*Math.sin(a),0));}ball(.025,'steel',pg);}
 const radial=48,angular=144"""
s=s.replace(target,extra)
# Mechanism appears in a paced order; appendages follow individually.
s=s.replace('j.fly.rotation.y=t*1.3;j.mechanism.visible=reveal>.15;j.appendages.visible=reveal>.32;j.skin.visible=reveal>.7;',"""j.fly.rotation.y=t*1.3;j.mechanism.visible=reveal>.15;j.appendages.visible=reveal>.32;j.skin.visible=reveal>.7;
 if(j.full){for(let k=0;k<24;k++)j.tentacles[k].t.o.visible=reveal>.33+k*.004;for(let k=0;k<4;k++){const on=reveal>.44+k*.035;j.arms[k].g.userData.visible=on;const obj=j.arms[k].edges;for(const e of obj)e.o.visible=on;}if(j.beads)j.beads.visible=reveal>.44;}
""")
# Set arm mesh visibility (geometry isn't an Object3D).
s=s.replace('arms.push({g,p,n,across,k,edges:', 'arms.push({o,g,p,n,across,k,edges:')
s=s.replace('j.arms[k].g.userData.visible=on','j.arms[k].o.visible=on')
p.write_text(s,encoding='utf-8')
