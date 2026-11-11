import * as T from 'three';
import {RoomEnvironment} from '../film-v2/vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from '../film-v2/vendor/RoundedBoxGeometry.js';

const params=new URLSearchParams(location.search), W=+(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#3a352b');scene.fog=new T.FogExp2('#3a352b',.022);
const camera=new T.PerspectiveCamera(38,W/H,.1,150);
const env=new RoomEnvironment();const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.04, .1,100).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.52;
scene.add(new T.HemisphereLight(0xdec8a2,0x191109,.68));
const key=new T.DirectionalLight(0xffecd0,3.2);key.position.set(-5,11,7);key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.5,far:45});key.shadow.bias=-.00015;key.shadow.normalBias=.018;key.shadow.radius=3;scene.add(key);
const fill=new T.DirectionalLight(0xb8c7c8,.7);fill.position.set(8,6,-8);scene.add(fill);
const rim=new T.PointLight(0xffd38d,60,28,2);rim.position.set(2,7,-3);scene.add(rim);

let seed=19;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const texCanvas=document.createElement('canvas');texCanvas.width=512;texCanvas.height=512;const cx=texCanvas.getContext('2d');cx.fillStyle='#888888';cx.fillRect(0,0,512,512);
for(let i=0;i<2200;i++){const n=Math.floor(100+rand()*55);cx.strokeStyle=`rgba(${n},${n},${n},${.05+rand()*.09})`;cx.lineWidth=.4+rand()*.4;const y=rand()*512;cx.beginPath();cx.moveTo(0,y);cx.lineTo(512,y+rand()*.8);cx.stroke();}
const brush=new T.CanvasTexture(texCanvas);brush.wrapS=brush.wrapT=T.RepeatWrapping;brush.repeat.set(2,2);brush.anisotropy=8;
const mat=(color,metalness,roughness,extra={})=>new T.MeshStandardMaterial({color,metalness,roughness,...extra});
// Variation lives in the material, with broad tarnish and fine machining marks.
function surfaceTexture(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),im=ctx.createImageData(512,512);for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,n=rand()-.5;let rgb;if(kind==='wood'){const warp=y+9*Math.sin(x*.016)+2*Math.sin(x*.05);const vein=Math.sin(warp*.34+Math.sin(warp*.027)*4),fine=Math.sin(warp*1.9+x*.003);const v=1+.065*vein+.025*fine+.045*n;rgb=[60*v,32*v,19*v]}else{const cloud=(Math.sin(x*.028+Math.sin(y*.02)*1.8)+Math.sin(y*.041+x*.008)+Math.sin(x*.11-y*.07)*.22)/2.22;const v=1+cloud*.032+n*.018;rgb=kind==='brass'?[171*v,125*v,65*v]:[195*v,151*v,86*v];}im.data[i]=rgb[0];im.data[i+1]=rgb[1];im.data[i+2]=rgb[2];im.data[i+3]=255}ctx.putImageData(im,0,0);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=8;return tex}
const M={brass:mat('#ffffff',.87,.33,{map:surfaceTexture('brass'),bumpMap:brush,bumpScale:.008}),gold:mat('#ffffff',.88,.27,{map:surfaceTexture('gold')}),edge:mat('#d2b576',.86,.3),steel:mat('#9c9d96',.92,.26),satin:mat('#655f4d',.79,.36),dark:mat('#242b23',.54,.36),black:mat('#151a15',.4,.4),rubber:mat('#17140f',.05,.65),teal:mat('#304434',.45,.33),white:mat('#ded0ad',.08,.55),green:mat('#b6a56b',.45,.31),wood:mat('#ffffff',.03,.4,{map:surfaceTexture('wood')}),engrave:mat('#47301b',.65,.45)};
const geometries=new Map();function geo(key,fn){if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key)}
let parts=0;function mesh(g,m,p=[0,0,0],parent=scene){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);parts++;return o}
function box(w,h,d,m,p,parent=scene,r=.04){return mesh(geo(`b${w},${h},${d},${r}`,()=>new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4))),m,p,parent)}
function cyl(r,h,m,p,parent=scene,r2=r,segments=32){return mesh(geo(`c${r},${r2},${h},${segments}`,()=>new T.CylinderGeometry(r2,r,h,segments)),m,p,parent)}
function bar(a,b,r,m,parent=scene){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=cyl(r,dir.length(),m,av.add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o}
function torus(r,t,m,p,parent=scene,rotation=[Math.PI/2,0,0]){const o=mesh(geo(`t${r},${t}`,()=>new T.TorusGeometry(r,t,8,48)),m,p,parent);o.rotation.set(...rotation);return o}
function screw(x,y,z,parent=scene,scale=1){cyl(.085*scale,.025*scale,M.black,[x,y-.015,z],parent,.085*scale,24);cyl(.066*scale,.055*scale,M.gold,[x,y+.018,z],parent,.066*scale,24);box(.075*scale,.008,.014*scale,M.black,[x,y+.048*scale,z],parent,.002)}
function perimeter(w,d,y,parent){for(const x of [-w/2+.22,w/2-.22])for(const z of [-d/2+.22,d/2-.22])screw(x,y,z,parent)}
const root=new T.Group();scene.add(root);
const floor=mesh(new T.PlaneGeometry(2000,2000),mat('#514b3e',.03,.82),[0,-.78,0],scene);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
box(21.1,.10,8,M.wood,[0,-.31,-.7],root,.06);box(20.95,.25,7.85,M.wood,[0,-.145,-.7],root,.07);box(20.74,.025,7.64,M.engrave,[0,-.005,-.7],root,.025);box(20.61,.014,7.51,M.edge,[0,.018,-.7],root,.025);box(20.48,.08,7.39,M.wood,[0,.065,-.7],root,.04);
for(const z of [-4.52,3.12])box(20.8,.018,.022,M.edge,[0,-.28,z],root,.003);
for(const x of [-9.6,-5,0,5,9.6])for(const z of [-3.9,2.5]){cyl(.32,.14,M.black,[x,-.69,z],root);cyl(.26,.21,M.brass,[x,-.53,z],root,.19);torus(.26,.04,M.gold,[x,-.62,z],root);screw(x,.12,z,root)}
// Machined edge channels, countersunk screws and short steel cross braces.
for(const z of [-4.25,2.85]){box(20,.009,.018,M.edge,[0,.111,z],root,.003);for(const x of [-9.5,9.5])screw(x,.118,z,root,.55)}
for(const x of [-8,-4,0,4,8])box(.16,.25,6.8,M.dark,[x,-.48,-.7],root,.02);
function bed(x,w,d=3.6){const g=new T.Group();g.position.set(x,0,0);root.add(g);box(w,.19,d,M.wood,[0,.315,0],g,.055);box(w-.14,.035,d-.14,M.brass,[0,.435,0],g,.025);box(w-.36,.115,d-.36,M.dark,[0,.515,0],g,.035);perimeter(w,d,.51,g);return g}
bed(-7.6,4.3);bed(0,5.4);bed(7.2,4.9);
// Shared precision rail: two round rods, actual bearing seats and central lead screw.
for(const z of [-.88,.88]){bar([-9.6,1.03,z],[9.55,1.03,z],.11,M.steel,root);for(const x of [-9.3,-5.5,-2.5,2.5,5,9.3]){box(.48,.3,.58,M.satin,[x,.75,z],root,.045);if(Math.abs(x)>9)bar([x-.25,1.03,z],[x+.25,1.03,z],.18,M.brass,root);screw(x,.92,z+.2,root,.7)}}
bar([-9.6,.87,0],[9.5,.87,0],.1,M.satin,root);
const helix=[];for(let i=0;i<=2100;i++){const u=i/2100,a=u*Math.PI*2*66;helix.push(new T.Vector3(-9.6+19.1*u,.87+.132*Math.cos(a),.132*Math.sin(a)))}
const screwThread=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(helix),2100,.026,4,false),M.steel,[0,0,0],root);
// Thread rotates analytically around x, its endpoints stay in the supports.
const screwAxis=new T.Group();screwAxis.position.set(0,.87,0);root.add(screwAxis);root.remove(screwThread);screwThread.position.y=-.87;screwAxis.add(screwThread);
for(const x of [-9.6,9.5])bar([x-.12,.87,0],[x+.12,.87,0],.25,M.gold,root);

