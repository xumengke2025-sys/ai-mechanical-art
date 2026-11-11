import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

const params=new URLSearchParams(location.search), W=+(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#182226');scene.fog=new T.FogExp2('#182226',.012);
const camera=new T.PerspectiveCamera(38,W/H,.1,150);
const env=new RoomEnvironment();const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.04, .1,100).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.7;
scene.add(new T.HemisphereLight(0xc4ddeb,0x34271c,1.5));
const key=new T.DirectionalLight(0xffebce,4.0);key.position.set(-4,14,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-15,right:15,top:11,bottom:-11,near:.5,far:45});key.shadow.bias=-.00025;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);
const fill=new T.DirectionalLight(0xbddcea,2);fill.position.set(8,6,-8);scene.add(fill);
const rim=new T.PointLight(0xffd38d,45,28,2);rim.position.set(2,7,-3);scene.add(rim);

let seed=19;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const texCanvas=document.createElement('canvas');texCanvas.width=512;texCanvas.height=512;const cx=texCanvas.getContext('2d');cx.fillStyle='#888888';cx.fillRect(0,0,512,512);
for(let i=0;i<2200;i++){const n=Math.floor(100+rand()*55);cx.strokeStyle=`rgba(${n},${n},${n},${.05+rand()*.09})`;cx.lineWidth=.4+rand()*.4;const y=rand()*512;cx.beginPath();cx.moveTo(0,y);cx.lineTo(512,y+rand()*.8);cx.stroke();}
const brush=new T.CanvasTexture(texCanvas);brush.wrapS=brush.wrapT=T.RepeatWrapping;brush.repeat.set(2,2);brush.anisotropy=8;
const mat=(color,metalness,roughness,extra={})=>new T.MeshStandardMaterial({color,metalness,roughness,...extra});
const M={brass:mat('#ba8742',.88,.27,{bumpMap:brush,bumpScale:.009}),gold:mat('#dfb65f',.9,.21),edge:mat('#f0d596',.85,.22),steel:mat('#a0b4bd',.95,.19),satin:mat('#71838c',.8,.32),dark:mat('#202d32',.62,.35),black:mat('#101a1d',.4,.4),rubber:mat('#0b1012',.05,.65),teal:mat('#226d69',.55,.25),white:mat('#e3e1cf',.25,.4),green:mat('#77cbb0',.4,.23,{emissive:0x287360,emissiveIntensity:.25})};
const geometries=new Map();function geo(key,fn){if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key)}
let parts=0;function mesh(g,m,p=[0,0,0],parent=scene){const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);parts++;return o}
function box(w,h,d,m,p,parent=scene,r=.04){return mesh(geo(`b${w},${h},${d},${r}`,()=>new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4))),m,p,parent)}
function cyl(r,h,m,p,parent=scene,r2=r,segments=32){return mesh(geo(`c${r},${r2},${h},${segments}`,()=>new T.CylinderGeometry(r2,r,h,segments)),m,p,parent)}
function bar(a,b,r,m,parent=scene){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=cyl(r,dir.length(),m,av.add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o}
function torus(r,t,m,p,parent=scene,rotation=[Math.PI/2,0,0]){const o=mesh(geo(`t${r},${t}`,()=>new T.TorusGeometry(r,t,8,48)),m,p,parent);o.rotation.set(...rotation);return o}
function screw(x,y,z,parent=scene,scale=1){cyl(.085*scale,.025*scale,M.black,[x,y-.015,z],parent,.085*scale,16);cyl(.066*scale,.055*scale,M.steel,[x,y+.018,z],parent,.066*scale,6);box(.075*scale,.008,.014*scale,M.black,[x,y+.048*scale,z],parent,.002)}
function perimeter(w,d,y,parent){for(const x of [-w/2+.22,w/2-.22])for(const z of [-d/2+.22,d/2-.22])screw(x,y,z,parent)}
const root=new T.Group();scene.add(root);
box(25,.2,15,mat('#182327',.3,.48),[0,-.9,0],scene,.09);
box(21,.38,7.9,M.dark,[0,-.18,-.7],root,.18);box(20.65,.035,7.55,M.satin,[0,.03,-.7],root,.12);box(20.48,.06,7.39,M.black,[0,.075,-.7],root,.1);
for(const x of [-9.6,-5,0,5,9.6])for(const z of [-3.9,2.5]){cyl(.36,.2,M.rubber,[x,-.63,z],root);cyl(.26,.25,M.satin,[x,-.42,z],root);torus(.26,.045,M.brass,[x,-.35,z],root);screw(x,.12,z,root)}
// Machined edge channels, countersunk screws and short steel cross braces.
for(const z of [-4.25,2.85]){box(20,.024,.045,M.brass,[0,.116,z],root,.005);for(let x=-9.6;x<=9.6;x+=.8)screw(x,.13,z,root,.7)}
for(const x of [-8,-4,0,4,8])box(.16,.25,6.8,M.dark,[x,-.48,-.7],root,.02);
function bed(x,w,d=3.6){const g=new T.Group();g.position.set(x,0,0);root.add(g);box(w,.3,d,M.dark,[0,.26,0],g,.12);box(w-.14,.075,d-.14,M.brass,[0,.45,0],g,.055);box(w-.36,.09,d-.36,M.black,[0,.53,0],g,.04);perimeter(w,d,.51,g);return g}
bed(-7.6,4.3);bed(0,5.4);bed(7.2,4.9);
// Shared precision rail: two round rods, actual bearing seats and central lead screw.
for(const z of [-.88,.88]){bar([-9.6,1.03,z],[9.55,1.03,z],.11,M.steel,root);for(const x of [-9.3,-5.5,-2.5,2.5,5,9.3]){box(.48,.3,.58,M.satin,[x,.75,z],root,.045);if(Math.abs(x)>9)bar([x-.25,1.03,z],[x+.25,1.03,z],.18,M.brass,root);screw(x,.92,z+.2,root,.7)}}
bar([-9.6,.87,0],[9.5,.87,0],.1,M.satin,root);
const helix=[];for(let i=0;i<=2100;i++){const u=i/2100,a=u*Math.PI*2*66;helix.push(new T.Vector3(-9.6+19.1*u,.87+.132*Math.cos(a),.132*Math.sin(a)))}
const screwThread=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(helix),2100,.026,4,false),M.steel,[0,0,0],root);
// Thread rotates analytically around x, its endpoints stay in the supports.
const screwAxis=new T.Group();screwAxis.position.set(0,.87,0);root.add(screwAxis);root.remove(screwThread);screwThread.position.y=-.87;screwAxis.add(screwThread);
for(const x of [-9.6,9.5])bar([x-.12,.87,0],[x+.12,.87,0],.25,M.gold,root);

