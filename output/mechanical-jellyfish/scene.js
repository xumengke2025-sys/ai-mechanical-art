import * as T from 'three';
import {RoomEnvironment} from '../film-v2/vendor/RoomEnvironment.js';
const W=+(new URLSearchParams(location.search).get('w')||1080),H=Math.round(W*16/9),PI=Math.PI,TAU=PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=T.MathUtils.lerp,sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);},ramp=(t,a,b)=>sm((t-a)/(b-a)),V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
let seed=619;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;document.body.appendChild(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,W/H,.1,180);scene.background=new T.Color('#061c25');scene.fog=new T.FogExp2('#092b35',.014);
const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pm.fromScene(room,.04).texture;scene.environmentIntensity=.48;room.dispose();pm.dispose();
scene.add(new T.HemisphereLight(0xb7e1dd,0x071721,.62));
const key=new T.DirectionalLight(0xffd6a0,3.5);key.position.set(5,10,9);scene.add(key);const rim=new T.DirectionalLight(0x8ae4eb,3.2);rim.position.set(-8,4,-5);scene.add(rim);const fill=new T.DirectionalLight(0x4a91a8,.7);fill.position.set(0,-7,7);scene.add(fill);
const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=512;const tc=texCanvas.getContext('2d');tc.fillStyle='#999';tc.fillRect(0,0,512,512);for(let i=0;i<15000;i++){const v=90+random()*90;tc.fillStyle=`rgba(${v},${v},${v},.23)`;tc.fillRect(random()*512,random()*512,random()*6+.4,.45);}const grain=new T.CanvasTexture(texCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;
const mat={brass:new T.MeshStandardMaterial({color:'#c3a269',metalness:.88,roughness:.30,bumpMap:grain,bumpScale:.006}),copper:new T.MeshStandardMaterial({color:'#936449',metalness:.82,roughness:.36}),dark:new T.MeshStandardMaterial({color:'#183a3c',metalness:.85,roughness:.34}),edge:new T.MeshStandardMaterial({color:'#ead3a3',metalness:.85,roughness:.23}),steel:new T.MeshStandardMaterial({color:'#91afb0',metalness:.92,roughness:.23}),ivory:new T.MeshStandardMaterial({color:'#cfbea1',metalness:.54,roughness:.39,side:T.DoubleSide,bumpMap:grain,bumpScale:.008}),membrane:new T.MeshPhysicalMaterial({color:'#ba9a62',metalness:.18,roughness:.30,transparent:true,opacity:.23,side:T.DoubleSide,depthWrite:false,clearcoat:.55}),black:new T.MeshStandardMaterial({color:'#071b20',metalness:.6,roughness:.4})};
const lc=document.createElement('canvas');lc.width=128;lc.height=256;const lx=lc.getContext('2d');lx.fillStyle='#fff';lx.fillRect(0,0,128,256);lx.fillStyle='#000';for(let row=0;row<16;row++)for(let col=0;col<8;col++){lx.beginPath();lx.ellipse(col*16+(row%2?8:0),row*16,3.5,5,0,0,TAU);lx.fill();}const laceTex=new T.CanvasTexture(lc);laceTex.wrapS=laceTex.wrapT=T.RepeatWrapping;laceTex.repeat.set(1,8);mat.ivory.alphaMap=laceTex;mat.ivory.alphaTest=.35;
const timeUniform={value:0};for(const name of ['brass','copper','dark','ivory'])mat[name].onBeforeCompile=sh=>{sh.uniforms.clockT=timeUniform;sh.vertexShader='varying vec3 objP; varying vec3 seaP;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nobjP=position;seaP=(modelMatrix*vec4(position,1.)).xyz;');sh.fragmentShader='varying vec3 objP;varying vec3 seaP;uniform float clockT;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float pat=sin(objP.x*12.+sin(objP.y*8.))*sin(objP.z*9.+objP.y*5.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.055,.12,.10),smoothstep(.35,.85,pat)*.13);`);sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float ca=sin(seaP.x*2.4+seaP.z*1.8+clockT*.33)+sin(seaP.z*2.2-seaP.y*.6-clockT*.26);totalEmissiveRadiance+=vec3(.025,.065,.07)*pow(max(0.,1.-abs(ca)*2.),7.);`);};
const sphereG=new T.SphereGeometry(1,12,8),rodG=new T.CylinderGeometry(1,1,1,10),dummy=new T.Object3D();
let parts=0;function mesh(g,m,parent){const o=new T.Mesh(g,mat[m]||m);parent.add(o);parts++;return o;}
function ball(r,m,parent,p=V()){const o=mesh(sphereG,m,parent);o.scale.setScalar(r);o.position.copy(p);return o;}
function rod(r,m,parent){const o=mesh(rodG,m,parent);o.userData.radius=r;return o;}
function setRod(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(o.userData.radius,d.length(),o.userData.radius);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());}
function torus(r,w,m,parent){const o=mesh(new T.TorusGeometry(r,w,8,72),m,parent);o.rotation.x=PI/2;return o;}
function disk(r,h,m,parent){return mesh(new T.CylinderGeometry(r,r,h,48),m,parent);}
function dynamicTube(n,r,m,parent,sides=6){const g=new T.BufferGeometry(),p=new Float32Array((n+1)*sides*3),ind=[];for(let i=0;i<n;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides;ind.push(a,b,a+sides,b,b+sides,a+sides);}g.setAttribute('position',new T.BufferAttribute(p,3));g.setIndex(ind);const o=mesh(g,m,parent);o.frustumCulled=false;return {o,g,p,n,r,sides};}
function setTube(t,pts,taper=false){for(let i=0;i<=t.n;i++){const tangent=pts[Math.min(t.n,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize(),ref=Math.abs(tangent.y)>.9?V(1,0,0):V(0,1,0),a=new T.Vector3().crossVectors(tangent,ref).normalize(),b=new T.Vector3().crossVectors(tangent,a).normalize(),rr=t.r*(taper?1-.7*i/t.n:1);for(let j=0;j<t.sides;j++){const ang=j/t.sides*TAU,v=pts[i].clone().addScaledVector(a,rr*Math.cos(ang)).addScaledVector(b,rr*Math.sin(ang));t.p.set(v.toArray(),(i*t.sides+j)*3);}}t.g.attributes.position.needsUpdate=true;t.g.computeVertexNormals();}
// A fast inward/downward stroke followed by a longer elastic recovery.
const PERIOD=3.25;
function contraction(t){const p=((t/PERIOD)%1+1)%1;return p<.29?sm(p/.29):1-sm((p-.29)/.71);}
// Every meridional bar is a rigid 0.37-unit link; only hinge angles change.
const LINK=.37,N=8;
function meridian(c){const a=[V(0,1.45,0)];for(let j=0;j<N;j++){const q=(j+.5)/N,angle=.035+(1.42+.91*c)*q**1.5;const p=a.at(-1);a.push(V(p.x+LINK*Math.cos(angle),p.y-LINK*Math.sin(angle),0));}return a;}
function pointOn(a,q,ang){const k=clamp(q)*N,j=Math.min(N-1,Math.floor(k)),p=a[j].clone().lerp(a[j+1],k-j);const scallop=1+.017*Math.sin(ang*24)*q**8;return V(p.x*Math.cos(ang)*scallop,p.y+.025*Math.sin(ang*24)*q**8,p.x*Math.sin(ang)*scallop);}
// Deterministic 120Hz drag/impulse integration; an illustrative propulsion model.
function cavityVolume(t){const m=meridian(contraction(t)),bottom=m.at(-1).y;let volume=0;for(let i=0;i<N;i++){const a=m[i],b=m[i+1];volume+=PI*(a.x+b.x)*((a.y+b.y)/2-bottom)*(b.x-a.x);}return volume;}
const motion=[{y:0,v:0}];let vel=0,travel=0;for(let i=1;i<=4200;i++){const t=i/120,dc=(cavityVolume(t-1/120)-cavityVolume(t))*120/4;vel+=((.08+Math.max(0,dc)*1.15)-1.9*vel)/120;travel+=vel/120;motion.push({y:travel,v:vel});}
function motionAt(t){const u=clamp(t,0,35)*120,i=Math.min(motion.length-2,Math.floor(u)),f=u-i;return {y:lerp(motion[i].y,motion[i+1].y,f),v:lerp(motion[i].v,motion[i+1].v,f)};}
function positionAt(t){const gate=ramp(t,16,19),dy=(motionAt(t).y-motionAt(16).y)*gate;return V(.2*Math.sin(t*.17)*gate,dy,.20*Math.sin(t*.13)*gate);}
function buildJelly(full=true){const root=new T.Group();scene.add(root);const skeleton=new T.Group(),mechanism=new T.Group(),appendages=new T.Group(),skin=new T.Group();root.add(skeleton,mechanism,appendages,skin);
 const ribs=[];for(let k=0;k<24;k++){const links=[],pins=[];for(let j=0;j<N;j++){links.push(rod(full?.027:.022,k%3===0?'brass':'copper',skeleton));if(full)pins.push(ball(j===N-1?.048:.036,'edge',skeleton));}ribs.push({links,pins,ang:k/24*TAU});}
 const crown=new T.Group();crown.position.y=1.47;skeleton.add(crown);for(const r of [.17,.30,.43])torus(r,.024,'brass',crown);const hub=disk(.14,.10,'dark',crown);const fly=disk(.10,.025,'copper',crown);fly.position.y=.075;
 for(let k=0;k<12;k++){const a=k/12*TAU,bar=rod(.014,'brass',crown);setRod(bar,V(.16*Math.cos(a),0,.16*Math.sin(a)),V(.43*Math.cos(a),0,.43*Math.sin(a)));ball(.025,'steel',crown,V(.35*Math.cos(a),.025,.35*Math.sin(a)));}
 const bands=[];for(const q of [.28,.55,.78,.97])bands.push({q,t:dynamicTube(full?96:48,q>.9?.025:.013,q>.9?'brass':'dark',mechanism)});
 const cables=[];if(full)for(let k=0;k<12;k++)cables.push({ang:k/12*TAU,t:dynamicTube(16,.009,'steel',mechanism)});
 const actuators=[];if(full)for(let k=0;k<8;k++){const g=new T.Group();mechanism.add(g);const a=k/8*TAU;actuators.push({a,barrel:rod(.065,'dark',g),shaft:rod(.027,'steel',g),ends:[ball(.072,'brass',g),ball(.05,'brass',g)]});}
 if(full)for(let k=0;k<8;k++){const angle=k/8*TAU,pg=new T.Group();pg.position.set(.46*Math.cos(angle),1.37,.46*Math.sin(angle));pg.rotation.y=-angle;mechanism.add(pg);const wheel=mesh(new T.TorusGeometry(.09,.014,6,28),'copper',pg);for(let z=0;z<6;z++){const a=z/6*TAU,spoke=rod(.008,'brass',pg);setRod(spoke,V(0,0,0),V(.085*Math.cos(a),.085*Math.sin(a),0));}ball(.025,'steel',pg);}
 const radial=48,angular=144,geom=new T.BufferGeometry(),pos=new Float32Array((radial+1)*(angular+1)*3),uv=new Float32Array((radial+1)*(angular+1)*2),ids=[];
 for(let i=0;i<=radial;i++)for(let j=0;j<=angular;j++){const k=i*(angular+1)+j;uv[k*2]=j/angular;uv[k*2+1]=i/radial;if(i<radial&&j<angular)ids.push(k,k+1,k+angular+1,k+1,k+angular+2,k+angular+1);}
 geom.setAttribute('position',new T.BufferAttribute(pos,3));geom.setAttribute('uv',new T.BufferAttribute(uv,2));geom.setIndex(ids);const membrane=mesh(geom,mat.membrane.clone(),skin);membrane.frustumCulled=false;membrane.renderOrder=2;
 const embroidery=[];if(full)for(let k=0;k<24;k++)embroidery.push({a:(k+.5)/24*TAU,t:dynamicTube(24,.006,'edge',skin)});
 const tentacles=[];const TN=full?64:28;for(let k=0;k<24;k++){const angle=k/24*TAU,length=5.1+.95*Math.sin(k*2.399)+.35*Math.cos(k*1.7);tentacles.push({angle,length,t:dynamicTube(TN,full?.018:.014,k%3?'copper':'brass',appendages),pts:[]});}
 const beads=full?new T.InstancedMesh(sphereG,mat.edge,24*17):null;if(beads){beads.frustumCulled=false;appendages.add(beads);}
 const arms=[];for(let k=0;k<4;k++){const n=full?160:64,across=12,g=new T.BufferGeometry(),p=new Float32Array((n+1)*(across+1)*3),uv=new Float32Array((n+1)*(across+1)*2),idx=[];for(let i=0;i<=n;i++)for(let j=0;j<=across;j++){const z=i*(across+1)+j;uv[z*2]=j/across;uv[z*2+1]=i/n;if(i<n&&j<across)idx.push(z,z+1,z+across+1,z+1,z+across+2,z+across+1);}g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);const o=mesh(g,'ivory',appendages);o.frustumCulled=false;arms.push({o,g,p,n,across,k,edges:[dynamicTube(n,.010,'copper',appendages),dynamicTube(n,.010,'brass',appendages)]});}
 // The central mouth collar is open, without teeth, eyes or a fictional heart.
 const mouth=torus(.19,.038,'copper',appendages);mouth.position.y=.30;const collar=torus(.27,.016,'edge',appendages);collar.position.y=.34;
 const sensory=[];if(full)for(let k=0;k<8;k++){const g=new T.Group();mechanism.add(g);ball(.065,'dark',g);const r=torus(.055,.012,'brass',g);sensory.push({a:(k+.5)/8*TAU,g});}
 return {root,skeleton,mechanism,appendages,skin,ribs,crown,fly,bands,cables,actuators,geom,pos,radial,angular,membrane,embroidery,tentacles,TN,beads,arms,mouth,collar,sensory,full};
}
function animateJelly(j,t,reveal=1){const c=contraction(t),mer=meridian(c),pulse=motionAt(clamp(t)).v,lag=t-.25;
 for(const rib of j.ribs)for(let z=0;z<N;z++){const a=pointOn(mer,z/N,rib.ang),b=pointOn(mer,(z+1)/N,rib.ang);setRod(rib.links[z],a,b);if(j.full)rib.pins[z].position.copy(b);}
 for(const b of j.bands){const pts=[];for(let i=0;i<=b.t.n;i++)pts.push(pointOn(mer,b.q,i/b.t.n*TAU));setTube(b.t,pts);}
 for(const x of j.cables){const pts=[];for(let i=0;i<=x.t.n;i++){const q=.12+.80*i/x.t.n,p=pointOn(mer,q,x.ang);p.y-=.045;pts.push(p);}setTube(x.t,pts);}
 for(const a of j.actuators){const start=pointOn(mer,.20,a.a);start.y-=.09;const end=pointOn(mer,.55,a.a);end.y-=.09;const shaft=start.clone().add(end.clone().sub(start).normalize().multiplyScalar(.38));setRod(a.barrel,start,shaft);setRod(a.shaft,shaft,end);a.ends[0].position.copy(start);a.ends[1].position.copy(end);}
 for(let i=0;i<=j.radial;i++)for(let k=0;k<=j.angular;k++){const p=pointOn(mer,i/j.radial,k/j.angular*TAU);p.y+=.026;j.pos.set(p.toArray(),(i*(j.angular+1)+k)*3);}j.geom.attributes.position.needsUpdate=true;j.geom.computeVertexNormals();
 for(const x of j.embroidery){const pts=[];for(let i=0;i<=x.t.n;i++){const q=i/x.t.n,p=pointOn(mer,q,x.a+.010*Math.sin(q*PI*8));p.y+=.035;pts.push(p);}setTube(x.t,pts);}
 for(const s of j.sensory)s.g.position.copy(pointOn(mer,1,s.a));
 let bcount=0;for(let k=0;k<24;k++){const tent=j.tentacles[k],pts=[pointOn(mer,1,tent.angle)],step=tent.length/j.TN;
  for(let i=1;i<=j.TN;i++){const q=i/j.TN,delay=q*1.3,ph=TAU*(t-delay)/PERIOD,a=tent.angle;const drift=.24*Math.sin(t*.45-q*2+a),drag=.34*Math.sin(ph-.8)*q;
   const d=V(Math.cos(a)*(.08+.20*Math.sin(q*4+lag*.6+a))+drift,-1,Math.sin(a)*(.10+.18*Math.cos(q*3+lag*.5+a))+drag).normalize();pts.push(pts.at(-1).clone().addScaledVector(d,step));
  }tent.pts=pts;setTube(tent.t,pts,true);
  if(j.beads)for(let z=0;z<=16;z++){const q=z/16,p=pts[Math.round(q*j.TN)];dummy.position.copy(p);dummy.scale.setScalar(.027*(1-q*.55));dummy.updateMatrix();j.beads.setMatrixAt(bcount++,dummy.matrix);}
 }if(j.beads)j.beads.instanceMatrix.needsUpdate=true;
 for(const a of j.arms){const centers=[],left=[],right=[],angle=a.k*TAU/4,origin=V(.32*Math.cos(angle),.26,.32*Math.sin(angle)),len=5.0+.25*Math.sin(a.k*1.7);centers.push(origin);
  for(let i=1;i<=a.n;i++){const q=i/a.n,theta=angle+q*1.75;const d=V(.24*Math.cos(theta)+.10*Math.sin(t*.42-q*2.4+a.k),-1,.24*Math.sin(theta)+.08*Math.sin(t*.38-q*2.8+a.k)).normalize();centers.push(centers.at(-1).clone().addScaledVector(d,len/a.n));}
  for(let i=0;i<=a.n;i++){const q=i/a.n,ang=angle+q*4.2+.18*Math.sin(t*.55-q*2),width=(.12+.24*Math.sin(PI*q)**.7)*(1-.78*q**3)*(1+.14*Math.sin(q*TAU*9+a.k)),C=centers[i];
   for(let k=0;k<=a.across;k++){const v=k/a.across*2-1,ruff=.028*Math.sin(q*TAU*9+t*.65-q*2+a.k)*Math.abs(v)**1.6*(.35+Math.sin(PI*q)),p=C.clone().add(V(Math.cos(ang)*v*width,ruff,Math.sin(ang)*v*width));a.p.set(p.toArray(),(i*(a.across+1)+k)*3);if(k===0)left.push(p);if(k===a.across)right.push(p);}
  }a.g.attributes.position.needsUpdate=true;a.g.computeVertexNormals();setTube(a.edges[0],left,true);setTube(a.edges[1],right,true);
 }
 j.fly.rotation.y=t*1.3;j.mechanism.visible=reveal>.15;j.appendages.visible=reveal>.32;j.skin.visible=reveal>.7;
 if(j.full){for(let k=0;k<24;k++)j.tentacles[k].t.o.visible=reveal>.33+k*.004;for(let k=0;k<4;k++){const on=reveal>.44+k*.035;j.arms[k].o.visible=on;const obj=j.arms[k].edges;for(const e of obj)e.o.visible=on;}if(j.beads)j.beads.visible=reveal>.44;}

 j.membrane.material.opacity=.38*ramp(reveal,.7,1);
 return {c,mer,pulse};
}
const main=buildJelly(true),distant=[];for(let i=0;i<5;i++){const j=buildJelly(false),scale=.27+i*.045;j.root.scale.setScalar(scale);distant.push({j,scale,base:V((i%2?1:-1)*(4.3+i*.65),-1.5+i*2.3,-7-i*2.6),phase:i*.71});}
// World-space ocean gradients and soft marine snow.
const sky=new T.Mesh(new T.SphereGeometry(120,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;void main(){vec3 d=normalize(p);float u=smoothstep(-.6,.9,d.y);float glow=pow(max(0.,dot(d,normalize(vec3(-.3,1.,-.5)))),18.);vec3 c=mix(vec3(.004,.012,.020),vec3(.025,.12,.14),u)+glow*vec3(.055,.13,.12);gl_FragColor=vec4(pow(c,vec3(.4545)),1.);}'}));scene.add(sky);
const sprite=document.createElement('canvas');sprite.width=sprite.height=64;const ctx=sprite.getContext('2d'),grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(200,235,231,.9)');grad.addColorStop(.25,'rgba(180,224,222,.35)');grad.addColorStop(1,'rgba(150,210,220,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);const snowMap=new T.CanvasTexture(sprite),sp=[];for(let i=0;i<1600;i++)sp.push((random()-.5)*65,(random()-.5)*65,(random()-.5)*55);const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));const snow=new T.Points(sg,new T.PointsMaterial({color:0x9ac5c3,map:snowMap,size:.075,transparent:true,opacity:.45,depthWrite:false}));scene.add(snow);
for(let i=0;i<7;i++){const m=new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;void main(){float a=pow(sin(v.x*3.14159),4.)*pow(v.y,1.6)*.075;gl_FragColor=vec4(.30,.62,.62,a);}'}),o=new T.Mesh(new T.PlaneGeometry(2+random()*2,65),m);o.position.set(-20+i*7,12,-14-random()*12);o.rotation.z=-.22;scene.add(o);}
const shots=[{t:0,p:[9,6.5,16],look:[0,-.1,0],roll:-.08},{t:3.8,p:[6.5,4.6,13],look:[0,-.2,0],roll:-.04},{t:6.0,p:[5.2,.7,8.2],look:[0,.6,0],roll:.02},{t:9,p:[4.6,-.5,8.5],look:[0,.2,0],roll:.03},{t:13,p:[6,1.2,18],look:[0,-1.8,0],roll:-.04},{t:17.5,p:[7,3,19],look:[0,-2,0],roll:-.08},{t:22,p:[-5,.5,19],look:[0,-2.0,0],roll:.04},{t:26,p:[-9,-1,22],look:[0,-1.6,0],roll:.05},{t:30,p:[-11,-3,29],look:[0,-.3,0],roll:.01}];
function cameraPose(t){let i=1;while(i<shots.length-1&&t>shots[i].t)i++;const a=shots[i-1],b=shots[i],q=ramp(t,a.t,b.t),lag=ramp(t,24,30)*1.8,p=V(...a.p).lerp(V(...b.p),q).add(positionAt(t-lag)),look=V(...a.look).lerp(V(...b.look),q).add(positionAt(t));return {p,look,roll:lerp(a.roll,b.roll,q)};}
window.renderAt=t=>{t=clamp(t,0,30);timeUniform.value=t;
 const reveal=t<3?0:t<9?lerp(.16,.3,ramp(t,3,9)):t<14?lerp(.33,.68,ramp(t,9,14)):lerp(.71,1,ramp(t,14,18));
 const st=animateJelly(main,t,reveal),s=positionAt(t);main.root.position.copy(s);main.root.rotation.z=.035*Math.sin(t*.4)*ramp(t,17,21);main.root.rotation.x=.035*Math.sin(t*.3);
 for(const f of distant){f.j.root.visible=t>18;if(t>18){animateJelly(f.j,t+f.phase,1);f.j.root.position.copy(f.base).add(V(.2*Math.sin(t*.2+f.phase),positionAt(t).y*.7,0));}}
 const cp=cameraPose(t);camera.position.copy(cp.p);camera.up.set(0,1,0);camera.lookAt(cp.look);camera.rotateZ(cp.roll);camera.updateMatrixWorld(true);main.root.updateMatrixWorld(true);
 const boundPoints=[];for(let k=0;k<24;k++)boundPoints.push(main.root.localToWorld(pointOn(st.mer,1,k/24*TAU)));if(main.appendages.visible)for(const ten of main.tentacles)for(let k=0;k<ten.pts.length;k+=8)boundPoints.push(main.root.localToWorld(ten.pts[k].clone()));boundPoints.push(main.root.localToWorld(V(0,1.55,0)));
 const fitWeight=ramp(t,10,13);if(fitWeight>0){let ratio=1;for(const p of boundPoints){const v=p.clone().project(camera);ratio=Math.max(ratio,Math.abs(v.x)/.87,Math.abs(v.y)/.85);}if(ratio>1){camera.position.copy(cp.look).add(cp.p.clone().sub(cp.look).multiplyScalar(lerp(1,ratio*1.02,fitWeight)));camera.updateMatrixWorld(true);}}
 renderer.render(scene,camera);const pro=boundPoints.map(p=>p.project(camera));let err=0;for(const rib of main.ribs)for(const r of rib.links)err=Math.max(err,Math.abs(r.scale.y-LINK));
 return {time:t,contraction:st.c,bellRadius:st.mer.at(-1).x,bellDepth:1.45-st.mer.at(-1).y,forwardSpeed:st.pulse,subject:s.toArray(),camera:camera.position.toArray(),tentacles:24,oralArms:4,cavityVolume:cavityVolume(t),linkError:err,screenBounds:[Math.min(...pro.map(p=>p.x)),Math.max(...pro.map(p=>p.x)),Math.min(...pro.map(p=>p.y)),Math.max(...pro.map(p=>p.y))]};
};
window.sceneInfo={width:W,height:H,duration:30,fps:30,species:'Chrysaora fuscescens',tentacles:24,oralArms:4,revision:'radial-articulated-sea-nettle',parts};window.renderAt(0);window.ready=true;
