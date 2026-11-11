import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {EffectComposer} from './vendor/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/postprocessing/OutputPass.js';
import {group,mesh,box,cyl,bar,ring,lathe,post,gear,ease,ramp,lerp,partCount} from './mechanics.mjs';
import {walnutTexture} from './finish-reference.mjs';
import {createLaboratory,matrixAt} from './instruments.mjs';
import {chapterAt,film} from './timeline.mjs';

const params=new URLSearchParams(location.search),W=Number(params.get('w')||1920),H=Math.round(W*9/16);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.83;renderer.outputColorSpace=T.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#b8b2a4');scene.fog=new T.Fog('#b8b2a4',60,120);
const camera=new T.PerspectiveCamera(36,W/H,.08,180);
const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.045).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.78;
scene.add(new T.HemisphereLight(0xf9f0de,0x666a66,.65));
const key=new T.DirectionalLight(0xfff0d8,3.1);key.position.set(-13,24,10);key.castShadow=true;key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-20,right:20,bottom:-17,top:17,near:1,far:70});key.shadow.bias=-.00008;key.shadow.normalBias=.018;key.shadow.radius=3;scene.add(key);scene.add(key.target);
const fill=new T.DirectionalLight(0xdce9f2,.75);fill.position.set(18,9,2);scene.add(fill);const rim=new T.DirectionalLight(0xfff2d4,1.4);rim.position.set(-3,13,-15);scene.add(rim);
const std=(color,metalness=0,roughness=.5,extra={})=>new T.MeshStandardMaterial({color,metalness,roughness,...extra});
const woodTex=walnutTexture();woodTex.repeat.set(1.3,.6);
const M={
 wood:new T.MeshPhysicalMaterial({color:'#ead4b7',map:woodTex,roughness:.30,metalness:.02,clearcoat:.30,clearcoatRoughness:.24}),
 brass:std('#d9bf84',.88,.28),edge:std('#e9d5a6',.92,.23),steel:std('#a4b2b5',.86,.29),blued:std('#263f4a',.72,.30),dark:std('#253532',.40,.45),ink:std('#243330',0,.88),paper:std('#e8dfca',0,.85),ivory:std('#ede5d2',.02,.39),amber:std('#d1b573',.08,.49),rose:std('#b77d6b',.06,.49),red:std('#a8614f',.08,.45),sage:std('#6d8572',.06,.55),
 glass:new T.MeshPhysicalMaterial({color:'#f0f5ee',roughness:.085,metalness:0,transmission:1,thickness:.035,ior:1.47,envMapIntensity:.65,side:T.DoubleSide,depthWrite:true}),
 lens:new T.MeshPhysicalMaterial({color:'#c5ded9',roughness:.04,transmission:.94,thickness:.10,ior:1.50,metalness:0}),
 liquid:new T.MeshPhysicalMaterial({color:'#b6c7ac',roughness:.12,transmission:.64,thickness:.2,ior:1.33,transparent:true,opacity:.82}),
 clearLiquid:new T.MeshPhysicalMaterial({color:'#cee1d8',roughness:.10,transmission:.80,thickness:.20,ior:1.33,transparent:true,opacity:.72}),
 amberLiquid:new T.MeshPhysicalMaterial({color:'#9a6436',roughness:.13,transmission:.38,thickness:.18,ior:1.33,transparent:true,opacity:.86})
};
// Quiet architectural setting, with real depth and window shadows.
const wall=std('#a9aaa0',0,.92),trim=std('#c9c7b8',0,.78),stone=std('#c3bdac',0,.85),black=std('#364443',.05,.7);
box(scene,100,.20,80,stone,[0,-5.25,0],.04);box(scene,80,24,.3,wall,[0,6.6,-18]);
for(const x of [-22,-12,-2,8,18]){box(scene,6.3,10,.09,trim,[x,5.2,-17.8]);box(scene,5.8,9.5,.10,std('#a6b4b4',.05,.60),[x,5.2,-17.72]);for(const dx of [-2,0,2])bar(scene,[x+dx,.5,-17.58],[x+dx,9.9,-17.58],.035,black);for(const y of [3.6,6.8])bar(scene,[x-2.8,y,-17.58],[x+2.8,y,-17.58],.035,black);}
box(scene,80,.15,.35,trim,[0,11.4,-17.5]);box(scene,80,1.1,.2,black,[0,-2.9,-17.6]);
// Table has thin stepped edges, inset strips and turned supports.
box(scene,28,.36,20,M.wood,[0,-.2,0],.26);box(scene,28.08,.055,20.08,M.edge,[0,-.14,0],.20);box(scene,27.86,.065,19.86,M.wood,[0,-.07,0],.18);
for(const z of [-9.55,9.55])bar(scene,[-13.4,-.027,z],[13.4,-.027,z],.009,M.edge);for(const x of [-13.55,13.55])bar(scene,[x,-.027,-9.4],[x,-.027,9.4],.009,M.edge);
for(const x of [-11.7,11.7])for(const z of [-7.6,7.6]){lathe(scene,[[.45,0],[.47,.12],[.31,.28],[.24,1.0],[.28,3.3],[.43,3.65],[.43,4.2]],M.wood,[x,-4.8,z]);for(const y of [-4.65,-1.1])ring(scene,.43,.025,M.brass,[x,y,z]);}
for(const z of [-8.3,8.3])box(scene,24,.9,.25,M.wood,[0,-.85,z],.10);
const lab=createLaboratory(scene,M);
lab.plate(scene,['从异常到证据'],[0,-.76,10.10],8.8,.55,{bg:'#d9cba8'});