function gear(r,teeth,p,parent,material=M.brass){const g=new T.Group();g.position.set(...p);parent.add(g);const shape=new T.Shape();for(let j=0;j<teeth*4;j++){const a=j/(teeth*4)*Math.PI*2,rr=r*([.88,1,1,.88][j%4]);const x=rr*Math.cos(a),y=rr*Math.sin(a);j?shape.lineTo(x,y):shape.moveTo(x,y)}shape.closePath();const hole=new T.Path();hole.absarc(0,0,r*.19,0,Math.PI*2,true);shape.holes.push(hole);mesh(new T.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.018,bevelThickness:.018}),material,[0,0,-.095],g);torus(r*.66,.035,M.edge,[0,0,.104],g,[0,0,0]);const hub=cyl(r*.23,.31,M.steel,[0,0,0],g);hub.rotation.x=Math.PI/2;for(let j=0;j<6;j++){const a=j*Math.PI/3;const o=cyl(r*.055,.1,M.dark,[Math.cos(a)*r*.45,Math.sin(a)*r*.45,.04],g);o.rotation.x=Math.PI/2;}return g}
const g1=gear(.77,28,[-9.1,1.4,1.65],root),g2=gear(.50,18,[-7.86,1.4,1.65],root);
box(1.5,.75,.95,M.dark,[-9.1,.95,.9],root,.14);bar([-9.1,1.4,.85],[-9.1,1.4,1.77],.14,M.steel,root);bar([-7.86,1.4,.85],[-7.86,1.4,1.8],.14,M.steel,root);
for(let j=0;j<8;j++)box(.05,.48,.7,M.satin,[-9.65+j*.14,.91,.85],root,.008);
// Carriage and identifiable evidence cartridge.
const trolley=new T.Group();root.add(trolley);
box(1.9,.22,2.25,M.satin,[0,1.26,0],trolley,.08);box(1.64,.12,1.98,M.brass,[0,1.43,0],trolley,.055);perimeter(1.8,2.2,1.39,trolley);
for(const z of [-.88,.88])bar([-.62,1.04,z],[.62,1.04,z],.2,M.dark,trolley);
box(1.37,.27,1.48,M.gold,[0,1.64,0],trolley,.09);box(1.15,.035,1.25,M.dark,[0,1.792,0],trolley,.05);box(.91,.065,.99,M.teal,[0,1.826,0],trolley,.045);
for(const x of [-.48,.48])for(const z of [-.54,.54])screw(x,1.82,z,trolley,.7);
for(let i=0;i<8;i++)box(.055,.016,.37,M.edge,[-.34+i*.098,1.865,-.18],trolley,.008);
box(.47,.018,.25,M.green,[0,1.869,.3],trolley,.035);