function gear(r,teeth,p,parent,material=M.brass){const g=new T.Group();g.position.set(...p);parent.add(g);const shape=new T.Shape();for(let j=0;j<teeth*4;j++){const a=j/(teeth*4)*Math.PI*2,rr=r*([.88,1,1,.88][j%4]);const x=rr*Math.cos(a),y=rr*Math.sin(a);j?shape.lineTo(x,y):shape.moveTo(x,y)}shape.closePath();const hole=new T.Path();hole.absarc(0,0,r*.19,0,Math.PI*2,true);shape.holes.push(hole);
for(let j=0;j<6;j++){const a0=j*Math.PI/3+.14,a1=(j+1)*Math.PI/3-.14,h=new T.Path();h.absarc(0,0,r*.69,a1,a0,true);h.lineTo(Math.cos(a0)*r*.32,Math.sin(a0)*r*.32);h.absarc(0,0,r*.32,a0,a1,false);h.closePath();shape.holes.push(h)}
mesh(new T.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012}),material,[0,0,-.085],g);for(const rr of [.75,.81])torus(r*rr,.009,M.edge,[0,0,.098],g,[0,0,0]);const hub=cyl(r*.24,.28,M.brass,[0,0,0],g);hub.rotation.x=Math.PI/2;torus(r*.20,.018,M.edge,[0,0,.15],g,[0,0,0]);return g}
const g1=gear(.77,28,[-9.1,1.4,1.65],root),g2=gear(.50,18,[-7.86,1.4,1.65],root);
box(1.5,.75,.95,M.dark,[-9.1,.95,.9],root,.14);bar([-9.1,1.4,.85],[-9.1,1.4,1.77],.14,M.steel,root);bar([-7.86,1.4,.85],[-7.86,1.4,1.8],.14,M.steel,root);
// A curved bearing saddle replaces the modern motor-cooling ribs.
for(const x of [-9.48,-8.72]){cyl(.21,.25,M.brass,[x,.72,.9],root);torus(.20,.014,M.edge,[x,.85,.9],root)}
// Carriage and identifiable evidence cartridge.
const trolley=new T.Group();root.add(trolley);
box(1.9,.22,2.25,M.satin,[0,1.26,0],trolley,.08);box(1.64,.12,1.98,M.brass,[0,1.43,0],trolley,.055);perimeter(1.8,2.2,1.39,trolley);
for(const z of [-.88,.88])bar([-.62,1.04,z],[.62,1.04,z],.2,M.dark,trolley);
box(1.37,.27,1.48,M.gold,[0,1.64,0],trolley,.09);box(1.15,.035,1.25,M.dark,[0,1.792,0],trolley,.05);box(.91,.065,.99,M.white,[0,1.826,0],trolley,.045);
for(const x of [-.48,.48])for(const z of [-.54,.54])screw(x,1.82,z,trolley,.7);
torus(.23,.008,M.brass,[0,1.864,-.12],trolley);for(const q of [-1,1])bar([q*.08,1.866,-.12],[q*.18,1.866,-.12],.008,M.brass,trolley);
// A wax-coloured seal and engine-turned inlay replace the electronic-looking badge.
cyl(.13,.025,M.engrave,[0,1.88,.3],trolley);torus(.105,.009,M.edge,[0,1.898,.3],trolley);

