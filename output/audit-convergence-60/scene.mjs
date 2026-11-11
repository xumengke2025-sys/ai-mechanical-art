import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';
import {box,bar,ring,lathe,ease,lerp,partCount} from './mechanics.mjs';
import {walnutTexture} from './finish-reference.mjs';
import {createLaboratory} from './instruments.mjs';
const params=new URLSearchParams(location.search),W=Number(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#101c24');scene.fog=new T.Fog('#101c24',40,85);const camera=new T.PerspectiveCamera(37,W/H,.05,150);
const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.06).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.46;
scene.add(new T.HemisphereLight(0xc8dce2,0x162127,.70));
const key=new T.DirectionalLight(0xffdfae,3.2);key.position.set(-12,18,8);key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-15,right:15,bottom:-15,top:15,near:1,far:55});key.shadow.bias=-.00010;key.shadow.normalBias=.016;scene.add(key);scene.add(key.target);
const fill=new T.DirectionalLight(0x83c6dd,1.7);fill.position.set(12,6,-8);scene.add(fill);const rim=new T.DirectionalLight(0xffedca,1.8);rim.position.set(-5,8,-12);scene.add(rim);
const std=(c,m=0,r=.5,e={})=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r,...e}),woodTex=walnutTexture();woodTex.repeat.set(1.4,.7);
const M={leather:std('#30251f',0,.86),wood:new T.MeshPhysicalMaterial({color:'#bfac98',map:woodTex,roughness:.3,clearcoat:.38,clearcoatRoughness:.24}),brass:std('#bc914a',.91,.25),edge:std('#e2bc75',.93,.21),steel:std('#a4b9c3',.90,.23),blued:std('#183646',.76,.27),dark:std('#172932',.58,.42),ink:std('#243b40',0,.80),ivory:std('#e4dfcd',.08,.42),paper:std('#dcdccf',0,.73),teal:std('#297777',.48,.28),amber:std('#c48635',.70,.30),glass:new T.MeshPhysicalMaterial({color:'#cceded',roughness:.05,transmission:.94,thickness:.025,ior:1.47,side:T.DoubleSide}),lens:new T.MeshPhysicalMaterial({color:'#90cecc',roughness:.06,transmission:.88,thickness:.08,ior:1.50}),liquid:new T.MeshPhysicalMaterial({color:'#2bbac4',roughness:.13,transmission:.50,thickness:.16,transparent:true,opacity:.85})};
// A real shared desk with generous negative space and an engraved radial plan.
box(scene,23,.40,22,M.wood,[0,-.24,0],.22);box(scene,23.10,.045,22.10,M.edge,[0,-.14,0],.16);box(scene,22.90,.07,21.90,M.wood,[0,-.045,0],.14);
for(const r of [2.91,3.02])ring(scene,r,.010,M.edge,[0,.002,0]);
for(const z of [-10.6,10.6])bar(scene,[-11,.002,z],[11,.002,z],.009,M.edge);for(const x of [-11.1,11.1])bar(scene,[x,.002,-10.5],[x,.002,10.5],.009,M.edge);
for(const x of [-9.5,9.5])for(const z of [-8.6,8.6])lathe(scene,[[.35,0],[.40,.15],[.23,.40],[.20,3.8],[.36,4]],M.wood,[x,-4.45,z]);
box(scene,100,.2,100,std('#142630',.18,.54),[0,-4.6,0]);box(scene,80,30,.3,std('#14212a',.04,.7),[0,7,-17]);
for(const x of [-20,-13,-6,1,8,15,22]){box(scene,.08,12,.06,M.blued,[x,4,-16.75]);box(scene,5.2,.028,.06,M.edge,[x,9.8,-16.7]);}
const lab=createLaboratory(scene,M);
const rt=new T.WebGLRenderTarget(W,H,{samples:4});const composer=new EffectComposer(renderer,rt);const saved=Math.random;let seed=1407;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const ao=new SSAOPass(scene,camera,W/2,H/2);Math.random=saved;ao.kernelRadius=.18;ao.minDistance=.001;ao.maxDistance=.025;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());ao.setSize(W/2,H/2);
const V=a=>new T.Vector3(...a);
function local(i,p){const a=lab.tracks[i].theta;return V([Math.cos(a)*p[0]+Math.sin(a)*p[2],p[1],-Math.sin(a)*p[0]+Math.cos(a)*p[2]]);}
const shots=[
 {a:0,b:3,name:'丝杠与导向',source:0,q:[0,1.13,7.10],o:[1.75,1.65,-1.95],end:[1.55,1.65,-1.80]},
 {a:3,b:7,name:'四路独立来源',q:[0,1,0],o:[16,22,23],end:[14.5,20,21]},
 {a:7,b:12,name:'伴随档案卡',follow:0,o:[2.15,2.8,3.6]},
 {a:12,b:17,name:'问卷滚轮',source:1,q:[0,1.30,8.55],o:[1.95,2.55,3.70],end:[1.65,2.45,3.30]},
 {a:17,b:22,name:'同季度跨级',source:2,q:[-.1,1.20,8.72],o:[.10,3.7,1.7],end:[.20,3.4,1.6]},
 {a:22,b:27,name:'玻璃旁路',source:3,q:[-.10,1.85,8.62],o:[2.1,1.55,3.4],end:[1.8,1.35,3.1]},
 {a:27,b:30,name:'四路启动',q:[0,1.4,0],o:[11,16,17],end:[10,14.5,15]},
 {a:30,b:34,name:'伴随证据汇入',follow:1,o:[-2.2,3.0,3.45]},
 {a:34,b:37.5,name:'光学核对',q:[0,2.4,0],o:[5.4,5.2,6.5],end:[4.7,4.5,5.6]},
 {a:37.5,b:41,name:'待核查结果',q:[0,3.3,1.1],o:[2.3,2.0,5.5],end:[1.6,1.7,5.1]},
 {a:41,b:47,name:'伴随线索送复核',followOut:true,o:[2.25,2.7,3.2]},
 {a:47,b:50,name:'人工操作闸',q:[-1,2.45,6.6],o:[-2.6,1.7,4.0],end:[-2.2,1.5,3.5]},
 {a:50,b:54,name:'曲柄连杆压印',q:[0,2.60,6.5],o:[2.3,1.55,6.4],end:[2.1,1.50,6.2]},
 {a:54,b:60,name:'全局收束',reveal:true}
];
function poseAt(t){const s=shots.find(x=>t>=x.a&&t<x.b)||shots.at(-1),u=ease((t-s.a)/(s.b-s.a));let q,p;
 if(s.follow!==undefined){q=lab.carrierAt(s.follow,t);const o=local(s.follow,s.o);p=q.clone().add(o);}
 else if(s.followOut){q=lab.outputAt(t);p=q.clone().add(V(s.o));}
 else if(s.reveal){q=V([0,2.1,6.5]).lerp(V([0,1,0]),ease(Math.min(1,u*1.7)));p=V([2,5.5,12]).lerp(V([17.5,24,27]),ease(Math.min(1,u*1.7)));}
 else{q=s.source!==undefined?local(s.source,s.q):V(s.q);let o=V(s.o).lerp(V(s.end||s.o),u);p=q.clone().add(s.source!==undefined?local(s.source,o.toArray()):o);}
 return {s,p,q};}
window.renderAt=seconds=>{let t=Math.max(0,Math.min(59.999,seconds));const mechanism=lab.update(t),pose=poseAt(t);camera.position.copy(pose.p);camera.lookAt(pose.q);camera.updateProjectionMatrix();scene.updateMatrixWorld(true);composer.render();return {t,shot:pose.s.name,camera:pose.p.toArray(),target:pose.q.toArray(),mechanism};};
window.captureJPEG=t=>{window.renderAt(t);return renderer.domElement.toDataURL('image/jpeg',.96).split(',')[1];};
await document.fonts.ready;window.sceneInfo={parts:partCount(),three:T.REVISION,width:W,height:H,duration:60,shots:shots.length,route:'four radial sources to central optical inspection to human review'};window.renderAt(0);window.ready=true;