const targetRT=new T.WebGLRenderTarget(W,H,{samples:4});const composer=new EffectComposer(renderer,targetRT);
const savedRandom=Math.random;let rng=1407;Math.random=()=>((rng=(1664525*rng+1013904223)>>>0)/4294967296);const ao=new SSAOPass(scene,camera,W/2,H/2);Math.random=savedRandom;
ao.kernelRadius=.24;ao.minDistance=.001;ao.maxDistance=.035;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());ao.setSize(W/2,H/2);

const shots=[
 {a:0,b:4,q:[-2,1.7,-4.1],o:[5.6,4.7,7.2],end:[5.2,4.4,6.7],name:'光学仪器建立'},
 {a:4,b:11,q:[-4.83,2.1,-4.30],o:[.4,1.6,4.2],end:[.8,1.7,4.0],name:'季度跨级量尺'},
 {a:11,b:15,q:[-2,1.15,-2.25],o:[1.3,3.6,4.2],end:[1.5,3.7,4.5],name:'同一证据匣'},
 {a:15,b:20,follow:true,o:[2.0,4.3,5.6],name:'伴随资料接入'},
 {a:20,b:27,q:[-9,1.25,3.0],o:[2.5,5.1,6.5],end:[2.0,4.8,6],name:'四类数据对齐'},
 {a:27,b:35,q:[-9,.95,3.6],o:[.6,4.2,3.8],end:[.85,4.0,3.4],name:'来源索引与待补证'},
 {a:35,b:39,follow:true,o:[-1.8,4.5,5.5],name:'伴随规则入口'},
 {a:39,b:45,q:[-9,1.1,-3.5],o:[1.6,4.4,5.0],end:[1.3,4.1,4.7],name:'业务语言与规则草稿'},
 {a:45,b:51,q:[-8.4,1.7,-4.3],o:[1.5,2.7,4.0],end:[1.8,2.4,3.8],name:'审核钥匙与版本绑定'},
 {a:51,b:55,q:[-7.6,2.25,-4.6],o:[.5,1.4,3.4],end:[.6,1.5,3.5],name:'月度调度刻度'},
 {a:55,b:59,follow:true,o:[1.3,4.2,5.8],name:'返回比对仪'},
 {a:59,b:65,q:[-2,2,-4.2],o:[4.0,3.7,5.4],end:[3.5,3.4,5.0],name:'镜筒与丝杠进给'},
 {a:65,b:72,q:[-.85,.87,-4.0],o:[.65,4.3,3.2],end:[.5,4.15,3.0],name:'三字段探针'},
 {a:72,b:79,q:[-4.83,2.1,-4.30],o:[.65,1.7,4.15],end:[.8,1.8,4.1],name:'跨级初筛'},
 {a:79,b:82,q:[-2,1.6,-4.2],o:[4.2,5.0,6.4],end:[4.4,5.1,6.6],name:'两类疑点归入卷宗'},
 {a:82,b:89,q:[3,2.5,-6.2],o:[2.7,2.4,4.0],end:[2.4,2.1,3.8],name:'玻璃旋塞与液滴'},
 {a:89,b:94,q:[7,.85,-1.4],o:[.3,6.8,4.8],end:[.4,6.6,4.6],name:'证据矩阵建立'},
 {a:94,b:100,q:[6.5,.9,-1.9],o:[-1.4,5.7,4.6],end:[-1.2,5.5,4.4],name:'单项特征一般关注'},
 {a:100,b:108,q:[7.4,.9,-1.9],o:[1.2,5.8,4.8],end:[1,5.6,4.5],name:'交易佐证改变关注程度'},
 {a:108,b:115,q:[7,.85,-1.5],o:[0,7.6,3.5],end:[.25,7.4,3.8],name:'四种证据组合'},
 {a:115,b:121,follow:true,o:[2.5,4.8,6.0],name:'沿归属索引前进'},
 {a:121,b:127,q:[8,1.6,5.7],o:[-2.8,3.7,6.0],end:[-2.5,3.5,5.8],name:'客户记录归集'},
 {a:127,b:134,q:[8,3.2,5.7],o:[2.0,2.6,5.4],end:[1.7,2.5,5.0],name:'经理与营业部穿透'},
 {a:134,b:140,q:[8,.65,6.25],o:[.3,4.5,4.4],end:[.4,4.4,4.2],name:'机构阈值与客户去重'},
 {a:140,b:146,follow:true,o:[-.8,4.4,5.8],name:'向人工复核交接'},
 {a:146,b:153,q:[1,1.0,7.0],o:[-2.0,3.7,4.8],end:[-1.7,3.5,4.6],name:'人工取证依据'},
 {a:153,b:158,q:[1,2.1,6.2],o:[-1.4,2.7,5.0],end:[-1.1,2.5,4.8],name:'人工闸与分工'},
 {a:158,b:165,q:[2.0,1.25,6.9],o:[1.6,3.4,4.6],end:[1.4,3.3,4.4],name:'复核记录压印'},
 {a:165,b:173,follow:true,o:[-1.4,4.3,6.0],name:'反馈匣回流'},
 {a:173,b:180,reveal:true,name:'完整审计实验室'}
];
function poseAt(t){
 const s=shots.find(s=>t>=s.a&&t<s.b)||shots.at(-1),u=ease((t-s.a)/(s.b-s.a));let q,p;
 if(s.follow){const h=lab.specimenAt(t),next=lab.specimenAt(Math.min(179.99,t+.35));q=h.p.clone().lerp(next.p,.25).add(new T.Vector3(0,.25,0));p=h.p.clone().add(new T.Vector3(...s.o));}
 else if(s.reveal){const a=lab.specimenAt(173).p,b=new T.Vector3(0,1.15,0);q=a.clone().lerp(b,u);p=a.clone().add(new T.Vector3(-1.4,4.3,6)).lerp(new T.Vector3(26,27,34),u);}
 else{q=new T.Vector3(...s.q);p=q.clone().add(new T.Vector3(...s.o).lerp(new T.Vector3(...(s.end||s.o)),u));}
 return {s,p,q,fov:s.reveal?38:36};
}
function stateAt(t){return {t,chapter:chapterAt(t).title,shot:poseAt(t).s.name,matrix:matrixAt(t),humanFinalDecision:'人工审核确认',cycle:'月度',demo:true};}
window.renderAt=seconds=>{
 const t=Math.max(0,Math.min(179.999,seconds));lab.update(t);const pose=poseAt(t);camera.position.copy(pose.p);camera.lookAt(pose.q);camera.fov=pose.fov;camera.updateProjectionMatrix();scene.updateMatrixWorld(true);composer.render();return {...stateAt(t),camera:pose.p.toArray(),target:pose.q.toArray(),specimen:lab.specimen.position.toArray()};
};
window.captureJPEG=t=>{window.renderAt(t);return renderer.domElement.toDataURL('image/jpeg',.96).split(',')[1];};
await document.fonts.ready;window.sceneInfo={parts:partCount(),three:T.REVISION,width:W,height:H,duration:180,shots:shots.length};window.renderAt(0);window.ready=true;