// Feed clamp with real jaws, pivot pins and short actuator rods.
const jaws=[];for(const z of [-1.25,1.25]){const g=new T.Group();g.position.set(-7.6,0,z);root.add(g);box(1.65,.37,.32,M.brass,[0,1.65,0],g,.055);box(1.15,.16,.18,M.black,[0,1.62,-Math.sign(z)*.18],g,.03);for(const x of [-.57,.57]){bar([x,.55,0],[x,1.52,0],.095,M.steel,g);box(.35,.25,.44,M.dark,[x,.65,0],g,.03);cyl(.16,.14,M.dark,[x,1.5,0],g);screw(x,1.87,0,g,.85)}jaws.push(g)}
// Center comparator: four round posts, bearing bushes, a cross-axis slide and piston.
for(const z of [-1.64,1.64])for(const x of [-.72,.72]){cyl(.17,.16,M.brass,[x,.67,z],root);bar([x,.75,z],[x,4.05,z],.095,M.brass,root);cyl(.14,.28,M.dark,[x,3.72,z],root);cyl(.16,.06,M.gold,[x,3.91,z],root);screw(x,4.12,z,root,.6)}
for(const z of [-1.64,1.64])box(1.9,.22,.52,M.brass,[0,4.04,z],root,.055);
for(const x of [-.48,.48])bar([x,4.03,-1.7],[x,4.03,1.7],.09,M.steel,root);
box(.2,.15,3.5,M.dark,[0,3.92,0],root,.04);
const scanner=new T.Group();root.add(scanner);box(1.4,.42,.8,M.gold,[0,3.76,0],scanner,.07);perimeter(1.4,.8,4.0,scanner);cyl(.24,.49,M.dark,[0,3.31,0],scanner);cyl(.15,.7,M.steel,[0,2.85,0],scanner);cyl(.26,.12,M.brass,[0,2.47,0],scanner);box(1.05,.1,.61,M.dark,[0,2.36,0],scanner,.035);box(.74,.04,.08,M.green,[0,2.297,0],scanner,.018);
// Ruler, engraved ticks attached to strip, end-stops, knurled feed wheels.
box(.18,.05,3.5,M.brass,[.93,4.16,0],root,.02);for(let i=0;i<29;i++)box(i%5===0?.14:.08,.008,.018,M.dark,[.94,4.191,-1.62+i*.116],root,.002);
for(const z of [-1.87,1.87]){const wheel=cyl(.28,.16,M.brass,[0,4.01,z],root);wheel.rotation.x=Math.PI/2;for(let j=0;j<32;j++){const a=j*Math.PI/16;bar([Math.cos(a)*.276,4.01+Math.sin(a)*.276,z-.08],[Math.cos(a)*.276,4.01+Math.sin(a)*.276,z+.08],.012,M.edge,root)}}
// Dial with recessed ivory face, glass-like ring, ticks and absolute-state needle.
const dial=new T.Group();dial.position.set(1.75,2.85,1.59);root.add(dial);
const caseMesh=cyl(.57,.22,M.brass,[0,0,0],dial);caseMesh.rotation.x=Math.PI/2;const face=cyl(.49,.025,M.white,[0,0,.125],dial);face.rotation.x=Math.PI/2;torus(.5,.035,M.gold,[0,0,.15],dial,[0,0,0]);torus(.55,.012,M.edge,[0,0,.128],dial,[0,0,0]);
const dialCanvas=document.createElement('canvas');dialCanvas.width=dialCanvas.height=1024;const dc=dialCanvas.getContext('2d');dc.fillStyle='#e3d5b5';dc.fillRect(0,0,1024,1024);dc.strokeStyle='#544735';dc.lineWidth=2;for(const rad of [463,353,212]){dc.beginPath();dc.arc(512,512,rad,0,Math.PI*2);dc.stroke()}for(let j=0;j<60;j++){const a=j*Math.PI/30;const r=j%5===0?420:442;dc.lineWidth=j%5===0?3:1.6;dc.beginPath();dc.moveTo(512+Math.sin(a)*r,512-Math.cos(a)*r);dc.lineTo(512+Math.sin(a)*461,512-Math.cos(a)*461);dc.stroke()}dc.font='54px Georgia, serif';dc.fillStyle='#443824';dc.textAlign='center';dc.textBaseline='middle';const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];for(let j=0;j<12;j++){const a=j*Math.PI/6;dc.fillText(roman[j],512+Math.sin(a)*302,512-Math.cos(a)*302)}
const dialTex=new T.CanvasTexture(dialCanvas);dialTex.colorSpace=T.SRGBColorSpace;const dialPrint=mesh(new T.CircleGeometry(.483,96),new T.MeshBasicMaterial({map:dialTex,color:0xd4cbb9}),[0,0,.141],dial);for(let j=0;j<40;j++){const a=j*Math.PI/20;const stud=cyl(.012,.018,M.gold,[Math.cos(a)*.535,Math.sin(a)*.535,.142],dial,.012,8);stud.rotation.x=Math.PI/2}
const needle=new T.Group();dial.add(needle);bar([0,-.08,.17],[0,.36,.17],.014,M.dark,needle);const pin=cyl(.047,.035,M.gold,[0,0,.17],dial);pin.rotation.x=Math.PI/2;bar([1.75,.58,1.59],[1.75,2.4,1.59],.12,M.dark,root);