// Feed clamp with real jaws, pivot pins and short actuator rods.
const jaws=[];for(const z of [-1.25,1.25]){const g=new T.Group();g.position.set(-7.6,0,z);root.add(g);box(1.65,.37,.32,M.brass,[0,1.65,0],g,.055);box(1.15,.16,.18,M.black,[0,1.62,-Math.sign(z)*.18],g,.03);for(const x of [-.57,.57]){bar([x,.55,0],[x,1.52,0],.095,M.steel,g);box(.35,.25,.44,M.dark,[x,.65,0],g,.03);cyl(.16,.14,M.dark,[x,1.5,0],g);screw(x,1.87,0,g,.85)}jaws.push(g)}
// Center comparator: four round posts, bearing bushes, a cross-axis slide and piston.
for(const z of [-1.64,1.64])for(const x of [-.72,.72]){cyl(.19,.16,M.brass,[x,.67,z],root);bar([x,.75,z],[x,4.05,z],.105,M.steel,root);cyl(.17,.58,M.dark,[x,3.57,z],root);cyl(.19,.1,M.gold,[x,3.91,z],root);screw(x,4.12,z,root,.8)}
for(const z of [-1.64,1.64])box(1.9,.3,.64,M.brass,[0,4.0,z],root,.07);
for(const x of [-.48,.48])bar([x,4.03,-1.7],[x,4.03,1.7],.09,M.steel,root);
box(.2,.15,3.5,M.dark,[0,3.92,0],root,.04);
const scanner=new T.Group();root.add(scanner);box(1.4,.42,.8,M.gold,[0,3.76,0],scanner,.07);perimeter(1.4,.8,4.0,scanner);cyl(.24,.49,M.dark,[0,3.31,0],scanner);cyl(.15,.7,M.steel,[0,2.85,0],scanner);cyl(.26,.12,M.brass,[0,2.47,0],scanner);box(1.05,.1,.61,M.dark,[0,2.36,0],scanner,.035);box(.74,.04,.08,M.green,[0,2.297,0],scanner,.018);
// Ruler, engraved ticks attached to strip, end-stops, knurled feed wheels.
box(.18,.05,3.5,M.brass,[.93,4.16,0],root,.02);for(let i=0;i<29;i++)box(i%5===0?.14:.08,.008,.018,M.dark,[.94,4.191,-1.62+i*.116],root,.002);
for(const z of [-1.87,1.87]){const wheel=cyl(.28,.16,M.brass,[0,4.01,z],root);wheel.rotation.x=Math.PI/2;for(let j=0;j<32;j++){const a=j*Math.PI/16;bar([Math.cos(a)*.276,4.01+Math.sin(a)*.276,z-.08],[Math.cos(a)*.276,4.01+Math.sin(a)*.276,z+.08],.012,M.edge,root)}}
// Dial with recessed ivory face, glass-like ring, ticks and absolute-state needle.
const dial=new T.Group();dial.position.set(1.75,2.85,1.59);root.add(dial);
const caseMesh=cyl(.57,.22,M.brass,[0,0,0],dial);caseMesh.rotation.x=Math.PI/2;const face=cyl(.49,.025,M.white,[0,0,.125],dial);face.rotation.x=Math.PI/2;torus(.5,.045,M.steel,[0,0,.15],dial,[0,0,0]);
for(let j=0;j<=50;j++){const a=(-.78+j/50*1.55)*Math.PI;bar([Math.sin(a)*.41,Math.cos(a)*.41,.145],[Math.sin(a)*(j%5===0?.33:.37),Math.cos(a)*(j%5===0?.33:.37),.145],j%5===0?.011:.006,M.dark,dial)}
const needle=new T.Group();dial.add(needle);bar([0,-.08,.17],[0,.36,.17],.014,M.dark,needle);const pin=cyl(.047,.035,M.gold,[0,0,.17],dial);pin.rotation.x=Math.PI/2;bar([1.75,.58,1.59],[1.75,2.4,1.59],.12,M.dark,root);

