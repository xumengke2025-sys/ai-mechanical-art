import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';
import {box,bar,ring,lathe,ease,lerp,partCount,ramp} from './mechanics.mjs';
import {walnutTexture} from './finish-reference.mjs';
import {createLaboratory} from './instruments.mjs';
const params=new URLSearchParams(location.search),W=Number(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#101c24');scene.fog=new T.Fog('#101c24',48,100);const camera=new T.PerspectiveCamera(37,W/H,.05,180);
const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.06).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.46;
scene.add(new T.HemisphereLight(0xc8dce2,0x162127,.70));
const key=new T.DirectionalLight(0xffdfae,3.2);key.position.set(-12,22,10);key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-24,right:24,bottom:-12,top:12,near:1,far:75});key.shadow.bias=-.00010;key.shadow.normalBias=.016;scene.add(key);scene.add(key.target);
const fill=new T.DirectionalLight(0x83c6dd,1.7);fill.position.set(12,6,-8);scene.add(fill);const rim=new T.DirectionalLight(0xffedca,1.8);rim.position.set(-5,8,-12);scene.add(rim);
const std=(c,m=0,r=.5,e={})=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r,...e}),woodTex=walnutTexture();woodTex.repeat.set(2.7,.7);
const M={leather:std('#30251f',0,.86),wood:new T.MeshPhysicalMaterial({color:'#bfac98',map:woodTex,roughness:.3,clearcoat:.38,clearcoatRoughness:.24}),brass:std('#bc914a',.91,.25),edge:std('#e2bc75',.93,.21),steel:std('#a4b9c3',.90,.23),blued:std('#183646',.76,.27),dark:std('#172932',.58,.42),ink:std('#243b40',0,.80),ivory:std('#e4dfcd',.08,.42),paper:std('#dcdccf',0,.73),teal:std('#297777',.48,.28),amber:std('#c48635',.70,.30),glass:new T.MeshPhysicalMaterial({color:'#cceded',roughness:.05,transmission:.94,thickness:.025,ior:1.47,side:T.DoubleSide}),lens:new T.MeshPhysicalMaterial({color:'#90cecc',roughness:.06,transmission:.88,thickness:.08,ior:1.50}),liquid:new T.MeshPhysicalMaterial({color:'#2bbac4',roughness:.13,transmission:.50,thickness:.16,transparent:true,opacity:.85})};
box(scene,35.6,.40,10.5,M.wood,[.5,-.24,-.70],.22);box(scene,35.7,.045,10.6,M.edge,[.5,-.14,-.70],.16);box(scene,35.5,.07,10.4,M.wood,[.5,-.045,-.70],.14);
for(const z of [-5.60,4.2])bar(scene,[-16.9,.002,z],[17.9,.002,z],.009,M.edge);for(const x of [-16.95,17.95])bar(scene,[x,.002,-5.5],[x,.002,4.1],.009,M.edge);
for(const x of [-15.5,-5,5,16.5])for(const z of [-4.4,3.0])lathe(scene,[[.35,0],[.40,.15],[.23,.40],[.20,3.8],[.36,4]],M.wood,[x,-4.45,z]);
box(scene,120,.2,100,std('#142630',.18,.54),[0,-4.6,0]);box(scene,100,30,.3,std('#14212a',.04,.7),[0,7,-12]);
for(const x of [-26,-20,-14,-8,-2,4,10,16,22,28]){box(scene,.08,12,.06,M.blued,[x,4,-11.75]);box(scene,5.2,.028,.06,M.edge,[x,9.8,-11.7]);}
const lab=createLaboratory(scene,M);
const rt=new T.WebGLRenderTarget(W,H,{samples:4});const composer=new EffectComposer(renderer,rt);const saved=Math.random;let seed=1407;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const ao=new SSAOPass(scene,camera,W/2,H/2);Math.random=saved;ao.kernelRadius=.18;ao.minDistance=.001;ao.maxDistance=.025;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());ao.setSize(W/2,H/2);
const V=a=>new T.Vector3(...a);
const shots=[
 {a:0,b:3,name:'同一位客户',q:[-12.8,1.85,0],o:[1.65,1.75,3.5],end:[1.40,1.65,3.2]},
 {a:3,b:11.5,name:'同季度两次测评',q:[-12,2.20,-.90],o:[.3,2.6,7.0],end:[.2,2.5,6.8]},
 {a:11.5,b:14,name:'跨级线索送资料比对',follow:true},
 {a:14,b:19.5,name:'同字段对齐',q:[-7,2.30,-.95],o:[.18,2.5,7.0],end:[.10,2.4,6.8]},
 {a:19.5,b:22,name:'带着差异查交易',follow:true},
 {a:22,b:29.5,name:'先变更后交易',q:[-2,2.25,-.95],o:[.50,2.5,7.0],end:[.3,2.4,6.8]},
 {a:29.5,b:32,name:'动因交接',follow:true},
 {a:32,b:39.4,name:'区分不同解释',q:[3,2.25,-.95],o:[.25,2.5,7.0],end:[.12,2.4,6.8]},
 {a:39.4,b:41.5,name:'线索归集',follow:true},
 {a:41.5,b:47.4,name:'三层核查对象',q:[8,2.25,-.95],o:[.30,2.5,7.0],end:[.2,2.4,6.8]},
 {a:47.4,b:49.6,name:'案件送人工复核',follow:true},
 {a:49.6,b:54,name:'人工复核曲柄接触',q:[13,2.40,.05],o:[2.5,3.9,6.20],end:[2.3,3.8,6.0]},
 {a:54,b:56,name:'核查结果与反馈',q:[13,2.15,-1.20],o:[.6,2.7,6.5]},
 {a:56,b:60,name:'完整路径与反馈',reveal:true}
];
function poseAt(t){const s=shots.find(x=>t>=x.a&&t<x.b)||shots.at(-1),u=ease((t-s.a)/(s.b-s.a));let q,p;
 if(s.follow){q=lab.carrierAt(t).add(V([.30,.70,-.85]));p=q.clone().add(V([1.30,3.0,6.1]));}
 else if(s.reveal){const k=ramp(t,56,59.2);q=V([13,2.1,-1.20]).lerp(V([.5,1.20,-.70]),k);p=V([13.6,4.85,5.3]).lerp(V([8,19.5,28]),k);}
 else {q=V(s.q);p=q.clone().add(V(s.o).lerp(V(s.end||s.o),u));}
 return {s,p,q};}
window.renderAt=seconds=>{const t=Math.max(0,Math.min(59.999,seconds)),mechanism=lab.update(t),pose=poseAt(t);camera.position.copy(pose.p);camera.lookAt(pose.q);camera.updateProjectionMatrix();scene.updateMatrixWorld(true);composer.render();const caseProjection=lab.carrierAt(t).project(camera);return {t,shot:pose.s.name,camera:pose.p.toArray(),target:pose.q.toArray(),caseScreen:caseProjection.toArray(),mechanism};};
window.captureJPEG=t=>{window.renderAt(t);return renderer.domElement.toDataURL('image/jpeg',.96).split(',')[1];};
await document.fonts.ready;window.sceneInfo={parts:partCount(),three:T.REVISION,width:W,height:H,duration:60,shots:shots.length,route:'one case on a continuous rail: detect,compare,motive,distinguish,attribute,human review'};window.renderAt(0);window.ready=true;