// Rear knowledge mechanism: drawers in steel runners, brass skeleton and paper laminations.
const drawers=[];for(const x of [-3.5,-1.9]){box(.15,2.7,1.5,M.wood,[x,1.93,-3.15],root,.035);for(let j=0;j<4;j++)screw(x,3.32,-3.74+j*.39,root,.7)}
box(2.1,.2,1.7,M.wood,[-2.7,3.39,-3.15],root,.055);box(2.2,.065,1.8,M.gold,[-2.7,3.51,-3.15],root,.035);box(2.1,.2,1.7,M.wood,[-2.7,.65,-3.15],root,.055);
for(let j=0;j<5;j++){const y=.89+j*.47;box(1.65,.08,1.45,M.satin,[-2.7,y-.06,-3.15],root,.02);const d=new T.Group();d.position.set(-2.7,y,-3.15);root.add(d);box(1.46,.1,1.25,M.brass,[0,0,0],d,.03);for(let n=0;n<4;n++)box(1.22,.018,1.04,M.white,[0,.08+n*.022,0],d,.012);box(1.5,.29,.08,M.wood,[0,.12,.65],d,.025);box(1.35,.21,.018,M.gold,[0,.12,.698],d,.02);box(1.30,.165,.022,M.wood,[0,.12,.711],d,.018);bar([-.24,.13,.79],[.24,.13,.79],.027,M.brass,d);for(const x of [-.25,.25]){bar([x,.13,.71],[x,.13,.79],.035,M.gold,d);torus(.054,.01,M.edge,[x,.13,.73],d,[0,0,0])}drawers.push(d)}
// Rear branch verifier: twin glass-window pressure columns, linked valves and tubing.
box(3,.26,1.9,M.dark,[3.4,.6,-3.15],root,.09);box(2.8,.06,1.7,M.brass,[3.4,.77,-3.15],root,.04);
for(const x of [2.65,4.12]){cyl(.28,.14,M.brass,[x,.9,-3.15],root);cyl(.135,1.43,M.white,[x,1.7,-3.15],root);for(const yy of [1.02,2.35]){cyl(.245,.075,M.gold,[x,yy,-3.15],root);torus(.215,.012,M.edge,[x,yy+.048,-3.15],root)}for(const dx of [-.20,.20])bar([x+dx,1.04,-3.15],[x+dx,2.34,-3.15],.025,M.brass,root);bar([x,1.14,-2.998],[x,2.23,-2.998],.015,M.engrave,root);for(let j=0;j<12;j++)box(j%3===0?.13:.07,.012,.015,M.engrave,[x,1.22+j*.083,-3.004],root,.003);cyl(.105,.18,M.brass,[x,2.48,-3.15],root);const finial=mesh(new T.SphereGeometry(.105,20,12),M.gold,[x,2.62,-3.15],root);}
function pipe(points,r,material){const v=points.map(p=>new T.Vector3(...p));const curve=new T.CatmullRomCurve3(v,false,'centripetal');mesh(new T.TubeGeometry(curve,64,r,8,false),material,[0,0,0],root);for(const i of [0,points.length-1]){const p=points[i],other=points[i===0?1:points.length-2];const d=new T.Vector3(...other).sub(new T.Vector3(...p)).normalize().multiplyScalar(.12);bar(new T.Vector3(...p).sub(d).toArray(),new T.Vector3(...p).add(d).toArray(),r*1.8,M.satin,root)}}
pipe([[-.7,1.1,-1.6],[-.9,.85,-2.0],[-1.4,.85,-2.25],[-2.7,.85,-2.25]],.065,M.brass);
pipe([[.8,1.1,-1.6],[1.1,.95,-2.1],[2.65,.95,-2.1],[2.65,1.25,-2.85]],.055,M.steel);
pipe([[4.12,1.25,-2.85],[4.12,1.05,-2.2],[5.2,1.05,-2.2],[5.8,1.1,-1.55]],.055,M.brass);
pipe([[-8.6,.7,-1.4],[-8.9,.6,-3.8],[-6.8,.6,-4.0],[-3.8,.6,-4.0],[-2.7,.6,-3.8]],.045,M.teal);
pipe([[8.5,.8,-1.5],[9.6,.8,-2.0],[9.5,.55,-3.8],[6.5,.55,-4.0],[4.12,.85,-3.7]],.06,M.satin);
// Return rail behind the work cells with raised supports and an identifiable shuttle.
for(const z of [-4.16,-3.94])bar([-8.8,.6,z],[8.9,.6,z],.045,M.brass,root);
for(const x of [-8,-5,0,5,8])box(.3,.44,.6,M.dark,[x,.33,-4.05],root,.02);
const returnShuttle=new T.Group();root.add(returnShuttle);box(.7,.16,.5,M.brass,[0,.78,-4.05],returnShuttle,.05);box(.48,.06,.29,M.teal,[0,.9,-4.05],returnShuttle,.035);