// Rear knowledge mechanism: drawers in steel runners, brass skeleton and paper laminations.
const drawers=[];for(const x of [-3.5,-1.9]){box(.15,2.7,1.5,M.brass,[x,1.93,-3.15],root,.035);for(let j=0;j<4;j++)screw(x,3.32,-3.74+j*.39,root,.7)}
box(2.1,.2,1.7,M.brass,[-2.7,3.39,-3.15],root,.055);box(2.1,.2,1.7,M.dark,[-2.7,.65,-3.15],root,.055);
for(let j=0;j<5;j++){const y=.89+j*.47;box(1.65,.08,1.45,M.satin,[-2.7,y-.06,-3.15],root,.02);const d=new T.Group();d.position.set(-2.7,y,-3.15);root.add(d);box(1.46,.1,1.25,M.brass,[0,0,0],d,.03);for(let n=0;n<4;n++)box(1.22,.018,1.04,M.white,[0,.08+n*.022,0],d,.012);box(1.5,.29,.08,M.dark,[0,.12,.65],d,.025);bar([-.24,.13,.76],[.24,.13,.76],.035,M.brass,d);for(const x of [-.31,.31])bar([x,.13,.67],[x,.13,.77],.04,M.steel,d);drawers.push(d)}
// Rear branch verifier: twin glass-window pressure columns, linked valves and tubing.
box(3,.26,1.9,M.dark,[3.4,.6,-3.15],root,.09);box(2.8,.06,1.7,M.brass,[3.4,.77,-3.15],root,.04);
for(const x of [2.65,4.12]){cyl(.39,.22,M.brass,[x,.9,-3.15],root);cyl(.28,1.4,M.dark,[x,1.7,-3.15],root);for(const yy of [1.02,2.35]){cyl(.4,.12,M.gold,[x,yy,-3.15],root);for(let j=0;j<6;j++){const a=j*Math.PI/3;screw(x+Math.cos(a)*.31,yy+.075,-3.15+Math.sin(a)*.31,root,.6)}}box(.23,1.05,.028,M.teal,[x,1.71,-2.86],root,.03);for(let j=0;j<12;j++)box(j%3===0?.16:.08,.015,.015,M.edge,[x,1.22+j*.083,-2.837],root,.003);cyl(.17,.25,M.steel,[x,2.52,-3.15],root);torus(.29,.04,M.brass,[x,2.7,-3.15],root);for(let j=0;j<3;j++){const a=j*Math.PI*2/3;bar([x,2.7,-3.15],[x+Math.cos(a)*.26,2.7,-3.15+Math.sin(a)*.26],.024,M.brass,root)}}
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
box(1.48,.5,4.15,M.brass,[7.2,4.25,0],root,.09);perimeter(1.48,4.15,4.53,(()=>{const g=new T.Group();g.position.x=7.2;root.add(g);return g})());
cyl(.48,.22,M.steel,[7.2,4.6,0],root);cyl(.37,.48,M.dark,[7.2,4.94,0],root);cyl(.44,.12,M.brass,[7.2,5.24,0],root);
const press=new T.Group();root.add(press);cyl(.18,1.3,M.steel,[7.2,3.36,0],press);box(1.6,.3,2.1,M.gold,[7.2,2.65,0],press,.07);box(1.3,.1,1.8,M.dark,[7.2,2.45,0],press,.035);perimeter(1.6,2.1,2.83,(()=>{const g=new T.Group();g.position.x=7.2;press.add(g);return g})());
const springs=[];for(const z of [-1.1,1.1]){bar([7.2,2.8,z],[7.2,4.0,z],.06,M.dark,root);const pts=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2*9;pts.push(new T.Vector3(Math.cos(a)*.15,i/160,Math.sin(a)*.15))}const s=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),160,.027,6,false),M.steel,[7.2,2.84,z],root);springs.push(s)}
for(const z of [-1.2,1.2]){box(.4,.7,.5,M.dark,[9.0,.94,z],root,.04);cyl(.14,.4,M.brass,[9,1.49,z],root)}bar([9,1.68,-1.2],[9,1.68,1.2],.1,M.brass,root);for(let j=0;j<9;j++)box(.03,.05,.085,M.teal,[9,1.78,-1+j*.25],root,.008);
pipe([[7.2,5.27,0],[7.8,5.36,0],[8.15,4.92,-.3],[8.2,2.2,-1.2],[8.2,.9,-1.75]],.065,M.black);
const indicators=[];for(const [x,z] of [[-8.7,-1.1],[1.9,-1.3],[8.6,-1.2]]){cyl(.15,.08,M.brass,[x,.65,z],root);const lamp=cyl(.095,.06,M.green,[x,.72,z],root);indicators.push(lamp)}

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
window.renderAt=t=>{t=Math.max(0,Math.min(18,t));trolley.position.x=carrierX(t);const close=ramp(t,.6,1.35)-ramp(t,2.0,2.65);jaws.forEach((j,i)=>j.position.z=(i===0?-1:1)*(1.25-.23*close));
const scanZ=-1.34+2.68*ramp(t,6.7,8.9);scanner.position.z=scanZ;scanner.position.y=-.22*(ramp(t,7.0,7.5)-ramp(t,9.15,9.6));
drawers.forEach((d,i)=>d.position.z=-3.15+(i===2?.72:0)*(ramp(t,7.9,8.7)-ramp(t,10,11)));
const travel=7.6*ramp(t,3,6.35)+7.2*ramp(t,10,12.9);screwAxis.rotation.x=travel*9;g1.rotation.z=-travel*3;g2.rotation.z=travel*3*.77/.50;
needle.rotation.z=.85-1.6*ramp(t,7.1,8.7)+.45*ramp(t,9.0,9.7);
const down=.49*(ramp(t,13.15,13.85)-ramp(t,14.15,14.8));press.position.y=-down;springs.forEach(s=>{s.position.y=2.84-down;s.scale.y=1+down});
returnShuttle.position.x=8.2-16*ramp(t,15,17.6);const pose=cameraAt(t);camera.position.fromArray(pose.position);camera.lookAt(new T.Vector3(...pose.target));camera.fov=pose.fov;camera.updateProjectionMatrix();renderer.render(scene,camera);return {time:t,carrierX:trolley.position.x,camera:pose,parts,drawcalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};};
window.sceneInfo={parts,three:T.REVISION,width:W,height:H};window.renderAt(0);window.ready=true;
