import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';
import {box,bar,ring,cyl,lathe,ramp,lerp,partCount} from './mechanics.mjs';
import {walnutTexture} from './finish-reference.mjs';
import {createLaboratory} from './instruments.mjs';

const params=new URLSearchParams(location.search),W=Number(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
renderer.localClippingEnabled=true;
const scene=new T.Scene();scene.background=new T.Color('#18252b');scene.fog=new T.Fog('#18252b',20,60);
const camera=new T.PerspectiveCamera(38,W/H,.07,150);
const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.08).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.52;
scene.add(new T.HemisphereLight(0xd8e2df,0x1b2427,.75));
const key=new T.DirectionalLight(0xffe1b8,3.15);key.position.set(-9,16,10);key.castShadow=true;key.shadow.mapSize.set(3072,3072);Object.assign(key.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:1,far:45});key.shadow.bias=-.00012;key.shadow.normalBias=.013;scene.add(key);scene.add(key.target);
const fill=new T.DirectionalLight(0x9bcbd9,1.45);fill.position.set(9,8,-6);scene.add(fill);const rim=new T.DirectionalLight(0xffecd1,1.8);rim.position.set(-5,7,-9);scene.add(rim);
const std=(color,metalness=0,roughness=.5,e={})=>new T.MeshStandardMaterial({color,metalness,roughness,...e});
const woodTex=walnutTexture();woodTex.repeat.set(2.2,1.4);
const M={leather:std('#142327',0,.88),wood:new T.MeshPhysicalMaterial({color:'#684b36',map:woodTex,roughness:.36,clearcoat:.28,clearcoatRoughness:.30}),brass:std('#b3975c',.89,.30),edge:std('#d8be82',.90,.24),steel:std('#93aab3',.87,.27),blued:std('#17343e',.72,.31),dark:std('#172a32',.50,.44),ink:std('#2e4245',0,.82),ivory:std('#dedac9',.04,.47),paper:std('#e0ded2',0,.77),teal:std('#257975',.44,.30),amber:std('#b88039',.70,.32),glass:new T.MeshPhysicalMaterial({color:'#d3e9e8',roughness:.065,transmission:.94,thickness:.025,ior:1.47,side:T.DoubleSide}),lens:new T.MeshPhysicalMaterial({color:'#9acfc9',roughness:.07,transmission:.86,thickness:.06,ior:1.50}),liquid:new T.MeshPhysicalMaterial({color:'#319f9c',roughness:.14,transmission:.55,thickness:.10,transparent:true,opacity:.85})};
// A thin oval cabinet, inlaid working surface and tapered feet, rather than one long conveyor table.
for(const [ry,y,xs,zs,mat] of [[.23,-.23,7.35,5.55,M.wood],[.035,-.092,7.39,5.59,M.edge],[.15,0,7.30,5.50,M.wood],[.035,.09,7.08,5.27,M.leather]]){const d=cyl(scene,1,ry,mat,[0,y,0],1,128);d.scale.set(xs,1,zs);}
const inlay=ring(scene,1,.004,M.edge,[0,.115,0]);inlay.scale.set(6.98,5.16,1);
for(const x of [-4.5,4.5])for(const z of [-3.2,3.2])lathe(scene,[[.16,0],[.21,.09],[.13,.25],[.105,2.6],[.17,2.75]],M.wood,[x,-3,z]);
box(scene,500,.2,500,std('#050b0e',0,.92),[0,-3.22,0]);
const lab=createLaboratory(scene,M);
const rt=new T.WebGLRenderTarget(W,H,{samples:4}),composer=new EffectComposer(renderer,rt);
const saved=Math.random;let seed=1407;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const ao=new SSAOPass(scene,camera,W/2,H/2);Math.random=saved;ao.kernelRadius=.16;ao.minDistance=.001;ao.maxDistance=.023;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());ao.setSize(W/2,H/2);
const V=a=>new T.Vector3(...a);
// Distinct viewpoints connected by motivated dolly/jib moves in the same world.
const KEYS=[
 {t:0,p:[-10,9.0,14.0],q:[0,1.35,0],f:39,n:'庭院整体与开场问题'},
 {t:1.9,p:[-9.6,8.7,13.6],q:[0,1.35,0],f:39},
 {t:3.25,p:[-5.9,4.45,8.2],q:[-4.35,2.06,.88],f:37,n:'低位量仪近景'},
 {t:6.65,p:[-5.55,4.35,7.9],q:[-4.35,2.07,.88],f:37},
 {t:8.70,p:[-5.0,6.4,2.8],q:[-3.1,2.75,-3.05],f:39,n:'伴随爬升与斜俯比对'},
 {t:11.80,p:[-3.35,6.2,2.7],q:[-2.55,2.85,-3.0],f:39},
 {t:13.40,p:[5.25,5.0,3.1],q:[3.3,2.85,-3.25],f:37,n:'双透镜侧向近景'},
 {t:16.80,p:[5.80,4.70,2.9],q:[3.3,2.88,-3.2],f:37},
 {t:18.05,p:[2.0,5.0,5.2],q:[0,2.36,.3],f:38,n:'中央三环高位归集'},
 {t:20.70,p:[1.7,5.0,5.3],q:[0,2.36,.3],f:38},
 {t:22.70,p:[7.6,4.65,8.5],q:[4.35,2.30,1.95],f:37,n:'伴随下坡与压印接触'},
 {t:25.95,p:[7.3,4.55,8.15],q:[4.35,2.30,1.95],f:37},
 {t:28.65,p:[11.5,10.8,16.8],q:[0,1.35,.1],f:39,n:'反馈与全景兑现'},
 {t:30,p:[11.5,10.8,16.8],q:[0,1.35,.1],f:39}
];
function poseAt(t){let i=0;while(i<KEYS.length-2&&t>KEYS[i+1].t)i++;const a=KEYS[i],b=KEYS[i+1],k=ramp(t,a.t,b.t);let name='';for(let j=0;j<=i;j++)if(KEYS[j].n)name=KEYS[j].n;return {p:V(a.p).lerp(V(b.p),k),q:V(a.q).lerp(V(b.q),k),f:lerp(a.f,b.f,k),name};}
// Text is authored in the video frame, with sparse typography and no interface chrome.
const overlay=document.createElement('div');overlay.style.cssText=`position:fixed;inset:0;pointer-events:none;color:#e8e5d6;font-family:'Microsoft YaHei',sans-serif;`;
overlay.innerHTML=`<div id="opening" style="position:absolute;left:5.4%;top:7.5%;"><div style="font-size:${W*.030}px;font-weight:400;letter-spacing:${W*.003}px;">AI 非现场审计</div><div style="font-size:${W*.016}px;margin-top:${H*.022}px;letter-spacing:2px;color:#d1d5ca;">一次测评跨级，如何核查？</div><div style="width:${W*.067}px;height:1px;background:#c9ae72;margin-top:${H*.025}px;"></div></div><div id="ending" style="position:absolute;left:0;right:0;top:7.8%;text-align:center;"><div style="font-size:${W*.025}px;letter-spacing:5px;">AI 串起证据，人工作出确认</div><div style="font-size:${W*.012}px;margin-top:16px;color:#c0c9c3;letter-spacing:3px;">审计非现场智能监测 · 建设方案</div></div>`;
document.body.appendChild(overlay);const opening=overlay.querySelector('#opening'),ending=overlay.querySelector('#ending');
function setState(t){
 const mechanism=lab.update(t),pose=poseAt(t);camera.position.copy(pose.p);camera.lookAt(pose.q);camera.fov=pose.f;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 opening.style.opacity=String(ramp(t,0,.35)*(1-ramp(t,2.25,2.85)));ending.style.opacity=String(ramp(t,27.4,28.15));
 return {t,shot:pose.name,camera:pose.p.toArray(),target:pose.q.toArray(),fov:pose.f,caseScreen:lab.carrierAt(t).project(camera).toArray(),mechanism};
}
window.renderAt=seconds=>{const t=Math.max(0,Math.min(29.999999,seconds)),state=setState(t);composer.render();return state;};
// Use page screenshots for output, including the native title overlay.
window.captureJPEG=undefined;
window.motionStateAt=seconds=>{const t=Math.max(0,Math.min(30,seconds)),state=setState(t);let hidden=0;scene.traverse(o=>{if(!o.visible)hidden++;});return {...state,hidden};};
window.layoutAt=t=>{setState(t);return lab.labels.map(l=>{const ps=[];for(const x of [-l.w/2,l.w/2])for(const y of [-l.h/2,l.h/2])ps.push(l.object.localToWorld(V([x,y,.055])).project(camera).toArray());return {text:l.text,ndc:ps};});};
await document.fonts.ready;window.sceneInfo={parts:partCount(),three:T.REVISION,width:W,height:H,duration:30,shots:7,route:'layered horseshoe courtyard; four instruments and central armillary; seven connected viewpoints'};window.renderAt(0);window.ready=true;