// Output press: steel posts and flange cylinders, a constrained ram, springs, closed review stop.
for(const z of [-1.6,1.6]){box(.8,.23,.8,M.brass,[7.2,.7,z],root,.06);bar([7.2,.8,z],[7.2,4.25,z],.15,M.steel,root);cyl(.27,.2,M.dark,[7.2,4.08,z],root);for(const dx of [-.23,.23])screw(7.2+dx,.85,z,root,.7)}
box(1.32,.22,3.9,M.brass,[7.2,4.25,0],root,.055);perimeter(1.32,3.9,4.37,(()=>{const g=new T.Group();g.position.x=7.2;root.add(g);return g})());
// Open eccentric cam with a roller follower: the input is visible, rather than a hydraulic housing.
for(const z of [-.43,.43]){bar([7.2,4.36,z],[7.2,5.05,z],.055,M.brass,root);const bush=cyl(.14,.12,M.brass,[7.2,5.05,z],root);bush.rotation.x=Math.PI/2;}
bar([7.2,5.05,-.52],[7.2,5.05,.57],.065,M.steel,root);
const pressCam=new T.Group();pressCam.position.set(7.2,5.05,0);root.add(pressCam);const camDisc=cyl(.36,.17,M.brass,[0,-.245,0],pressCam);camDisc.rotation.x=Math.PI/2;torus(.30,.011,M.edge,[0,-.245,.095],pressCam,[0,0,0]);bar([0,0,.18],[.55,0,.18],.035,M.brass,pressCam);bar([.55,0,.18],[.55,0,.38],.045,M.wood,pressCam);
const press=new T.Group();root.add(press);cyl(.18,1.3,M.steel,[7.2,3.36,0],press);box(1.6,.3,2.1,M.gold,[7.2,2.65,0],press,.07);box(1.3,.1,1.8,M.dark,[7.2,2.45,0],press,.035);perimeter(1.6,2.1,2.83,(()=>{const g=new T.Group();g.position.x=7.2;press.add(g);return g})());
bar([7.2,3.98,0],[7.2,4.79,0],.08,M.steel,press);const follower=cyl(.145,.18,M.steel,[7.2,4.79,0],press);follower.rotation.x=Math.PI/2;cyl(.205,.23,M.brass,[7.2,4.39,0],root);
const springs=[];for(const z of [-1.1,1.1]){bar([7.2,2.8,z],[7.2,4.0,z],.06,M.dark,root);const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2*9;pts.push(new T.Vector3(Math.cos(a)*.15,i/160,Math.sin(a)*.15))}const s=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),160,.027,6,false),M.steel,[7.2,2.84,z],root);springs.push(s)}
for(const z of [-1.2,1.2]){box(.4,.7,.5,M.dark,[9.0,.94,z],root,.04);cyl(.14,.4,M.brass,[9,1.49,z],root)}bar([9,1.68,-1.2],[9,1.68,1.2],.1,M.brass,root);for(let j=0;j<9;j++)box(.03,.05,.085,M.teal,[9,1.78,-1+j*.25],root,.008);
// No flexible motor hose above the eighteenth-century-inspired frame.
const indicators=[];for(const [x,z] of [[-8.7,-1.1],[1.9,-1.3],[8.6,-1.2]]){cyl(.15,.08,M.brass,[x,.65,z],root);const lamp=cyl(.095,.06,M.green,[x,.72,z],root);indicators.push(lamp)}

