from pathlib import Path
p=Path(__file__).parent
s=(p/'scene.js').read_text(encoding='utf-8')
s=s.replace("scene.environmentIntensity=.52", "scene.environmentIntensity=.42").replace("0x071421,.75", "0x071421,.48").replace("0xffe0ac,3.4", "0xffe0ac,4.0")
at="const cache=new Map()"
shader='''// Object-space patina and fine machining stay attached to every rigid component.
const finishTime={value:0};
for(const [name,m] of Object.entries(materials)){
 if(['glass','ivory','black'].includes(name))continue;
 m.onBeforeCompile=sh=>{
  sh.uniforms.finishTime=finishTime;
  sh.vertexShader='varying vec3 finishP; varying vec3 waterP;\\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\\nfinishP=position; waterP=(modelMatrix*vec4(position,1.)).xyz;');
  sh.fragmentShader='varying vec3 finishP; varying vec3 waterP; uniform float finishTime;\\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float grain=sin(finishP.x*173.+sin(finishP.z*61.))*sin(finishP.y*149.);
   float pat=sin(finishP.x*8.7+sin(finishP.y*11.))*sin(finishP.z*13.1+finishP.y*4.);
   float oxid=smoothstep(.25,.85,pat)*.28;
   diffuseColor.rgb*=.94+grain*.055;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.055,.15,.13),oxid);
  `);
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+oxid*.35+grain*.025,.18,.8);
  `);
  sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float wave=sin(waterP.x*2.1+waterP.z*1.8+finishTime*.44+sin(waterP.z*2.-finishTime*.35));
   float wave2=sin(waterP.x*1.2-waterP.z*2.5-finishTime*.3);
   float caustic=pow(max(0.,1.-abs(wave+wave2)*2.4),6.);
   totalEmissiveRadiance+=vec3(.035,.105,.12)*caustic;
  `);
 };
}
'''
s=s.replace(at,shader+at)
# Detail passes follow the parent body's segmented topology.
at='// Head identity:'
detail='''// Etched inset borders, flush fasteners and alternating service slots.
for(const [lo,hi] of spans){const at=attachment((lo+hi)/2),rows=Math.ceil((hi-lo)/.72);
 for(let n=0;n<rows;n++){const x0=mix(lo,hi,n/rows)+.08,x1=mix(lo,hi,(n+1)/rows)-.08;
  for(const j of [1,2,3,4,7,8,9,10]){
   if((x0>-.7&&x0<2.4)&&[2,3,8,9].includes(j))continue;
   const a0=j*TAU/12+.065,a1=(j+1)*TAU/12-.065;
   const corners=[[x0,a0],[x1,a0],[x1,a1],[x0,a1],[x0,a0]];
   tube(corners.map(([x,a])=>local(surf(x,a,.048),at)),.008,'dark',at.g,3);
   for(const x of [x0+.025,x1-.025])for(const a of [a0+.025,a1-.025]){
    const pt=local(surf(x,a,.06),at),screw=ball(.021,'steel',pt,at.g,3);screw.scale.y=.55;
   }
   if(n%3===1&&[2,9].includes(j))for(let k=0;k<4;k++){
    const a=mix(a0,a1,(k+1)/5);
    tube([local(surf(x0+.10,a,.055),at),local(surf(x1-.10,a,.055),at)],.016,'black',at.g,3);
   }
  }
 }
}
// Bolted bearing housings and oil feed lines make the engine's support legible.
for(const side of [-1,1])for(const x of [1.25,.05,-1.05]){
 const z=side*1.02;
 ring(.175,.025,'steel',[x,.05,z],root,1);
 for(let k=0;k<6;k++){const a=k*TAU/6;bolt([x+.195*Math.cos(a),.05+.195*Math.sin(a),z],root,1,.028);}
 tube([[x,.3,z],[x+.12,.5,z],[x+.12,.68,z*.8]],.016,'copper',root,1);
}
for(const side of [-1,1])for(let j=0;j<3;j++){
 const x=.6+j*.46;
 for(let k=0;k<8;k++){const band=ring(.157,.012,'steel',[x,-1.02+k*.105,side*.58],root,1);band.rotation.x=Math.PI/2;}
}
'''
s=s.replace(at,detail+at)
# Dial graduations remain readable under the moving needle.
s=s.replace("for(let k=0;k<12;k++){const a=k*TAU/12;rod([.12*Math.cos(a),.12*Math.sin(a),.075],[.142*Math.cos(a),.142*Math.sin(a),.075],.006,'black',g,1);}","for(let k=0;k<48;k++){const a=k*TAU/48,r=k%4===0?.115:.132;rod([r*Math.cos(a),r*Math.sin(a),.075],[.145*Math.cos(a),.145*Math.sin(a),.075],k%4===0?.004:.002,'black',g,1);} ring(.105,.002,'copper',[0,0,.076],g,1);")
# Water particles use soft sprites, with an authored wake emitted from historical tail poses.
at='const fish=[];'
water='''const dotCanvas=document.createElement('canvas');dotCanvas.width=dotCanvas.height=64;
const dc=dotCanvas.getContext('2d'),dg=dc.createRadialGradient(32,32,0,32,32,32);dg.addColorStop(0,'rgba(215,247,255,.8)');dg.addColorStop(.25,'rgba(173,227,237,.4)');dg.addColorStop(1,'rgba(140,216,230,0)');dc.fillStyle=dg;dc.fillRect(0,0,64,64);
const dotMap=new T.CanvasTexture(dotCanvas);snow.material.map=dotMap;snow.material.size=.085;snow.material.opacity=.48;
const wakeCount=260,wakeG=new T.BufferGeometry(),wakeArray=new Float32Array(wakeCount*3);wakeG.setAttribute('position',new T.BufferAttribute(wakeArray,3));
const wake=new T.Points(wakeG,new T.PointsMaterial({color:0x8fc5c8,map:dotMap,size:.16,transparent:true,opacity:.25,depthWrite:false,blending:T.AdditiveBlending}));scene.add(wake);
function updateWater(t){finishTime.value=t;snow.rotation.y=t*.0015;
 wake.visible=t>18;
 for(let i=0;i<wakeCount;i++){const age=((t*.4+i/wakeCount)*1.0)%1*5,emit=Math.max(17,t-age),a=i*2.39996;
  const base=V([-8.2,.3*Math.sin(phase(emit)-2),0]).applyEuler(bodyOrientation(emit)).add(path(emit));
  const r=.15+age*.25;base.x-=age*.28;base.y+=Math.sin(a)*r+age*.10;base.z+=Math.cos(a)*r;
  wakeArray.set(base.toArray(),i*3);
 }wakeG.attributes.position.needsUpdate=true;wake.material.opacity=.24*ramp(t,18,21);
}
'''
s=s.replace(at,water+at)
s=s.replace("renderer.render(scene,camera);","updateWater(t);renderer.render(scene,camera);")
# A deliberate fin opening accents the launch, preserving the existing body rig.
s=s.replace("f.s*(.17+.20*Math.sin(ph-.6)+.22*turn)+.22*turn","f.s*(.17+.20*Math.sin(ph-.6)+.22*turn-.16*(ramp(t,17,19)-ramp(t,21,23)))+.22*turn")
s=s.replace("revision:'anatomy-articulation-camera-rebuild'","revision:'machining-patina-water-performance-refinement'")
(p/'scene.js').write_text(s,encoding='utf-8')
r=(p/'render.cjs').read_text(encoding='utf-8').replace('/mechanical-whale-rebuild/index.html','/mechanical-whale-finesse/index.html')
(p/'render.cjs').write_text(r,encoding='utf-8')
r=(p/'final-evidence.py').read_text(encoding='utf-8').replace('mechanical-whale-rebuilt.mp4','mechanical-whale-refined.mp4')
(p/'final-evidence.py').write_text(r,encoding='utf-8')
