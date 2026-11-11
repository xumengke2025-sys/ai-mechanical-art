import * as T from 'three';
import {TAU,group,mesh,box,cyl,sphere,ring,bar,curve,lathe,screw,post,bearing,gear,wheel,ease,ramp,lerp} from './mechanics.mjs';

export function createLaboratory(scene,M){
 const updates=[];const actors={};
 const loc={data:[-9,0,3],rule:[-9,0,-4],compare:[-2,0,-4.5],chem:[3,0,-6.5],matrix:[7,0,-1.5],archive:[8,0,5],human:[1,0,6]};
 function label(parent,lines,p,w=2,h=.55,{flat=false,bg='#e9e0ca',color='#282b29',sizes=[],angle=0,border=true}={}){
  const c=document.createElement('canvas');c.width=1536;c.height=Math.max(180,Math.round(1536*h/w));const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);}
  if(border){x.strokeStyle='#a79572';x.lineWidth=2;x.strokeRect(14,14,c.width-28,c.height-28);}
  const margin=.14*c.height,dy=(c.height-2*margin)/lines.length;x.textAlign='center';x.textBaseline='middle';
  lines.forEach((s,i)=>{let sz=sizes[i]||Math.min(dy*.69,1536/Math.max(4,[...s].length)*.84);x.font=`500 ${sz}px "Microsoft YaHei",sans-serif`;x.fillStyle=color;x.fillText(s,768,margin+dy*(i+.5));});
  const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=16;
  const q=group(parent,p);if(flat)q.rotation.x=-Math.PI/2;q.rotation.z=angle;
  const face=mesh(q,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,toneMapped:false,transparent:!bg,depthWrite:!!bg,polygonOffset:true,polygonOffsetFactor:-1}),[0,0,.005],false);face.receiveShadow=false;return q;
 }
 function plate(g,lines,p,w,h,opt={}){box(g,w+.1,h+.10,.045,M.brass,p,.035);const q=label(g,lines,[p[0],p[1],p[2]+.027],w,h,opt);for(const x of [-w/2+.05,w/2-.05])sphere(g,.018,M.steel,[p[0]+x,p[1],p[2]+.038]);return q;}
 function folio(g,lines,p,w=2,h=2.3){const q=group(g,p);box(q,w,.025,h,M.paper,[0,0,0],.015);label(q,lines,[0,.016,0],w*.95,h*.94,{flat:true,border:false});for(const z of [-h*.46,h*.46])box(q,w*.35,.018,.06,M.brass,[0,.032,z]);return q;}
 function pedestal(g,w,d,title){box(g,w,.25,d,M.wood,[0,.20,0],.16);box(g,w-.06,.045,d-.06,M.edge,[0,.345,0],.12);box(g,w-.18,.065,d-.18,M.wood,[0,.40,0],.12);for(const x of [-w/2+.3,w/2-.3])for(const z of [-d/2+.3,d/2-.3]){cyl(g,.17,.13,M.dark,[x,.045,z]);ring(g,.14,.018,M.edge,[x,.115,z]);screw(g,[x,.445,z],M,.8);}plate(g,[title],[0,.24,d/2+.027],w*.70,.22,{bg:'#dfd0aa'});}
 function knob(g,p,r=.22){const q=group(g,p);const b=cyl(q,r,.14,M.brass);b.rotation.x=Math.PI/2;for(let i=0;i<48;i++){const a=i/48*TAU;bar(q,[Math.cos(a)*r,Math.sin(a)*r,-.05],[Math.cos(a)*r,Math.sin(a)*r,.05],.005,M.edge);}const cap=cyl(q,r*.68,.025,M.blued,[0,0,.085]);cap.rotation.x=Math.PI/2;ring(q,r*.84,.008,M.edge,[0,0,.078],[0,0,0]);return q;}
 function thread(g,a,b,r=.065,turns=36){bar(g,a,b,r*.8,M.steel);const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),q=group(g,a);q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());const pts=[];for(let i=0;i<=turns*10;i++){const t=i/(turns*10),z=t*TAU*turns;pts.push([Math.cos(z)*r,t*v.length(),Math.sin(z)*r]);}curve(q,pts,.009,M.edge,turns*10);return q;}
 function shaft(g,a,b,r=.06){bar(g,a,b,r,M.steel);for(const p of [a,b]){const q=group(g,p);box(q,.36,.22,.30,M.dark,[0,-.11,0]);const d=cyl(q,r*1.9,.10,M.brass,[0,0,.05]);d.rotation.x=Math.PI/2;for(const x of [-.12,.12])screw(q,[x,.012,0],M,.6);}}
 function gauge(g,p,r,text,value=''){const q=group(g,p),body=cyl(q,r,.14,M.brass);body.rotation.x=Math.PI/2;
  mesh(q,new T.CircleGeometry(r*.89,96),M.ivory,[0,0,.08]);ring(q,r*.94,.025,M.edge,[0,0,.09],[0,0,0]);
  for(let i=0;i<51;i++){const a=(-.76+i/50*1.52)*Math.PI;bar(q,[Math.sin(a)*r*(i%5?.78:.71),Math.cos(a)*r*(i%5?.78:.71),.094],[Math.sin(a)*r*.84,Math.cos(a)*r*.84,.094],i%5?.003:.006,M.ink);}
  label(q,[text,value],[0,-r*.39,.10],r*1.42,r*.38,{border:false,bg:'#ece4cf'});const n=group(q,[0,0,.12]);bar(n,[0,-r*.14,0],[0,r*.69,0],.009,M.blued);sphere(q,.038,M.brass,[0,0,.135]);return {q,n};}
 function roller(g,p,width=.9,r=.13){const q=group(g,p),b=cyl(q,r,width,M.brass);b.rotation.z=Math.PI/2;for(const x of [-width/2,width/2]){const a=cyl(q,r*1.3,.07,M.dark,[x,0,0]);a.rotation.z=Math.PI/2;}return q;}
 function flask(g,p,r=.4,h=1.4,liquid=M.liquid){const q=group(g,p);const prof=[[.0,0],[r*.7,0],[r,.10],[r,h*.45],[r*.7,h*.62],[r*.27,h*.76],[r*.27,h],[r*.22,h],[r*.22,h*.76],[r*.64,h*.61],[r*.94,h*.44],[r*.94,.12],[r*.65,.06],[0,.06]];lathe(q,prof,M.glass);cyl(q,r*.91,h*.27,liquid,[0,h*.23,0],r*.91,64);ring(q,r*.26,.025,M.glass,[0,h,0]);return q;}
 function glassTube(g,p,r=.14,h=3){const q=group(g,p);lathe(q,[[r,0],[r,h],[r-.017,h],[r-.017,0]],M.glass);for(const y of [.12,h-.12])ring(q,r+.008,.018,M.brass,[0,y,0]);
  for(let i=0;i<=30;i++){const yy=.25+i*(h-.50)/30;bar(q,[-r*.9,yy,r*.75],[-r*(i%5?.55:.15),yy,r*.97],.003,M.ink);if(i%10===0)label(q,[String(30-i)],[r*.65,yy,r*.86],.12,.10,{border:false,bg:'#e6e7dc'});}
  const fluid=cyl(q,r-.025,h*.58,M.liquid,[0,h*.29,0],r-.025,48);const stop=group(q,[0,-.05,0]);const b=cyl(stop,.085,.42,M.brass);b.rotation.z=Math.PI/2;const handle=knob(stop,[0,0,.15],.10);bar(stop,[0,-.03,0],[0,-.40,0],.036,M.glass);return {q,fluid,handle};}
 function railWorld(points,{supports=true,mat=M.steel}={}){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));for(const dx of [-.10,.10]){const ps=[];for(let i=0;i<=100;i++){const p=path.getPoint(i/100),v=path.getTangent(i/100),right=new T.Vector3(v.z,0,-v.x).normalize().multiplyScalar(dx);ps.push(p.add(right).toArray());}curve(scene,ps,.027,mat,100);}if(supports)for(let i=0;i<=12;i++){const p=path.getPoint(i/12);bar(scene,[p.x,.06,p.z],[p.x,p.y-.05,p.z],.026,M.brass);bar(scene,[p.x-.19,p.y-.06,p.z],[p.x+.19,p.y-.06,p.z],.025,M.dark);cyl(scene,.07,.04,M.dark,[p.x,.03,p.z]);}return path;}

 // Data: four indexed ledgers slide into a keyed alignment carriage.
 {
  const g=group(scene,loc.data);pedestal(g,5.2,4.2,'01 资料关联 · 数据治理');
  const names=['开户档案','风险问卷','测评历史','交易记录'];const folders=[];
  names.forEach((s,i)=>{const q=group(g,[-1.8+i*1.18,.8,-.35]);box(q,.88,.10,2.4,M.wood);box(q,.83,.03,2.30,M.paper,[0,.07,0]);label(q,[s,'样例 A','来源索引 0'+(i+1)],[0,.09,-.12],.72,1.5,{flat:true});for(const x of [-.35,.35])bar(q,[x,-.02,-1.25],[x,-.02,1.25],.025,M.steel);roller(q,[0,.13,1.1],.8,.08);folders.push(q);});
  for(const x of [-2.32,2.32])post(g,[x,.46,.4],1.5,M,.055);bar(g,[-2.32,1.96,.4],[2.32,1.96,.4],.07,M.brass);thread(g,[-2.3,1.8,.4],[2.3,1.8,.4],.06,50);
  const reader=group(g,[-1.8,1.75,.4]);box(reader,.32,.32,.32,M.brass);bar(reader,[0,0,0],[0,-.6,.12],.025,M.blued);const d=gauge(g,[1.7,2.4,-.9],.42,'来源关联','4 / 4');post(g,[1.7,.45,-.98],1.7,M,.05);
  folio(g,['同一客户 · 标准字段','缺失材料 → 待补证'],[0,.51,1.42],3.2,.60);
  const missing=group(g,[-2.0,.50,1.45]);box(missing,.60,.08,.60,M.blued);label(missing,['待补证'],[0,.05,0],.50,.34,{flat:true});
  updates.push(t=>{folders.forEach((q,i)=>q.position.z=-.80+.65*ramp(t,17+i*2,20+i*2));reader.position.x=lerp(-1.8,1.8,ramp(t,24,29));d.n.rotation.z=.85-1.7*ramp(t,20,30);});
 }
 // Rule drafting: a paper drum, reviewed version key and visible geared monthly drive.
 {
  const g=group(scene,loc.rule);pedestal(g,4.7,4.0,'02 规则草拟 · 审核后执行');
  const paper=folio(g,['业务思路','比对信息与测评变更','规则脚本草稿','人工审核 → 版本绑定'],[0,.72,.45],2.9,2.6);
  const rolls=[roller(g,[0,.81,-.9],3.2,.23),roller(g,[0,.81,1.75],3.2,.23)];
  const g1=gear(g,.84,48,[-1.7,1.55,-.55],M),g2=gear(g,.42,24,[-.44,1.55,-.55],M);for(const x of [-1.7,-.44]){bearing(g,[x,1.55,-.8],M,.11);post(g,[x,.45,-.95],.98,M,.05);}
  const clock=gauge(g,[1.37,2.3,-.65],.60,'跑批周期','月度');post(g,[1.37,.45,-.85],1.4,M,.06);
  const key=group(g,[.6,2.8,-.3]);bar(key,[0,0,0],[0,-.65,0],.06,M.blued);ring(key,.20,.045,M.brass);box(key,.22,.11,.08,M.brass,[.07,-.55,0]);const socket=cyl(g,.16,.25,M.dark,[.6,1.18,-.3]);
  label(g,['审核钥匙'],[.65,.47,-1.5],1.6,.34,{flat:true});
  const version=plate(g,['规则版本 01'],[-.3,1.22,1.80],1.7,.28);
  updates.push(t=>{const a=Math.max(0,t-49)*.55;g1.rotation.z=-a;g2.rotation.z=a*2;clock.n.rotation.z=-a*.05;rolls.forEach(o=>o.rotation.x=-ramp(t,37,43)*3);key.position.y=2.8-1.10*ramp(t,45,48);});
 }
 // Optical comparator and differential grade ruler. Papers carry actual demo fields.
 {
  const g=group(scene,loc.compare);pedestal(g,6.7,4.8,'03 光学比对 · 异常初筛');
  const left=folio(g,['开户档案','家庭年收入  同口径','职业  职员','最高学历  本科','匿名样例 A'],[-1.15,.70,.42],1.9,2.5);
  const right=folio(g,['风险问卷','家庭年收入  同口径','职业  职员','最高学历  硕士','信息差异 · 待核查'],[1.15,.70,.42],1.9,2.5);
  for(const z of [-1.13,1.76]){bar(g,[-2.65,.85,z],[2.65,.85,z],.055,M.steel);for(const x of [-2.65,2.65]){box(g,.24,.30,.30,M.brass,[x,.7,z]);screw(g,[x,.87,z],M,.7);}}
  for(const x of [-2.60,2.60])post(g,[x,.45,-1.5],2.7,M,.095);bar(g,[-2.60,3.15,-1.5],[2.60,3.15,-1.5],.105,M.blued);thread(g,[-2.48,2.97,-1.25],[2.48,2.97,-1.25],.065,64);
  const hand=knob(g,[2.85,2.97,-1.25],.26);hand.rotation.y=Math.PI/2;
  const head=group(g,[-1.2,2.8,-.3]);box(head,.52,.40,.45,M.brass,[0,.25,-.94]);bar(head,[0,.2,-.9],[0,.2,0],.075,M.blued);
  const tube=cyl(head,.26,1.45,M.brass,[0,-.30,0]);for(const y of [-1.02,-.78,.25,.43])ring(head,.275,.035,M.edge,[0,y,0]);cyl(head,.18,.36,M.dark,[0,.58,0]);for(let i=0;i<30;i++){const a=i/30*TAU;bar(head,[Math.cos(a)*.187,.45,Math.sin(a)*.187],[Math.cos(a)*.187,.71,Math.sin(a)*.187],.005,M.edge);}cyl(head,.235,.045,M.lens,[0,-1.04,0]);cyl(head,.145,.04,M.lens,[0,.78,0]);
  const fine=knob(head,[.37,-.10,.10],.22);fine.rotation.y=Math.PI/2;bar(head,[.1,-.1,.1],[.38,-.1,.1],.04,M.steel);
  const probes=[],flags=[];for(let i=0;i<3;i++){const z=-.3+i*.54,pr=group(g,[1.15,1.42,z]);bar(pr,[0,0,0],[0,-.54,0],.011,M.blued);sphere(pr,.024,M.steel,[0,-.55,0]);bar(g,[2.40,1.37,z],[1.15,1.37,z],.02,M.brass);probes.push(pr);const f=group(g,[2.42,.75,z]);bar(f,[0,0,0],[0,.30,0],.014,M.steel);box(f,.26,.16,.024,i===2?M.red:M.sage,[.12,.24,0],.008);flags.push(f);}
  const tower=group(g,[-2.84,.45,0]);post(tower,[0,0,-.2],3.5,M,.05);box(tower,.80,3.2,.065,M.ivory,[0,1.9,0]);for(let i=0;i<5;i++){const yy=.65+i*.58;bar(tower,[-.05,yy,.05],[.33,yy,.05],.006,M.ink);label(tower,['R'+(i+1)],[-.25,yy,.08],.22,.18,{border:false,bg:null});}
  const low=group(tower,[0,.65,.18]),high=group(tower,[0,.65,.18]);for(const q of [low,high]){box(q,.60,.11,.22,M.brass);box(q,.07,.13,.25,M.blued,[.30,0,0]);}
  const diff=folio(g,['同季度 | 等级差 ≥ 2','上调 / 下调均留痕'],[-1.20,.48,-1.84],2.60,.58);
  folio(g,['资料差异 → 初筛疑点','真实性仍需核查'],[1.56,.48,2.05],2.38,.52);
  updates.push(t=>{const scan=ramp(t,58,64);head.position.x=lerp(-1.15,1.15,scan);fine.rotation.z=-scan*4;hand.rotation.z=scan*6;probes.forEach((q,i)=>q.position.y=1.42-.10*ramp(t,64+i,65+i));flags.forEach((q,i)=>q.scale.y=i===2?(.05+.95*ramp(t,67,69)):.1);let v=t<15?ramp(t,3,8):ramp(t,72,76);if(t>=79&&t<85)v=1-ramp(t,79,83);high.position.y=.65+1.16*v;});
  actors.compare={head,high,low,flags};
 }
 // Chemistry-inspired observation sidecar: real transparent walls, stopcocks and liquid levels.
 {
  const g=group(scene,loc.chem);pedestal(g,3.0,3.4,'观察旁路 · 来源到位');
  for(const x of [-1.1,1.1]){post(g,[x,.45,-.7],4.2,M,.055);cyl(g,.18,.08,M.dark,[x,.5,-.7]);}bar(g,[-1.1,4.65,-.7],[1.1,4.65,-.7],.055,M.brass);
  const tubes=[];for(let i=0;i<3;i++){const x=-.75+i*.75,tube=glassTube(g,[x,1.35,0],.15,2.8);for(const y of [1.7,3.7]){bar(g,[x,y,-.7],[x,y,-.12],.027,M.brass);ring(g,.167,.018,M.brass,[x,y,0]);}tubes.push(tube);label(g,[[ '档案','变更','交易'][i]],[x,4.25,.10],.54,.25,{border:false});}
  for(let i=0;i<3;i++)flask(g,[-.75+i*.75,.46,0],.24,.42,i===2?M.clearLiquid:M.liquid);
  flask(g,[.9,.46,-1.05],.25,.67,M.amberLiquid);
  const drips=[];for(let i=0;i<3;i++){const q=sphere(g,.038,M.liquid,[-.75+i*.75,1.0,0]);drips.push(q);}
  folio(g,['材料到位 · 来源可追溯'],[0,.48,1.43],2.4,.30);
  updates.push(t=>{const open=ramp(t,83,85),fill=ramp(t,84,88);tubes.forEach((a,i)=>{a.handle.rotation.z=open*Math.PI/2;const f=.68-fill*.16*(i===2?1:.6);a.fluid.scale.y=f/.58;a.fluid.position.y=2.8*f/2;});drips.forEach((q,i)=>{const a=(t-84+i*.18)*1.1;q.visible=t>84&&t<88;q.position.y=1.0-((a%1+1)%1)*.45;q.scale.set(.75,1.4,.75);});});
 }
 // Matrix: two independent lead screws select four evidence combinations on a measured surface.
 {
  const g=group(scene,loc.matrix);cyl(g,3.0,.27,M.wood,[0,.20,0],3.0,128);ring(g,2.93,.033,M.edge,[0,.34,0]);cyl(g,2.84,.07,M.dark,[0,.39,0],2.84,128);
  const grids=[[-1.05,1.05,'持续关注',M.ivory],[1.05,1.05,'一般关注',M.amber],[-1.05,-1.05,'一般关注',M.amber],[1.05,-1.05,'重点关注',M.rose]];
  grids.forEach(([x,z,s,mat])=>{box(g,1.98,.045,1.98,mat,[x,.46,z],.10);label(g,[s],[x,.49,z+(s==='重点关注'?.60:-.45)],1.55,.35,{flat:true,bg:mat===M.ivory?'#e7dfc9':mat===M.amber?'#d6bd7e':'#c78f7f',border:false});});
  for(let i=0;i<33;i++){const x=-2.2+i*4.4/32;bar(g,[x,.54,2.27],[x,.54,i%4===0?2.45:2.36],.004,M.ink);bar(g,[-2.27,.54,x],[-(i%4===0?2.45:2.36),.54,x],.004,M.ink);}
  label(g,['变更后短期购入高风险产品佐证  无 → 有'],[0,.45,2.65],4.5,.30,{flat:true});label(g,['信息变更异常'],[-2.63,.45,0],2.8,.28,{flat:true,angle:Math.PI/2});label(g,['无'],[-2.37,.55,1.05],.3,.28,{flat:true,border:false});label(g,['强'],[-2.37,.55,-1.05],.3,.28,{flat:true,border:false});
  const xStage=group(g,[-1.05,.74,0]);for(const x of [-2.30,2.30]){bar(g,[x,.70,-2.17],[x,.70,2.17],.045,M.steel);for(const z of [-2.17,2.17])box(g,.22,.18,.22,M.brass,[x,.61,z]);}
  const zStage=group(g,[0,.77,1.05]);for(const x of [-2.30,2.30])box(zStage,.22,.19,.38,M.brass,[x,0,0]);bar(zStage,[-2.35,0,0],[2.35,0,0],.065,M.steel);thread(zStage,[-2.1,.08,.18],[2.1,.08,.18],.05,44);const bed=group(zStage,[-1.05,.22,0]);box(bed,1.0,.09,.85,M.blued,[0,0,0],.08);for(const x of [-.48,.48])box(bed,.07,.15,.86,M.brass,[x,.06,0]);
  const wheelZ=knob(g,[-2.60,.75,0],.25);wheelZ.rotation.y=Math.PI/2;const wheelX=knob(zStage,[2.47,.08,.18],.23);wheelX.rotation.y=Math.PI/2;
  thread(g,[-2.48,.72,-2.1],[-2.48,.72,2.1],.05,44);
  const dialX=gauge(g,[1.45,1.55,-2.5],.40,'交易佐证'),dialZ=gauge(g,[-1.45,1.55,-2.5],.40,'信息异常');for(const x of [-1.45,1.45])post(g,[x,.38,-2.65],.8,M,.045);
  plate(g,['04 证据组合 · 流程示意'],[0,.22,3.02],3.8,.25);
  updates.push(t=>{const a=matrixAt(t);zStage.position.z=a.z;bed.position.x=a.x;wheelX.rotation.z=a.x*3;wheelZ.rotation.z=a.z*3;dialX.n.rotation.z=a.x*.7;dialZ.n.rotation.z=a.z*.7;});actors.matrix={zStage,bed};
 }
 // The archive physically keeps customer -> manager -> branch relationships distinct from risk bins.
 {
  const g=group(scene,loc.archive);pedestal(g,5.2,3.6,'05 分层归集 · 按客户去重');
  for(const x of [-2.25,2.25])post(g,[x,.45,-.8],4.1,M,.11);const drawers=[];
  for(let i=0;i<3;i++){const y=.85+i*1.22;box(g,4.5,.12,2.4,M.wood,[0,y,-.2],.06);const q=group(g,[0,y+.14,-.2]);box(q,4.23,.16,2.13,M.wood);box(q,4.23,.43,.10,M.wood,[0,.20,1.10]);plate(q,[[ '客户记录','客户经理 / 经纪人','营业部汇总'][i]],[0,.20,1.17],2.8,.25);for(const x of [-1.78,1.78]){ring(q,.07,.015,M.brass,[x,.23,1.21],[0,0,0]);}for(let j=0;j<5-i;j++){folio(q,['匿名索引 '+(j+1),'归属关系'],[-1.6+j*.80,.12,0],.65,1.7);}drawers.push(q);}
  label(g,['客户 → 经理 → 营业部'],[0,4.8,.15],4.3,.30,{bg:'#d7c9ad'});
  const counter=gauge(g,[-1.5,1.8,1.5],.43,'客户去重','人数');
  folio(g,['机构人数 · 方案示例阈值','0—4 持续 | 5—9 一般 | ≥10 重点'],[.25,.51,1.35],4.35,.55);
  updates.push(t=>{drawers.forEach((q,i)=>q.position.z=-.2+.72*ramp(t,121+i*4,123+i*4));counter.n.rotation.z=.8-1.6*ramp(t,126,135);});
 }
 // Human evidence gate: counterweight, pawl, review materials and three traced outcomes.
 {
  const g=group(scene,loc.human);pedestal(g,6.0,3.8,'06 人工取证 · 复核留痕');
  const rollerA=roller(g,[-1.45,.75,0],1.8,.18),rollerB=roller(g,[1.15,.75,0],1.8,.18);for(const x of [-2.25,2.25]){post(g,[x,.45,0],2.0,M,.095);ring(g,.14,.03,M.edge,[x,2.46,0]);}
  const gate=group(g,[-2.25,2.30,0]);bar(g,[0,0,0],[4.5,0,0],.075,M.blued);for(const x of [.8,1.8,2.8,3.8]){box(gate,.28,.10,.16,M.brass,[x,0,0]);}const lever=group(g,[-2.25,2.30,.23]);bar(lever,[0,0,0],[-.50,-.70,0],.05,M.brass);sphere(lever,.12,M.wood,[-.50,-.70,0]);cyl(lever,.22,.10,M.brass,[0,0,0]).rotation.x=Math.PI/2;
  const records=folio(g,['待人工核查','设备指纹 · 交易流水','销售留痕 · 相关说明','定性与处罚由人工审核确认'],[0,.63,1.03],3.55,1.1);
  for(let i=0;i<3;i++){const q=group(g,[-1.7+i*1.7,.50,-1.0]);box(q,1.35,.12,.9,M.dark);label(q,[[ '补证','排除','确认'][i]],[0,.07,0],1.15,.40,{flat:true});}
  const stamp=group(g,[1.7,2.0,1.0]);post(g,[2.40,.45,1],2.2,M,.055);bar(g,[2.40,2.65,1],[1.70,2.65,1],.05,M.brass);
  cyl(g,.11,.18,M.brass,[1.7,2.65,1]);bar(stamp,[0,0,0],[0,1.95,0],.055,M.steel);box(stamp,.72,.15,.38,M.brass);sphere(stamp,.15,M.wood,[0,2.08,0]);
  updates.push(t=>{const q=ramp(t,150,153);gate.rotation.z=q*.57;lever.rotation.z=q*.57;stamp.position.y=2.0-1.25*ramp(t,157.5,159)+1.25*ramp(t,159.3,160.5);rollerA.rotation.x=-ramp(t,145,149)*2;rollerB.rotation.x=-ramp(t,154,157)*2;});actors.human={gate};
 }
 // A calibration balance and inlaid closing record form quiet, crafted secondary objects.
 {
  const g=group(scene,[-5.3,0,4.6]);pedestal(g,3.0,2.7,'校准 · 反馈复盘');
  post(g,[0,.45,-.5],2.2,M,.08);const beam=group(g,[0,2.68,-.5]);bar(beam,[-1.1,0,0],[1.1,0,0],.045,M.brass);for(const x of [-1.1,1.1]){bar(beam,[x,0,0],[x,-.82,0],.009,M.steel);const pan=cyl(beam,.40,.04,M.brass,[x,-.84,0]);for(const dx of [-.3,.3])bar(beam,[x,0,0],[x+dx,-.83,0],.008,M.steel);}sphere(g,.08,M.blued,[0,2.68,-.5]);folio(g,['反馈复盘','审核后更新规则版本'],[0,.5,.8],2.5,.70);updates.push(t=>beam.rotation.z=.06*Math.sin(t*.7)*(1-ramp(t,169,173)));
  const close=group(scene,[-.5,.01,1.7]);folio(close,['从异常到证据','持续发现 · 靶向核查 · 经验留存','AI驱动审计非现场智能监测','建设方案与匿名流程演示'],[0,.08,0],5.1,2.15);for(const x of [-2.5,2.5])roller(close,[x,.1,0],2.3,.06).rotation.y=Math.PI/2;
 }
 // World-space transfer lines preserve the identity of the main evidence case.
 const routes={
  toData:railWorld([[-2,1.10,-2.25],[-4.5,1.10,-1],[-6,1.10,3],[-9,1.10,4.45]]),
  toRule:railWorld([[-9,1.10,4.45],[-11.3,1.10,3.8],[-11.7,1.10,-.5],[-9,1.10,-2.15]]),
  toCompare:railWorld([[-9,1.10,-2.15],[-6.6,1.10,-2.1],[-4,1.10,-2.25],[-2,1.10,-2.25]]),
  toMatrix:railWorld([[-2,1.10,-2.25],[.6,1.10,-2.35],[3.0,1.10,-4.40],[5.3,1.10,-3.5],[5.95,1.10,-.45]]),
  toArchive:railWorld([[8.05,1.10,-2.55],[10.3,1.10,-2],[11.7,1.10,2.3],[8,1.10,7.0]]),
  toHuman:railWorld([[8,1.10,7.0],[6,1.10,8.3],[3,1.10,8.3],[1,1.10,7.0]]),
  feedback:railWorld([[1,1.10,7.0],[-2,1.10,8.1],[-6,1.10,7.4],[-11.8,1.10,5.8],[-12.2,1.10,-.2],[-9,1.10,-2.15]])
 };
 const specimen=group(scene,[-2,1.1,-2.25]);box(specimen,.88,.12,.63,M.blued,[0,.08,0],.08);box(specimen,.68,.018,.49,M.paper,[0,.15,0],.025);label(specimen,['A','证据匣'],[0,.161,0],.59,.42,{flat:true,bg:'#e7dfcc',border:false});for(const x of [-.42,.42])box(specimen,.055,.17,.60,M.brass,[x,.14,0],.015);for(const z of [-.24,.24])ring(specimen,.06,.018,M.steel,[0,-.01,z],[0,0,0]);
 function route(name,t,a,b){const p=routes[name].getPoint(ramp(t,a,b)),v=routes[name].getTangent(ramp(t,a,b));return {p,v};}
 function specimenAt(t){let q;if(t<15)q={p:new T.Vector3(-2,1.1,-2.25),v:new T.Vector3(1,0,0)};else if(t<35)q=route('toData',t,15,19);else if(t<55)q=route('toRule',t,35,38);else if(t<82)q=route('toCompare',t,53,57);else if(t<89)q=route('toMatrix',t,82,88);else if(t<115){const a=matrixAt(t);q={p:new T.Vector3(7+a.x,1.10,-1.5+a.z),v:new T.Vector3(1,0,0)};}else if(t<140)q=route('toArchive',t,115,120);else if(t<165)q=route('toHuman',t,140,145);else q=route('feedback',t,165,174);return q;}
 return {loc,actors,specimen,specimenAt,label,plate,document:folio,update(t){updates.forEach(fn=>fn(t));const q=specimenAt(t);specimen.position.copy(q.p);specimen.rotation.y=Math.atan2(-q.v.z,q.v.x);return {matrix:matrixAt(t),humanGate:t>=150?ramp(t,150,153):0};}};
}

export function matrixAt(t){
 let x=-1.05,z=1.05,label='持续关注',combination='无异常 / 无交易佐证';
 if(t>=92&&t<100){z=lerp(1.05,-1.05,ramp(t,92,94));label='一般关注';combination='强异常 / 无交易佐证';}
 else if(t>=100&&t<108){x=lerp(-1.05,1.05,ramp(t,100,102));z=-1.05;label='重点关注';combination='强异常 / 有交易佐证';}
 else if(t>=108&&t<114){x=1.05;z=lerp(-1.05,1.05,ramp(t,108,110));label='一般关注';combination='无异常 / 有交易佐证';}
 else if(t>=114){x=1.05;z=lerp(1.05,-1.05,ramp(t,114,115));label='重点关注';combination='强异常 / 有交易佐证';}
 return {x,z,label,combination};
}