// Turned bases and capitals make the load-bearing structure read as a crafted instrument.
function turned(x,y,z,r,h,parent=root){const profile=[[1,0],[1,.09],[.82,.16],[.70,.30],[.65,.66],[.73,.82],[.86,.92],[.86,1]].map(([rr,yy])=>new T.Vector2(rr*r,yy*h));return mesh(new T.LatheGeometry(profile,48),M.brass,[x,y,z],parent)}
for(const z of [-1.64,1.64])for(const x of [-.72,.72]){turned(x,.77,z,.165,.40);turned(x,3.54,z,.155,.35);for(const yy of [1.17,3.54,3.87])torus(.111,.012,M.edge,[x,yy,z],root);cyl(.107,2.30,M.brass,[x,2.33,z],root)}
for(const z of [-1.6,1.6]){turned(7.2,.82,z,.22,.43);turned(7.2,3.85,z,.22,.25);for(const yy of [1.25,3.85,4.08])torus(.164,.013,M.edge,[7.2,yy,z],root);cyl(.157,2.50,M.brass,[7.2,2.55,z],root)}

// Fine-line scrollwork belongs to the metal plates; it never enters as a screen overlay.
const ec=document.createElement('canvas');ec.width=1024;ec.height=512;const ectx=ec.getContext('2d');ectx.strokeStyle='rgba(52,34,15,.76)';ectx.lineWidth=2.3;ectx.strokeRect(30,30,964,452);ectx.lineWidth=1.2;ectx.strokeRect(40,40,944,432);
for(const sx of [-1,1])for(const sy of [-1,1]){ectx.save();ectx.translate(512,256);ectx.scale(sx,sy);ectx.beginPath();ectx.moveTo(440,206);ectx.bezierCurveTo(300,206,310,72,190,95);ectx.bezierCurveTo(110,110,145,176,193,150);ectx.bezierCurveTo(230,128,189,112,180,135);ectx.stroke();ectx.beginPath();ectx.moveTo(430,193);ectx.bezierCurveTo(338,180,332,115,285,75);ectx.bezierCurveTo(258,49,231,71,250,86);ectx.stroke();for(let k=0;k<6;k++){const xx=310+k*18,yy=111+k*14;ectx.beginPath();ectx.moveTo(xx,yy);ectx.quadraticCurveTo(xx-4,yy-32,xx-22,yy-28);ectx.quadraticCurveTo(xx-19,yy-8,xx,yy);ectx.stroke()}ectx.restore()}
ectx.lineWidth=1.3;for(let k=0;k<12;k++){const a=k*Math.PI/6;ectx.save();ectx.translate(512,256);ectx.rotate(a);ectx.beginPath();ectx.ellipse(0,-27,11,46,0,0,Math.PI*2);ectx.stroke();ectx.restore()}ectx.beginPath();ectx.arc(512,256,13,0,Math.PI*2);ectx.stroke();
const etchTex=new T.CanvasTexture(ec);etchTex.colorSpace=T.SRGBColorSpace;const etchMat=new T.MeshStandardMaterial({map:etchTex,transparent:true,depthWrite:false,roughness:.65,metalness:.25,polygonOffset:true,polygonOffsetFactor:-2});
function etched(w,d,x,y,z,parent=root){const p=mesh(new T.PlaneGeometry(w,d),etchMat,[x,y,z],parent);p.rotation.x=-Math.PI/2;p.castShadow=false;return p}
// Chasing is concentrated on the two bridge plates; broad surfaces stay clean.
etched(1.10,3.55,7.2,4.363,0);etched(1.26,.64,0,3.973,0,scanner);
for(const [x,w] of [[-7.6,4.3],[0,5.4],[7.2,4.9]]){for(const z of [-1.7,1.7]){box(w-.5,.009,.017,M.edge,[x,.491,z],root,.003);for(const dx of [-w/2+.25,w/2-.25]){const g=new T.Group();g.position.set(x+dx,.492,z);root.add(g);for(const j of [-1,1])bar([0,0,0],[j*.15,0,-Math.sign(z)*.15],.009,M.edge,g)}}}
// Chased corner caps at the wooden plinth, with no decorative parts in the work envelope.
for(const x of [-10.07,10.07])for(const z of [-4.15,2.75]){box(.36,.012,.31,M.brass,[x,.113,z],root,.025);screw(x,.12,z,root,.50)}

