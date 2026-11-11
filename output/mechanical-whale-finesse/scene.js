import * as T from 'three';
import {RoomEnvironment} from '../film-v2/vendor/RoomEnvironment.js';
const query=new URLSearchParams(location.search),W=+(query.get('w')||1080),H=Math.round(W*16/9);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),mix=T.MathUtils.lerp;
const ease=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));},ramp=(t,a,b)=>ease((t-a)/(b-a));
const V=p=>new T.Vector3(...p),TAU=Math.PI*2;
let seed=923;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,W/H,.15,240);
scene.background=new T.Color('#061a26');scene.fog=new T.FogExp2('#082431',.012);
const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.05).texture;scene.environmentIntensity=.42;room.dispose();pm.dispose();
scene.add(new T.HemisphereLight(0x90c6d7,0x071421,.48));
const key=new T.DirectionalLight(0xffe0ac,4.0);key.position.set(8,16,14);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:.1,far:90});key.shadow.bias=-.00015;key.shadow.normalBias=.025;scene.add(key);scene.add(key.target);
const rim=new T.DirectionalLight(0x5ebccb,3.3);rim.position.set(-8,8,-12);scene.add(rim);scene.add(rim.target);
const fill=new T.DirectionalLight(0x689cae,.9);fill.position.set(0,-5,12);scene.add(fill);scene.add(fill.target);
const root=new T.Group();scene.add(root);
function texture(){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#999999';ctx.fillRect(0,0,512,512);for(let i=0;i<11000;i++){const v=80+rand()*95;ctx.fillStyle=`rgba(${v},${v},${v},.20)`;ctx.fillRect(rand()*512,rand()*512,rand()*10+.4,.5);}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;}
const tex=texture();
const materials={
 brass:new T.MeshStandardMaterial({color:'#9b7843',metalness:.87,roughness:.34,bumpMap:tex,bumpScale:.009}),
 edge:new T.MeshStandardMaterial({color:'#d7bd83',metalness:.85,roughness:.26}),
 dark:new T.MeshStandardMaterial({color:'#172a32',metalness:.86,roughness:.38}),
 steel:new T.MeshStandardMaterial({color:'#627985',metalness:.92,roughness:.26}),
 copper:new T.MeshStandardMaterial({color:'#975b3d',metalness:.8,roughness:.37}),
 enamel:new T.MeshStandardMaterial({color:'#254c4d',metalness:.66,roughness:.31,bumpMap:tex,bumpScale:.005}),
 black:new T.MeshStandardMaterial({color:'#071116',metalness:.55,roughness:.42}),
 ivory:new T.MeshStandardMaterial({color:'#d0c9ae',metalness:.25,roughness:.46}),
 glass:new T.MeshPhysicalMaterial({color:'#032d36',metalness:.45,roughness:.10,clearcoat:1}),
};
// Object-space patina and fine machining stay attached to every rigid component.
const finishTime={value:0};
for(const [name,m] of Object.entries(materials)){
 if(['glass','ivory','black'].includes(name))continue;
 m.onBeforeCompile=sh=>{
  sh.uniforms.finishTime=finishTime;
  sh.vertexShader='varying vec3 finishP; varying vec3 waterP;\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfinishP=position; waterP=(modelMatrix*vec4(position,1.)).xyz;');
  sh.fragmentShader='varying vec3 finishP; varying vec3 waterP; uniform float finishTime;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float grain=sin(finishP.x*173.+sin(finishP.z*61.))*sin(finishP.y*149.);
   float pat=sin(finishP.x*8.7+sin(finishP.y*11.))*sin(finishP.z*13.1+finishP.y*4.);
   float oxid=smoothstep(.25,.85,pat)*.18;
   diffuseColor.rgb*=.97+grain*.022;
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
const cache=new Map(),layers=[[],[],[],[]];let meshCount=0;
const geom=(key,fn)=>{if(!cache.has(key))cache.set(key,fn());return cache.get(key);};
function mesh(g,name,p=[0,0,0],parent=root,layer=0){const m=new T.Mesh(g,materials[name]);m.position.fromArray(p);m.castShadow=true;m.receiveShadow=true;parent.add(m);meshCount++;if(layer>0){m.userData.reveal=clamp((6-p[0])/15);layers[layer].push(m);}return m;}
function cylinder(r,h,name,p,parent=root,layer=0,r2=r){return mesh(geom(`c${r},${h},${r2}`,()=>new T.CylinderGeometry(r2,r,h,20)),name,p,parent,layer);}
function ball(r,name,p,parent=root,layer=0){return mesh(geom(`s${r}`,()=>new T.SphereGeometry(r,16,10)),name,p,parent,layer);}
function rod(a,b,r,name,parent=root,layer=0){const o=mesh(geom(`rod${r}`,()=>new T.CylinderGeometry(r,r,1,12)),name,[0,0,0],parent,layer);moveRod(o,a,b);return o;}
function moveRod(o,a,b){const va=V(a),vb=V(b),d=vb.clone().sub(va);o.position.copy(va).add(vb).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
function tube(points,r,name,parent=root,layer=0,closed=false){const path=new T.CatmullRomCurve3(points.map(V),closed,'centripetal');return mesh(new T.TubeGeometry(path,Math.max(20,points.length*5),r,7,closed),name,[0,0,0],parent,layer);}
function ring(r,w,name,p,parent=root,layer=0){return mesh(geom(`t${r},${w}`,()=>new T.TorusGeometry(r,w,8,48)),name,p,parent,layer);}
function disk(r,h,name,p,parent=root,layer=0){const o=cylinder(r,h,name,p,parent,layer);o.rotation.x=Math.PI/2;return o;}
function bolt(p,parent=root,layer=0,r=.055){const o=mesh(geom(`bolt${r}`,()=>new T.CylinderGeometry(r,r,.045,6)), 'edge',p,parent,layer);o.rotation.x=Math.PI/2;return o;}
function block(size,name,p,parent=root,layer=0){return mesh(geom('b'+size.join(','),()=>new T.BoxGeometry(...size)),name,p,parent,layer);}
function ellipticRing(x,ry,rz,cy,parent,name='brass',layer=0){const pts=[];for(let i=0;i<40;i++){const a=i/40*TAU;pts.push([x,cy+ry*Math.cos(a),rz*Math.sin(a)]);}return tube(pts,.045,name,parent,layer,true);}

// Anatomical silhouette: flattened broad rostrum, deep throat, massive shoulder,
// tapered caudal peduncle. Coordinates are +X forward, +Y dorsal, Z lateral.
const profile=[[-7.4,.16,.19,0],[-6.6,.24,.29,0],[-5.6,.39,.43,.0],[-4.5,.65,.60,.03],[-3.3,1.00,.82,.08],[-2,1.39,1.13,.10],[-.5,1.68,1.40,.12],[1,1.65,1.57,.10],[2.5,1.30,1.57,.35],[3.8,.95,1.43,.62],[5,.58,1.18,.86],[5.8,.38,.88,.95],[6.15,.29,.62,.95],[6.4,.18,.34,.95],[6.5,.07,.06,.95]];
function section(x){let i=1;while(i<profile.length-1&&profile[i][0]<x)i++;const a=profile[i-1],b=profile[i],q=clamp((x-a[0])/(b[0]-a[0]));return [mix(a[1],b[1],q),mix(a[2],b[2],q),mix(a[3],b[3],q)];}
function surf(x,a,off=0){const [ry,rz,cy]=section(x);return [x,cy+(ry+off)*Math.cos(a),(rz+off)*Math.sin(a)];}

// Five rigid posterior vertebral segments: every rib, armor plate and shaft belongs
// to a rigid parent; flexion happens at the visible bearing joints, never by stretching metal.
const joints=[0,-1.7,-3.3,-4.8,-6.1,-7.3],bones=[];
for(let i=0;i<joints.length;i++){const g=new T.Group();g.position.x=i===0?joints[i]:joints[i]-joints[i-1];(i===0?root:bones[i-1].g).add(g);bones.push({g,x:joints[i],i});}
function attachment(x){if(x>=0)return {g:root,x:0};let i=0;while(i<joints.length-1&&x<joints[i+1])i++;return bones[i];}
function local(p,a){return [p[0]-a.x,p[1],p[2]];}
function skin(x0,x1,a0,a1,name,parent,origin=0,layer=3){const pts=[],uv=[],idx=[],nx=6,na=9;for(let i=0;i<=nx;i++)for(let j=0;j<=na;j++){const p=surf(mix(x0,x1,i/nx),mix(a0,a1,j/na),.03);p[0]-=origin;pts.push(...p);uv.push(i/nx,j/na);}for(let i=0;i<nx;i++)for(let j=0;j<na;j++){const k=i*(na+1)+j;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const o=mesh(g,name,[0,0,0],parent,layer);o.material.side=T.DoubleSide;o.userData.reveal=clamp((6-x0)/14);return o;}
for(let i=0;i<27;i++){const x=-7.1+i*.49,a=attachment(x),[ry,rz,cy]=section(x);ellipticRing(x-a.x,ry,rz,cy,a.g);const hub=cylinder(.14,.25,'dark',[x-a.x,cy,0],a.g);hub.rotation.z=Math.PI/2;for(const s of [-1,1]){rod([x-a.x,cy,0],[x-a.x,cy,s*rz*.94],.035,'steel',a.g);const pad=disk(.095,.10,'copper',[x-a.x,cy,s*rz],a.g);bolt([x-a.x,cy,s*(rz+.07)],a.g,0,.045);}}
const spans=[[-7.3,-6.13],[-6.08,-4.83],[-4.77,-3.33],[-3.27,-1.73],[-1.67,-.03],[.03,6.48]];
for(const [lo,hi] of spans){const at=attachment((lo+hi)/2);for(const angle of [.15,-.15,Math.PI-.25,Math.PI+.25]){const ps=[];for(let x=lo;x<=hi+.001;x+=(hi-lo)/16)ps.push(local(surf(x,angle,-.04),at));tube(ps,.055,'dark',at.g);}
 const mid=(lo+hi)/2;const spine=[];for(let k=0;k<=12;k++){const x=mix(lo,hi,k/12);spine.push(local([x,section(x)[2],0],at));}tube(spine,.11,'steel',at.g);
 const rows=Math.ceil((hi-lo)/.72);for(let n=0;n<rows;n++){const x0=mix(lo,hi,n/rows)+.018,x1=mix(lo,hi,(n+1)/rows)-.018;for(let j=0;j<12;j++){const a0=j*TAU/12+.015,a1=(j+1)*TAU/12-.015;
 // Deliberate engine windows leave sufficient continuous shoulder and head volume.
 const window=(x0>-.7&&x0<2.4)&&([2,3,8,9].includes(j));if(window)continue;
 const name=(j===0||j===11||x0>3.6)?'enamel':(j>=5&&j<=6?'ivory':(n%3===0?'copper':'brass'));
 skin(x0,x1,a0,a1,name,at.g,at.x);const edge=[local(surf(x0,a0,.045),at),local(surf(x0,(a0+a1)/2,.045),at),local(surf(x0,a1,.045),at)];tube(edge,.014,'edge',at.g,3);
 for(const angle of [a0+.08,a1-.08]){const p=local(surf(x0+.1,angle,.055),at);ball(.028,'edge',p,at.g,3);}
 }}
}

// Etched inset borders, flush fasteners and alternating service slots.
for(const [lo,hi] of spans){const at=attachment((lo+hi)/2),rows=Math.ceil((hi-lo)/.72);
 for(let n=0;n<rows;n++){const x0=mix(lo,hi,n/rows)+.08,x1=mix(lo,hi,(n+1)/rows)-.08;
  for(const j of [1,2,3,4,7,8,9,10]){
   if((x0>-.7&&x0<2.4)&&[2,3,8,9].includes(j))continue;
   const a0=j*TAU/12+.065,a1=(j+1)*TAU/12-.065;
   const corners=[];for(let k=0;k<=8;k++)corners.push([mix(x0,x1,k/8),a0]);for(let k=1;k<=8;k++)corners.push([x1,mix(a0,a1,k/8)]);for(let k=1;k<=8;k++)corners.push([mix(x1,x0,k/8),a1]);for(let k=1;k<=8;k++)corners.push([x0,mix(a1,a0,k/8)]);
   tube(corners.map(([x,a])=>local(surf(x,a,.048),at)),.006,'copper',at.g,3);
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
// Head identity: split upper/lower jaw rails, mouth seam, throat pleats and tubercles.
for(const s of [-1,1]){
 const jaw=[[1.5,-.75,s*1.42],[2.6,-.25,s*1.54],[3.8,.40,s*1.42],[5.3,.77,s*1.05],[6.45,.95,s*.12]];
 tube(jaw,.105,'brass',root,0);tube(jaw.map(([x,y,z])=>[x,y+.105,z+.015*s]),.045,'black',root,3);
 tube([[2.05,-1.00,s*.7],[3.6,-.08,s*1.07],[5.35,.45,s*.77],[6.45,.88,s*.10]],.055,'edge',root,3);
 const eye=new T.Group();eye.position.set(3.15,.04,s*1.48);eye.rotation.y=s<0?Math.PI:0;root.add(eye);
 disk(.18,.13,'dark',[0,0,0],eye,3);ring(.16,.028,'brass',[0,0,.07],eye,3);const lens=ball(.13,'glass',[0,0,.09],eye,3);lens.scale.z=.52;ball(.025,'ivory',[-.035,.04,.153],eye,3);
 for(let i=0;i<11;i++){const x=3.0+i*.26,z=s*section(x)[1]*.72,y=section(x)[2]+section(x)[0]*.72;const b=ball(.062,'brass',[x,y,z],root,3);b.scale.y=.7;}
 for(let i=0;i<23;i++){const x=2.4+i*.13;const [ry,rz,cy]=section(x),z=s*rz*.84;rod([x,cy-.18,z],[x,cy-Math.min(.65,ry*.75),z*.95],.012,'ivory',root,1);}
}
for(let k=-5;k<=5;k++){const ps=[];for(let i=0;i<=20;i++){const x=.4+i*.25,ang=Math.PI+k*.08*(1-(x-.4)/6);ps.push(surf(x,ang,.065));}tube(ps,.024,k%2?'edge':'dark',root,3);}
for(const s of [-1,1]){const o=ring(.13,.038,'black',[2.0,1.70,s*.19],root,3);o.rotation.x=Math.PI/2;}

// Involute gear profiles. Real pitch radii and ratios are kept for visible pairs.
function gearGeo(n,mod=.05){const rp=n*mod/2,rb=rp*Math.cos(Math.PI/9),ra=rp+mod,rf=rp-1.25*mod,inv=a=>Math.tan(a)-a,ip=inv(Math.PI/9),half=Math.PI/(2*n),sh=new T.Shape();let first=true;const polar=(r,a)=>{if(first){sh.moveTo(r*Math.cos(a),r*Math.sin(a));first=false;}else sh.lineTo(r*Math.cos(a),r*Math.sin(a));};for(let k=0;k<n;k++){const a=k*TAU/n;polar(rf,a-Math.PI/n);for(let j=0;j<=4;j++){const r=mix(Math.max(rb,rf),ra,j/4),o=half+ip-inv(Math.acos(clamp(rb/r,-1,1)));polar(r,a-o);}for(let j=4;j>=0;j--){const r=mix(Math.max(rb,rf),ra,j/4),o=half+ip-inv(Math.acos(clamp(rb/r,-1,1)));polar(r,a+o);}polar(rf,a+Math.PI/n);}sh.closePath();const h=new T.Path();h.absarc(0,0,rp*.18,0,TAU,true);sh.holes.push(h);for(let k=0;k<5;k++){const a=k*TAU/5+.13,b=(k+1)*TAU/5-.13,h=new T.Path();h.absarc(0,0,rp*.73,b,a,true);h.lineTo(rp*.34*Math.cos(a),rp*.34*Math.sin(a));h.absarc(0,0,rp*.34,a,b,false);h.closePath();sh.holes.push(h);}return new T.ExtrudeGeometry(sh,{depth:.10,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:1,steps:1});}
const wheels=[];function wheel(n,p,ratio=1,parent=root,name='brass',phase=0,mod=.05){const g=new T.Group();g.position.fromArray(p);parent.add(g);mesh(geom(`g${n},${mod}`,()=>gearGeo(n,mod)),name,[0,0,-.05],g,1);ring(n*mod*.42,.018,'edge',[0,0,.075],g,1);disk(.12,.18,'copper',[0,0,0],g,1);wheels.push({g,ratio,phase});return g;}
// Compact multi-plane engine, not an oversized line of gears on the skin.
for(const s of [-1,1]){
 const z=s*.91;wheel(30,[1.25,.05,z],1,root,'brass');wheel(18,[.05,.05,z],-30/18,root,'steel',Math.PI/18);wheel(26,[-1.05,.05,z],30/26,root,'brass');
 for(const x of [1.25,.05]){rod([x,.05,-1.05],[x,.05,1.05],.075,'steel',root,1);block([.29,.42,.23],'dark',[x,.05,z-s*.24],root,1);}
 tube([[2.2,.83,z],[1.7,1.04,z],[.3,.83,z],[-.4,.45,z]],.065,'brass',root,1);
 for(let j=0;j<3;j++){const x=.6+j*.46;const tank=cylinder(.15,1.0,j===1?'copper':'dark',[x,-.65,s*.58],root,1);for(const y of [-1.1,-.2]){const o=ring(.15,.028,'edge',[x,y,s*.58],root,1);o.rotation.x=Math.PI/2;}}
 // Copper capillary manifold and valve wheels.
 for(let j=0;j<6;j++){const y=.8-j*.13;tube([[2.6,y,s*.6],[2.1,y,s*1.05],[1.8,y,s*1.1]],.021,'copper',root,1);}
 const valve=ring(.19,.028,'copper',[2.0,.65,s*1.2],root,1);for(let j=0;j<4;j++){const a=j*TAU/4;rod([2,.65,s*1.2],[2+.17*Math.cos(a),.65+.17*Math.sin(a),s*1.2],.018,'edge',root,1);}
}
const flywheel=new T.Group();flywheel.position.set(1.9,.25,0);flywheel.rotation.y=Math.PI/2;root.add(flywheel);
for(const z of [-.22,.22]){ring(.66,.07,'dark',[0,0,z],flywheel,1);ring(.66,.025,'edge',[0,0,z+.04],flywheel,1);for(let k=0;k<6;k++){const a=k*TAU/6;rod([.15*Math.cos(a),.15*Math.sin(a),z],[.62*Math.cos(a),.62*Math.sin(a),z],.04,'brass',flywheel,1);}}
const springDrum=new T.Group();springDrum.position.set(3.05,.1,0);springDrum.rotation.y=Math.PI/2;root.add(springDrum);disk(.55,.48,'dark',[0,0,0],springDrum,1);for(const z of [-.27,.27])ring(.55,.045,'edge',[0,0,z],springDrum,1);const spiral=[];for(let i=0;i<=300;i++){const q=i/300,a=q*TAU*6,r=.08+.40*q;spiral.push([r*Math.cos(a),r*Math.sin(a),.3]);}tube(spiral,.016,'copper',springDrum,1);
// Governor, ball links and small rotating instruments sit at different depths.
const governor=new T.Group();governor.position.set(.4,.7,0);root.add(governor);rod([0,0,0],[0,.6,0],.055,'steel',governor,1);for(const s of [-1,1]){rod([0,.55,0],[s*.27,.25,0],.025,'brass',governor,1);ball(.11,'copper',[s*.27,.25,0],governor,1);}
const pumpRods=[];
for(const s of [-1,1])for(let j=0;j<3;j++){
 const x=-.1+j*.5,z=s*.43;block([.24,.4,.28],'dark',[x,-.88,z],root,1);cylinder(.14,.4,'brass',[x,-.6,z],root,1);
 const p=rod([x,-.6,z],[x,-.3,z],.045,'steel',root,1);const cap=ball(.075,'copper',[x,-.3,z],root,1);
 const crank=rod([x,.1,z],[x+.16,.1,z],.05,'brass',root,1),conrod=rod([x+.16,.1,z],[x,-.3,z],.035,'steel',root,1);disk(.10,.12,'dark',[x,.1,z],root,1);
 pumpRods.push({p,cap,crank,conrod,x,z,phase:j*TAU/3+(s<0?Math.PI:0)});
}
// Instrument faces and their mounting feet add a distinct control subsystem.
const needles=[];
for(const s of [-1,1])for(let i=0;i<2;i++){
 const x=.6+i*.65,y=.92,z=s*1.0,g=new T.Group();g.position.set(x,y,z);g.rotation.y=s<0?Math.PI:0;root.add(g);
 disk(.19,.10,'brass',[0,0,0],g,1);disk(.154,.011,'ivory',[0,0,.06],g,1);ring(.17,.018,'edge',[0,0,.07],g,1);
 for(let k=0;k<48;k++){const a=k*TAU/48,r=k%4===0?.115:.132;rod([r*Math.cos(a),r*Math.sin(a),.075],[.145*Math.cos(a),.145*Math.sin(a),.075],k%4===0?.004:.002,'black',g,1);} ring(.105,.002,'copper',[0,0,.076],g,1);
 const n=new T.Group();g.add(n);rod([0,0,.08],[.10,.02,.08],.009,'black',n,1);ball(.024,'copper',[0,0,.08],n,1);needles.push({g:n,p:i});
 rod([x,y-.2,z],[x,y-.47,z*.82],.035,'dark',root,1);
}

// Visible joint bearings, telescopic paired actuators, and corrugated hoses.
const actuators=[];
for(let i=0;i<bones.length;i++){
 const b=bones[i],[ry,rz]=section(b.x);for(const s of [-1,1]){disk(Math.max(.16,ry*.43),.12,'dark',[0,0,s*rz*.72],b.g,2);ring(Math.max(.12,ry*.36),.032,'edge',[0,0,s*(rz*.72+.08)],b.g,2);for(let k=0;k<8;k++){const a=k*TAU/8;bolt([Math.cos(a)*ry*.32,Math.sin(a)*ry*.32,s*(rz*.72+.09)],b.g,2,.035);}}
 if(i===0)continue;
 const prev=bones[i-1];for(const s of [-1,1])for(const top of [-1,1]){
 const anchorA=[-.35,top*Math.max(.16,section(prev.x)[0]*.53),s*Math.max(.18,section(prev.x)[1]*.49)];
 const anchorB=[-.45,top*Math.max(.12,ry*.51),s*Math.max(.13,rz*.46)];
 const group=new T.Group();root.add(group);const barrel=rod([0,0,0],[1,0,0],.085,'dark',group,2),plunger=rod([0,0,0],[1,0,0],.038,'steel',group,2);const ca=ball(.10,'brass',[0,0,0],group,2),cb=ball(.08,'brass',[0,0,0],group,2);
 actuators.push({a:prev.g,b:b.g,anchorA,anchorB,barrel,plunger,ca,cb});
 }
 const shortLen=i===bones.length-1?.5:Math.abs(joints[i+1]-b.x)*.65;
 wheel(12,[-.38,0,Math.max(.22,rz*.6)],1+i*.17,b.g,'copper',i*.4,.035);
 for(let k=0;k<5;k++){const o=ring(Math.max(.13,ry*.55),.021,'dark',[-.08-k*.065,0,0],b.g,2);o.rotation.y=Math.PI/2;}
 rod([-.1,0,0],[-shortLen,0,0],.08,'steel',b.g,1);
}

// Smooth foil planforms with a raised center and scalloped leading edge.
function foil(outline,name,parent,layer=2){const shape=new T.Shape();outline.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:3,steps:1});g.rotateX(Math.PI/2);const o=mesh(g,name,[0,.04,0],parent,layer);o.material.side=T.DoubleSide;return o;}
function chord(outline,z){const xs=[];for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];if((a[1]<=z&&b[1]>z)||(b[1]<=z&&a[1]>z))xs.push(mix(a[0],b[0],(z-a[1])/(b[1]-a[1])));}return [Math.min(...xs)+.05,Math.max(...xs)-.05];}
const fins=[];
for(const s of [-1,1]){
 const g=new T.Group();g.position.set(1.1,-.75,s*1.28);root.add(g);
 const outline=[[.4,0],[.42,s*.45],[.25,s*.9],[.19,s*1.35],[-.05,s*1.8],[-.12,s*2.25],[-.40,s*2.8],[-.65,s*3.4],[-1.05,s*4.1],[-1.5,s*4.65],[-1.72,s*4.7],[-1.7,s*4.1],[-1.42,s*3.1],[-1.13,s*2.0],[-.8,s*.8],[-.5,0]];
 foil(outline,'ivory',g);tube(outline.map(([x,z])=>[x,.07,z]),.035,'brass',g,0,true);
 tube([[0,.12,0],[-.3,.15,s*1.4],[-.7,.13,s*2.8],[-1.55,.1,s*4.6]],.06,'dark',g,0);
 for(let k=1;k<=12;k++){const z=s*k*.34,[rear,front]=chord(outline,z);rod([front,.12,z],[rear,.12,z],.018,'brass',g,k%3===0?0:2);ball(.035,'brass',[front,.14,z],g,3);}
 for(let k=1;k<5;k++){const q=k/5;const plate=foil([[-.3-q*.1,s*(q*3.7)],[-.45-q*.4,s*(q*3.7+.4)],[-1-q*.4,s*(q*3.7+.4)],[-.8-q*.4,s*(q*3.7)]],'enamel',g,3);plate.position.y+=.16;}
 disk(.30,.4,'dark',[0,0,0],g,2);ring(.25,.035,'edge',[0,0,s*.24],g,2);
 const ag=new T.Group();root.add(ag);const barrel=rod([0,0,0],[1,0,0],.10,'copper',ag,2),plunger=rod([0,0,0],[1,0,0],.043,'steel',ag,2);actuators.push({a:root,b:g,anchorA:[.2,-.1,s*1.0],anchorB:[-.3,.05,s*.65],barrel,plunger,ca:ball(.1,'brass',[0,0,0],ag,2),cb:ball(.09,'brass',[0,0,0],ag,2)});
 fins.push({g,s});
}
const fluke=new T.Group();fluke.position.x=-.7;bones.at(-1).g.add(fluke);
for(const s of [-1,1]){
 const outline=[[.35,0],[.35,s*.55],[.55,s*1.3],[.8,s*2.05],[.7,s*2.85],[.4,s*3.45],[-.05,s*3.8],[-.15,s*3.25],[-.5,s*2.6],[-.88,s*1.8],[-1.05,s*.65],[-.72,s*.15],[-.47,0]];
 foil(outline,'enamel',fluke);tube(outline.map(([x,z])=>[x,.09,z]),.045,'brass',fluke,0,true);
 tube([[0,.12,0],[.1,.13,s*1.5],[.4,.10,s*3.45]],.065,'dark',fluke,0);
 for(let k=1;k<=10;k++){const z=s*k*.32,[rear,front]=chord(outline,z);rod([front,.14,z],[rear,.14,z],.023,'brass',fluke,2);bolt([(front+rear)*.5,.15,z],fluke,3,.035);}
}
const dorsal=new T.Group();dorsal.position.set(-.4,1.0,0);bones[1].g.add(dorsal);const ds=new T.Shape();ds.moveTo(-1,0);ds.bezierCurveTo(-.8,.4,-.2,.95,.45,.9);ds.bezierCurveTo(.15,.38,.5,.1,.9,0);ds.closePath();mesh(new T.ExtrudeGeometry(ds,{depth:.11,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:2}), 'enamel',[0,0,-.05],dorsal,3);

// World-space environment: graded ocean, shafts, a distant sloping reef and a sparse
// near/mid/far particulate field give the travel a readable depth reference.
const dome=new T.Mesh(new T.SphereGeometry(160,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;void main(){vec3 p=normalize(v);float u=smoothstep(-.4,.9,p.y);float a=pow(max(0.,dot(p,normalize(vec3(.1,.9,-.5)))),28.);vec3 c=mix(vec3(.006,.017,.028),vec3(.025,.11,.14),u)+a*vec3(.06,.17,.19);gl_FragColor=vec4(pow(c,vec3(.4545)),1.);}'}));scene.add(dome);
const snowGeom=new T.BufferGeometry(),snowPts=[];for(let i=0;i<1900;i++)snowPts.push((rand()-.5)*110,(rand()-.5)*65,(rand()-.5)*100);snowGeom.setAttribute('position',new T.Float32BufferAttribute(snowPts,3));const snow=new T.Points(snowGeom,new T.PointsMaterial({color:0x8ab4bf,size:.045,transparent:true,opacity:.34,depthWrite:false}));scene.add(snow);
const rays=[];for(let i=0;i<9;i++){const m=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{strength:{value:.10}},vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvv;uniform float strength;void main(){float a=pow(sin(uvv.x*3.14159),4.)*pow(uvv.y,1.5);gl_FragColor=vec4(.23,.55,.65,a*strength);}'});const o=new T.Mesh(new T.PlaneGeometry(1.5+rand()*2.5,80),m);o.position.set(-28+i*7,12,-18-rand()*14);o.rotation.z=-.27;scene.add(o);rays.push(o);}
const reefMat=new T.MeshStandardMaterial({color:'#102f3b',roughness:.98,metalness:0});
for(let i=0;i<10;i++){const g=new T.SphereGeometry(1,32,20);const p=g.attributes.position;for(let j=0;j<p.count;j++){const v=V([p.getX(j),p.getY(j),p.getZ(j)]);const k=1+.12*Math.sin(v.x*7+i)*Math.cos(v.y*5)+.09*Math.cos(v.z*8-v.y*3);v.multiplyScalar(k);p.setXYZ(j,v.x,v.y,v.z);}g.computeVertexNormals();const o=new T.Mesh(g,reefMat);o.position.set(-42+i*10,-29-rand()*5,-40-rand()*12);o.scale.set(7+rand()*5,8+rand()*8,6+rand()*4);scene.add(o);}

const dotCanvas=document.createElement('canvas');dotCanvas.width=dotCanvas.height=64;
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
const fish=[];for(let i=0;i<32;i++){const g=new T.Group();scene.add(g);const b=ball(.20,'brass',[0,0,0],g);b.scale.set(2.7,.75,.8);const back=ball(.20,'enamel',[-.03,.035,0],g);back.scale.set(2,.7,.82);for(const s of [-1,1]){ball(.025,'black',[.35,.035,s*.12],g);disk(.07,.02,'dark',[.02,0,s*.17],g);rod([0,0,0],[-.24,-.16,s*.24],.02,'brass',g);}const tg=new T.Group();tg.position.x=-.50;g.add(tg);foil([[0,0],[-.3,.23],[-.23,0],[-.3,-.23]],'copper',tg,0);tg.rotation.x=Math.PI/2;const sc=.34+rand()*.28;g.scale.setScalar(sc);fish.push({g,tg,phase:rand()*TAU,offset:new T.Vector3(-9+rand()*19,(i%2?1:-1)*(2.6+rand()*3), (rand()-.5)*18),speed:.8+rand()*.4});}
const fishMats=new Map();for(const f of fish)f.g.traverse(o=>{if(o.isMesh){const k=o.material.uuid;if(!fishMats.has(k)){const m=o.material.clone();m.transparent=true;fishMats.set(k,m);}o.material=fishMats.get(k);}});

// A single time source controls distributed actuation. This is authored kinematics,
// inspired by phase-separated actuator controllers; no hydrodynamic solver is claimed.
const phase=t=>{const q=clamp((t-18)/4),integral=4*(2.5*q**4-3*q**5+q**6)+Math.max(0,t-22);return TAU*(t/4.8+.035*integral);};
function path(t){const u=Math.max(0,t-17),d=u*u/(u+2);return new T.Vector3(d*.78,.13*d+.7*ramp(t,19,24),-d*.35-2.5*ramp(t,23,30));}
function bodyOrientation(t){return new T.Euler(.10-.24*ramp(t,20,25)+.13*ramp(t,26,30),.04+.45*ramp(t,21,28),.025+.10*ramp(t,18,23)-.07*ramp(t,25,30),'YXZ');}
// Each camera changes viewpoint for a specific event. The final camera lets the
// subject recede. Roll is photographic composition, not a permanently vertical animal.
const shots=[
 {t:0,pos:[26,8,22],look:[-.6,0,0],roll:-.72},
 {t:3.8,pos:[12,5.8,29],look:[-.6,0,0],roll:-.78},
 {t:6.2,pos:[5,2.7,11],look:[1,.05,0],roll:-.25},
 {t:8.6,pos:[2.3,2.1,10.2],look:[.6,0,.2],roll:-.18},
 {t:11.7,pos:[-13,7,12],look:[-3.8,0,0],roll:-.38},
 {t:14,pos:[-12,14,29],look:[-.8,0,0],roll:-.78},
 {t:17.5,pos:[5,15,30],look:[-.6,0,0],roll:-.84},
 {t:20.5,pos:[28,-3,17],look:[-.5,0,0],roll:-.58},
 {t:24,pos:[9,4,32],look:[-.4,0,0],roll:-.78},
 {t:27,pos:[-17,10,32],look:[-.8,0,0],roll:-.80},
 {t:30,pos:[-25,13,40],look:[-1.0,0,0],roll:-.62},
];
function cameraPose(t){let i=1;while(i<shots.length-1&&t>shots[i].t)i++;const a=shots[i-1],b=shots[i],q=ramp(t,a.t,b.t),pos=V(a.pos).lerp(V(b.pos),q),target=V(a.look).lerp(V(b.look),q),s=path(t);const late=ramp(t,26,30);pos.add(path(t-late*2.5));target.add(path(t-late*.65));return {pos,target,roll:mix(a.roll,b.roll,q)};}
root.updateMatrixWorld(true);
for(let l=1;l<4;l++)for(const o of layers[l]){o.geometry.computeBoundingBox();const c=o.geometry.boundingBox.getCenter(new T.Vector3());o.localToWorld(c);o.userData.reveal=clamp((6.3-c.x)/15.6);}
// A fixed conservative envelope prevents a swimming-cycle-dependent zoom pump.
// Full-body shots use this envelope; mechanism closeups intentionally crop the body.
const envelope=[];for(let x=-7.2;x<6.55;x+=.5){const at=attachment(x);for(let j=0;j<8;j++)envelope.push({g:at.g,p:V(local(surf(x,j*TAU/8,.1),at))});}
for(const f of fins)for(const p of [[.5,0,0],[-1.75,0,f.s*4.75],[-.5,0,f.s*2.5]])envelope.push({g:f.g,p:V(p)});
for(const s of [-1,1])for(const p of [[-.1,0,s*3.8],[.7,0,s*2.5],[-1,0,s*.7]])envelope.push({g:fluke,p:V(p)});
function fitCamera(t,cp){const weight=1-ramp(t,3.8,5.8)+ramp(t,12,14);if(weight<.001)return;let ratio=1;for(const p of envelope){const v=p.g.localToWorld(p.p.clone()).project(camera);ratio=Math.max(ratio,Math.abs(v.x)/.87,Math.abs(v.y)/.82);}if(ratio>1){camera.position.copy(cp.target).add(cp.pos.clone().sub(cp.target).multiplyScalar(mix(1,ratio*1.025,clamp(weight))));camera.updateMatrixWorld(true);}}
function reveal(t){const ranges=[[0,0],[3.3,6.5],[8.5,11.5],[13.1,17.2]];for(let l=1;l<4;l++){const [a,b]=ranges[l],p=clamp((t-a)/(b-a));for(const o of layers[l]){const threshold=.08+.80*(o.userData.reveal||0);o.visible=p>=threshold;}}}
window.renderAt=t=>{
 t=clamp(t,0,30);const ph=phase(t),s=path(t),power=.75+.25*ramp(t,17,21),turn=ramp(t,20,25)-ramp(t,26,30);
 root.position.copy(s);root.rotation.copy(bodyOrientation(t));root.rotation.z+=.022*Math.sin(ph-.4);root.position.y+=.09*Math.sin(ph-.8);
 const amplitudes=[.04,.09,.13,.16,.18,.11];for(let i=0;i<bones.length;i++){bones[i].g.rotation.z=amplitudes[i]*power*Math.sin(ph-i*.47);bones[i].g.rotation.y=.012*turn*i;}
 fluke.rotation.z=.16*Math.sin(ph-2.6+Math.PI/3);fluke.rotation.x=.025*Math.sin(ph-2);
 for(const f of fins){f.g.rotation.x=f.s*(.17+.20*Math.sin(ph-.6)+.22*turn-.16*(ramp(t,17,19)-ramp(t,21,23)))+.22*turn;f.g.rotation.y=f.s*(.07+.10*Math.sin(ph-1.3));f.g.rotation.z=-.08+.10*Math.sin(ph-1);}
 for(const w of wheels)w.g.rotation.z=ph*w.ratio+w.phase;flywheel.rotation.z=ph*2;springDrum.rotation.z=ph*.16;governor.rotation.y=ph*3.4;
 let maxCrankError=0;
 for(const p of pumpRods){const angle=ph+p.phase,c=[p.x+.16*Math.cos(angle),.10+.16*Math.sin(angle),p.z],y=c[1]-Math.sqrt(.48*.48-(c[0]-p.x)**2),slider=[p.x,y,p.z];moveRod(p.crank,[p.x,.10,p.z],c);moveRod(p.conrod,c,slider);moveRod(p.p,[p.x,-.78,p.z],slider);p.cap.position.fromArray(slider);maxCrankError=Math.max(maxCrankError,Math.abs(V(c).distanceTo(V(slider))-.48));}
 for(const n of needles)n.g.rotation.z=.4+.16*Math.sin(ph+n.p*.8);
 root.updateMatrixWorld(true);let minStroke=Infinity,maxStroke=0;
 for(const a of actuators){const A=root.worldToLocal(a.a.localToWorld(V(a.anchorA))),B=root.worldToLocal(a.b.localToWorld(V(a.anchorB))),d=A.distanceTo(B);const end=A.clone().add(B.clone().sub(A).normalize().multiplyScalar(.75));moveRod(a.barrel,A.toArray(),end.toArray());moveRod(a.plunger,end.toArray(),B.toArray());a.ca.position.copy(A);a.cb.position.copy(B);minStroke=Math.min(minStroke,d);maxStroke=Math.max(maxStroke,d);}
 reveal(t);for(const f of fish){const u=t*f.speed,off=f.offset.clone();off.x+=.6*Math.sin(u*.4+f.phase);off.y+=.3*Math.sin(u*.6+f.phase);off.z+=.5*Math.cos(u*.3+f.phase);off.applyEuler(bodyOrientation(t));f.g.position.copy(s).add(off);f.g.rotation.copy(bodyOrientation(t));f.g.rotation.z+=.05*Math.sin(u+f.phase);f.tg.rotation.y=.4*Math.sin(t*6+f.phase);f.g.visible=t>17.5;}
 for(const m of fishMats.values())m.opacity=ramp(t,17.5,19.5);
 const cp=cameraPose(t);camera.position.copy(cp.pos);camera.up.set(0,1,0);camera.lookAt(cp.target);camera.rotateZ(cp.roll);camera.updateMatrixWorld(true);fitCamera(t,cp);
 key.position.copy(s).add(V([8,16,14]));key.target.position.copy(s);rim.position.copy(s).add(V([-8,8,-12]));rim.target.position.copy(s);fill.position.copy(s).add(V([0,-5,12]));fill.target.position.copy(s);
 updateWater(t);renderer.render(scene,camera);
 const projected=envelope.map(p=>p.g.localToWorld(p.p.clone()).project(camera));const bounds=[Math.min(...projected.map(p=>p.x)),Math.max(...projected.map(p=>p.x)),Math.min(...projected.map(p=>p.y)),Math.max(...projected.map(p=>p.y))];
 return {time:t,parts:meshCount,phase:ph,subject:s.toArray(),camera:camera.position.toArray(),target:cp.target.toArray(),joints:bones.map(b=>b.g.rotation.z),fins:fins.map(f=>f.g.rotation.x),bodyAngles:[root.rotation.x,root.rotation.y,root.rotation.z],actuatorRange:[minStroke,maxStroke],screenBounds:bounds,linkError:maxCrankError,drawcalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
};
window.sceneInfo={width:W,height:H,duration:30,fps:30,parts:meshCount,revision:'machining-patina-water-performance-refinement',rig:'six rigid posterior segments + fluke pitch + paired pectoral control'};
window.renderAt(0);window.ready=true;