const clamp=n=>Math.max(0,Math.min(1,n)),smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))},ramp=(t,a,b)=>smooth((t-a)/(b-a)),mix=(a,b,q)=>a+(b-a)*q;
function carrierX(t){return -7.6+7.6*ramp(t,3,6.35)+7.2*ramp(t,10,12.9)}
// Independent position and target curves; hold during contact, travel along the same workpiece.
const poseKeys=[
 [0,[-11.5,5.8,7.6],[-7.6,1.5,0],37],
 [2.9,[-11.0,5.3,7.1],[-7.6,1.6,0],37],
 [6.35,[-3.8,6.1,8.4],[0,2.2,0],37],
 [9.8,[-3.5,5.7,8.3],[0,2.15,-.1],37],
 [12.9,[3.1,6.3,8.9],[7.2,2.3,0],38],
 [14.9,[3.3,6.5,9.0],[7.2,2.3,0],38],
 [17.4,[12.3,14.6,19.4],[.1,-.6,-1.0],40],
 [18,[12.3,14.6,19.4],[.1,-.6,-1.0],40]
];
function cameraAt(t){let i=1;while(i<poseKeys.length-1&&t>poseKeys[i][0])i++;const a=poseKeys[i-1],b=poseKeys[i],q=ramp(t,a[0],b[0]);return {position:a[1].map((v,j)=>mix(v,b[1][j],q)),target:a[2].map((v,j)=>mix(v,b[2][j],q)),fov:mix(a[3],b[3],q)}}
window.renderAt=seconds=>{let t=Math.max(0,Math.min(18,seconds*.75));trolley.position.x=carrierX(t);const close=ramp(t,.6,1.35)-ramp(t,2.0,2.65);jaws.forEach((j,i)=>j.position.z=(i===0?-1:1)*(1.25-.23*close));
const scanZ=-1.34+2.68*ramp(t,6.7,8.9);scanner.position.z=scanZ;scanner.position.y=-.22*(ramp(t,7.0,7.5)-ramp(t,9.15,9.6));
drawers.forEach((d,i)=>d.position.z=-3.15+(i===2?.72:0)*(ramp(t,7.9,8.7)-ramp(t,10,11)));
const travel=7.6*ramp(t,3,6.35)+7.2*ramp(t,10,12.9);screwAxis.rotation.x=travel*9;g1.rotation.z=-travel*3;g2.rotation.z=travel*3*.77/.50;
needle.rotation.z=.85-1.6*ramp(t,7.1,8.7)+.45*ramp(t,9.0,9.7);
const phase=ramp(t,13.15,13.85)-ramp(t,14.15,14.8),angle=Math.PI*(1-phase);pressCam.rotation.z=angle;const offsetX=.245*Math.sin(angle),contactY=5.05-.245*Math.cos(angle)-Math.sqrt(.36*.36-offsetX*offsetX),down=4.935-contactY;press.position.y=-down;springs.forEach(s=>{s.position.y=2.84-down;s.scale.y=1+down});
returnShuttle.position.x=8.2-16*ramp(t,15,17.6);const pose=cameraAt(t);camera.position.fromArray(pose.position);camera.lookAt(new T.Vector3(...pose.target));camera.fov=pose.fov;camera.updateProjectionMatrix();renderer.render(scene,camera);return {time:t,carrierX:trolley.position.x,camera:pose,parts,drawcalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};};
window.sceneInfo={parts,three:T.REVISION,width:W,height:H};window.renderAt(0);window.ready=true;
