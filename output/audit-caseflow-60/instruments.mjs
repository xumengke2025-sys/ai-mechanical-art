import * as T from 'three';
import {TAU,group,mesh,box,cyl,sphere,bar,ring,curve,lathe,screw,post,wheel,plaque,paper,dial,ramp,lerp,textTexture} from './mechanics.mjs';

// A single case travels through a shared, continuous screw-guided world.
export function createLaboratory(scene,M){
 const root=group(scene),LEAD=.35,ST=[-12,-7,-2,3,8,13],signals=[],stationLamps=[];
 function bore(p,ri,ro,h,pos,axis='z',mat=M.brass){const b=lathe(p,[[ri,-h/2],[ro,-h/2],[ro,h/2],[ri,h/2],[ri,-h/2]],mat,pos);b.rotation.z=axis==='x'?Math.PI/2:0;b.rotation.x=axis==='z'?Math.PI/2:0;return b;}
 function base(p,w,d,pos){box(p,w,.24,d,M.wood,pos,.10);box(p,w+.035,.035,d+.035,M.edge,[pos[0],pos[1]+.137,pos[2]],.04);for(const x of [-w/2+.16,w/2-.16])for(const z of [-d/2+.16,d/2-.16])screw(p,[pos[0]+x,pos[1]+.17,pos[2]+z],M,.7);}
 function sign(p,txt,pos,w=2.6,h=.40){return plaque(p,txt,pos,w,h,M);}
 function lamp(p,pos){const g=group(p,pos);cyl(g,.13,.08,M.brass);const a=sphere(g,.10,M.dark,[0,.09,0]);signals.push(a);return a;}
 function stage(i,title){const g=group(root,[ST[i],0,0]);base(g,4.25,3.6,[0,.45,-2.60]);for(const x of [-1.85,1.85])post(g,[x,.63,-3.45],3.36,M,.07);bar(g,[-1.85,3.91,-3.45],[1.85,3.91,-3.45],.048,M.brass);sign(g,title,[0,4.08,-3.40],2.85,.42);const a=sign(g,String(i+1).padStart(2,'0'),[-1.88,1.8,-.82],.48,.36);stationLamps.push(lamp(g,[1.82,.70,-.98]));return g;}
 // Continuous rails with end bearings outside the swept carriage envelope.
 base(root,32.1,2.35,[.5,.63,0]);
 for(const z of [-.46,.46]){bar(root,[-15,1.16,z],[16,1.16,z],.065,M.steel);for(const x of [-14.85,15.85]){box(root,.28,.31,.30,M.blued,[x,.96,z]);bore(root,.067,.13,.28,[x,1.16,z],'x');screw(root,[x,.85,z+.18],M,.7);}}
 const spindle=group(root,[0,1,0]);bar(spindle,[-15.15,0,0],[16.15,0,0],.071,M.steel);
 const thread=[];for(let i=0;i<=3400;i++){const x=-15.10+i/3400*31.20,a=(x+15.10)/LEAD*TAU;thread.push([x,.094*Math.cos(a),.094*Math.sin(a)]);}curve(spindle,thread,.014,M.edge,3400);
 for(const x of [-15.0,16.0]){box(root,.30,.28,.32,M.blued,[x,.88,0]);bore(root,.074,.15,.28,[x,1,0],'x');}
 const drive=wheel(root,.31,[-15.25,1,0],M);drive.rotation.y=Math.PI/2;
 // One identity, one carriage: labels change only when an actual step yields a result.
 const carriage=group(root,[-13.25,0,0]);box(carriage,1.62,.18,1.36,M.blued,[0,1.37,0]);
 for(const z of [-.46,.46])bore(carriage,.067,.124,1.20,[0,1.16,z],'x');bore(carriage,.095,.18,.48,[0,1,0],'x');box(carriage,.40,.23,.30,M.brass,[0,1.19,0]);
 box(carriage,1.42,.10,1.15,M.teal,[0,1.51,0]);paper(carriage,1.12,.64,[0,1.58,-.03],M,'A017');
 for(const x of [-.66,.66])for(const z of [-.48,.48])screw(carriage,[x,1.58,z],M,.7);
 const identity=ring(carriage,.085,.020,M.teal,[-.79,1.74,.70],[0,0,0]);
 const studs=[];for(let i=0;i<6;i++)studs.push(sphere(carriage,.043,M.dark,[-.40+i*.16,1.66,-.44]));
 const states=['待筛','跨级','信息差异','交易佐证','待取证','已归集','人工复核'];
 const stateLabels=states.map(s=>sign(carriage,'A017 · '+s,[0,1.74,.60],1.50,.28));
 // 01: two assessment records on the same calibrated R1-R5 scale.
 const g0=stage(0,'发现跨级');base(g0,3.50,1.75,[0,.80,-2.15]);
 sign(g0,'同一季度',[0,3.38,-2.74],1.72,.33);for(const x of [-.70,.70])bar(g0,[x,3.91,-3.45],[x,3.57,-2.74],.018,M.brass);
 const scale=group(g0,[0,1.72,-1.85]);box(scale,3.20,1.34,.16,M.blued);
 sign(scale,'第一次',[-1.12,.27,.12],.63,.21);sign(scale,'第二次',[-1.12,-.25,.12],.63,.21);
 for(let i=0;i<5;i++){const x=-.42+i*.37;bar(scale,[x,-.43,.17],[x,.43,.17],.011,M.brass);sign(scale,'R'+(i+1),[x,.55,.18],.32,.20);}
 const pointers=[];for(const y of [.24,-.26]){bar(scale,[-.58,y,.24],[1.25,y,.24],.025,M.steel);const g=group(scale,[-.42,y,.24]);bore(g,.027,.065,.15,[0,0,0],'x');const tri=new T.Shape();tri.moveTo(-.07,.20);tri.lineTo(.07,.20);tri.lineTo(0,.04);tri.closePath();mesh(g,new T.ExtrudeGeometry(tri,{depth:.045,bevelEnabled:false}),y>0?M.teal:M.amber,[0,0,.07]);pointers.push(g);}
 for(const x of [-1.35,1.35])post(g0,[x,.95,-1.90],.14,M,.04);const delta=sign(g0,'差值 2 级',[0,2.72,-1.78],1.78,.36);for(const x of [-.65,.65])bar(g0,[x,2.39,-1.83],[x,2.54,-1.83],.016,M.brass);sign(g0,'月度跑批',[-1.11,1.01,-1.10],1.20,.28);const monthly=dial(g0,[1.15,1.10,-1.15],.29,M,'月度');
 sign(g0,'规则已审核',[0,.73,-.91],1.40,.22);
 // 02: matching fields arrive from two distinct record drawers, then align.
 const g1=stage(1,'核对资料');
 for(const x of [-1.25,1.25]){box(g1,1.25,1.04,.90,M.wood,[x,1.17,-2.91]);for(let j=0;j<3;j++){box(g1,1.10,.26,.08,M.blued,[x,.84+j*.32,-2.42]);bar(g1,[x-.15,.84+j*.32,-2.34],[x+.15,.84+j*.32,-2.34],.021,M.brass);}post(g1,[x,.63,-1.6],1.08,M,.055);}
 const fieldA=group(g1,[-1.2,2.19,-1.90]),fieldB=group(g1,[1.2,2.19,-1.90]);
 sign(fieldA,'开户档案',[0,.42,0],1.52,.29);sign(fieldA,'学历：本科',[0,0,0],1.58,.39);sign(fieldB,'本次问卷',[0,.42,0],1.52,.29);sign(fieldB,'学历：硕士',[0,0,0],1.58,.39);
 for(const x of [-1.8,1.8]){bar(g1,[x,.64,-2.10],[x,2.74,-2.10],.035,M.steel);}bar(g1,[-1.8,2.19,-2.10],[1.8,2.19,-2.10],.032,M.steel);for(const g of [fieldA,fieldB])bore(g,.034,.075,.32,[0,0,-.20],'x');
 const mismatch=sign(g1,'信息差异',[0,3.20,-2.0],1.75,.37);for(const x of [-.65,.65])bar(g1,[x,3.91,-3.45],[x,3.42,-2.0],.018,M.brass);
 // 03: explicit event order, plus a burette lens that reveals corroboration.
 const g2=stage(2,'核查动因');
 sign(g2,'① 测评变更',[-.95,2.54,-2.10],1.90,.34);sign(g2,'② 申购高风险产品',[.70,1.66,-1.95],2.50,.34);
 const event1=lamp(g2,[-1.85,2.49,-2.06]),event2=lamp(g2,[-.68,1.63,-1.90]);bar(g2,[-.95,.64,-2.24],[-.95,2.36,-2.24],.035,M.brass);bar(g2,[.70,.64,-2.10],[.70,1.46,-2.10],.035,M.brass);
 curve(g2,[[-.95,2.30,-2.1],[-.95,2.03,-2.1],[.70,2.03,-2.1],[.70,1.92,-2.1]],.025,M.brass,32);
 for(const p of [[-1.4,.63,-2.3],[1.48,.63,-2.4]])post(g2,p,2.4,M,.055);
 lathe(g2,[[.10,0],[.14,.08],[.14,1.72],[.10,1.80]],M.glass,[1.48,1.25,-2.40]);cyl(g2,.103,1.12,M.liquid,[1.48,1.97,-2.40]);
 for(const y of [1.40,2.70]){bar(g2,[1.48,y,-2.40],[1.90,y,-2.40],.018,M.brass);ring(g2,.17,.016,M.brass,[1.48,y,-2.40]);}
 for(let i=0;i<12;i++)bar(g2,[1.38,1.50+i*.10,-2.25],[i%3===0?1.53:1.46,1.50+i*.10,-2.25],.006,M.ivory);
 const valve=group(g2,[1.48,1.25,-2.4]);bar(valve,[-.23,0,0],[.23,0,0],.02,M.brass);sphere(valve,.06,M.blued);lathe(g2,[[.16,0],[.20,.06],[.17,.28],[.06,.46],[.055,.62]],M.glass,[1.48,.65,-2.40]);const drop=sphere(g2,.034,M.liquid,[1.48,1.15,-2.4]);
 const motive=sign(g2,'动因待核实',[0,3.28,-2.10],2.10,.36);for(const x of [-.75,.75])bar(g2,[x,3.91,-3.45],[x,3.49,-2.10],.018,M.brass);
 // 04: comparator. Inputs are evidence; two possibilities remain conditional.
 const g3=stage(3,'区分情况');
 base(g3,2.65,1.90,[0,.82,-2.40]);for(const x of [-.85,.85])post(g3,[x,1,-2.62],1.55,M,.075);
 const optical=group(g3,[0,2.30,-2.36]);bar(optical,[-1.18,0,0],[1.18,0,0],.06,M.blued);
 for(const x of [-.85,.85]){const c=cyl(optical,.31,.42,M.brass,[x,0,.06]);c.rotation.x=Math.PI/2;const l=cyl(optical,.255,.025,M.lens,[x,0,.29]);l.rotation.x=Math.PI/2;ring(optical,.285,.019,M.edge,[x,0,.32],[0,0,0]);}
 sign(g3,'MAC / IP',[-.90,1.35,-1.28],1.42,.29);sign(g3,'销售留痕',[.90,1.35,-1.28],1.42,.29);
 const choices=group(g3,[0,3.18,-1.82]);sign(choices,'自主修改？',[-.94,0,0],1.63,.32);sign(choices,'存在诱导？',[.94,0,0],1.63,.32);for(const x of [-1.30,1.30])bar(g3,[x,3.91,-3.45],[x,3.40,-1.82],.018,M.brass);
 const scan=group(g3,[0,1.70,-1.15]);bar(scan,[-1.32,0,0],[1.32,0,0],.015,M.teal);for(const x of [-1.32,1.32]){bar(g3,[x,1.4,-1.15],[x,3.12,-1.15],.025,M.steel);bore(scan,.027,.061,.16,[x,0,0],'y');for(const y of [1.42,3.10])box(g3,.12,.08,.16,M.brass,[x,y,-1.15]);}
 // 05: affiliation tree, never a finding of culpability.
 const g4=stage(4,'定位核查对象');
 for(const x of [-1.44,1.44])post(g4,[x,.65,-2.80],2.98,M,.055);
 const tree=[];for(const [i,txt,y] of [[0,'客户 A017',1.30],[1,'经理 M04',2.18],[2,'营业部 B02',3.06]]){const p=sign(g4,txt,[0,y,-1.73],2.15,.35);tree.push(p);if(i<2){bar(g4,[0,y+.23,-1.90],[0,y+.66,-1.90],.028,M.brass);}}
 bar(g4,[0,.64,-1.92],[0,3.30,-1.92],.025,M.steel);const treeLights=[1.3,2.18,3.06].map(y=>lamp(g4,[1.35,y,-1.70]));
 // 06: guided slider crank; contact plane is exactly the case paper height.
 const g5=stage(5,'人工取证与复核'),press=group(root,[13,0,0]);
 for(const x of [-1.20,1.20]){post(press,[x,.78,-.08],3.40,M,.10);bar(press,[x*.64,1.0,-.08],[x*.64,3.80,-.08],.065,M.steel);box(press,.29,.30,.31,M.blued,[x*.64,.88,-.08]);for(const yy of [1.06,3.77])cyl(press,.13,.13,M.brass,[x*.64,yy,-.08]);}
 box(press,2.70,.28,.48,M.blued,[0,3.76,-.10]);
 const crank=group(press,[0,3.80,.16]);bar(press,[0,3.8,-.65],[0,3.8,.33],.085,M.steel);bore(press,.087,.18,.30,[0,3.80,-.24]);const disc=cyl(crank,.36,.12,M.brass);disc.rotation.x=Math.PI/2;ring(crank,.30,.015,M.edge,[0,0,.075],[0,0,0]);const pin=cyl(crank,.071,.16,M.steel,[0,.28,.17]);pin.rotation.x=Math.PI/2;
 const rod=bar(press,[0,4.08,.30],[0,3.03,.30],.075,M.brass),slider=group(press,[0,3.03,0]);box(slider,1.64,.22,.36,M.blued,[0,0,-.08]);for(const x of [-.768,.768])bore(slider,.067,.13,.4,[x,0,-.08],'y');
 bar(slider,[0,0,0],[0,-.740,0],.10,M.steel);box(slider,.54,.13,.50,M.brass,[0,-.805,0]);const lower=cyl(slider,.11,.34,M.steel,[0,0,.20]);lower.rotation.x=Math.PI/2;
 const manual=wheel(press,.40,[-1.43,2.20,.30],M);bar(press,[-1.43,2.2,-.65],[-1.43,2.2,.30],.07,M.steel);box(press,.35,.52,.30,M.blued,[-1.43,2,-.18]);
 for(const p of [[-1.43,2.20,-.53],[0,3.80,-.53]]){const pu=cyl(press,.20,.09,M.brass,p);pu.rotation.x=Math.PI/2;ring(press,.183,.017,M.dark,[p[0],p[1],p[2]+.03],[0,0,0]);}
 {const a=new T.Vector2(-1.43,2.2),b=new T.Vector2(0,3.8),n=b.clone().sub(a).normalize(),norm=new T.Vector2(-n.y,n.x),ps=[];for(let i=0;i<=40;i++){const th=i/40*Math.PI,v=norm.clone().multiplyScalar(Math.cos(th)).add(n.clone().multiplyScalar(-Math.sin(th))).multiplyScalar(.205);ps.push([a.x+v.x,a.y+v.y,-.5]);}for(let i=0;i<=40;i++){const th=i/40*Math.PI,v=norm.clone().multiplyScalar(-Math.cos(th)).add(n.clone().multiplyScalar(Math.sin(th))).multiplyScalar(.205);ps.push([b.x+v.x,b.y+v.y,-.5]);}ps.push(ps[0]);curve(press,ps,.022,M.leather,180);}
 // The physical identity tag sits ahead of the press: no platen sweeps through text.
 const stamp=mesh(carriage,new T.PlaneGeometry(.47,.20),new T.MeshBasicMaterial({map:textTexture('复核',{w:512,h:200,size:110}),toneMapped:false}),[0,1.603,.0],false);stamp.rotation.x=-Math.PI/2;
 sign(g5,'销售留痕 · 取证材料',[0,2.75,-1.72],3.12,.31);
 for(const [x,txt] of [[-1.25,'排除'],[0,'补证'],[1.25,'确认']])sign(g5,txt,[x,1.70,-1.34],.88,.31);
 // A continuous, supported feedback conduit returns review information to rules.
 const feedbackPts=[[13,.48,1.5],[14.0,.48,2.35],[13,.48,3.10],[-12,.48,3.10],[-13.5,.48,2.30],[-12,.48,1.45]];
 const feedbackCurve=new T.CatmullRomCurve3(feedbackPts.map(p=>new T.Vector3(...p)));mesh(root,new T.TubeGeometry(feedbackCurve,180,.040,8,false),M.brass);
 for(const x of [-12,-6,0,6,12]){post(root,[x,.04,3.1],.42,M,.032);}
 const feedback=sphere(root,.10,M.teal);const fbSign=sign(root,'核查反馈 → 规则优化',[0,.59,3.13],3.30,.29);fbSign.rotation.x=-.44;
 function caseX(t){return -13.25+1.25*ramp(t,0,2.5)+5*ramp(t,11.5,13.8)+5*ramp(t,19.5,22)+5*ramp(t,29.5,32)+5*ramp(t,39.4,41.5)+5*ramp(t,47.4,49.6);}
 function carrierAt(t){return new T.Vector3(caseX(t),1.85,0);}
 const resultTimes=[7.8,18,25.3,37.5,44,52];
 function update(t){const x=caseX(t),ang=-(x+13.25)/LEAD*TAU;carriage.position.x=x;spindle.rotation.x=ang;drive.rotation.z=ang;monthly.needle.rotation.z=-TAU*ramp(t,0,3);
  pointers[0].position.x=-.42;pointers[1].position.x=lerp(-.42,.32,ramp(t,4.3,6.3));delta.visible=t>=7.0;
  fieldA.position.x=lerp(-1.44,-.86,ramp(t,14.4,15.7));fieldB.position.x=lerp(1.44,.86,ramp(t,14.4,15.7));mismatch.visible=t>=17.4;
  event1.material=t>=22.5?M.teal:M.dark;event2.material=t>=24.2?M.amber:M.dark;valve.rotation.z=Math.PI/2*ramp(t,24,24.8);drop.visible=t>=24.8&&t<27;drop.position.y=1.15-(Math.max(0,t-24.8)*2%1)*.32;motive.visible=t>=25.3;
  scan.visible=t>=32.6&&t<35.5;scan.position.y=lerp(1.70,2.9,ramp(t,32.6,35.5));choices.visible=t>=35.5;
  treeLights.forEach((l,i)=>l.material=t>=41.5+i*.9?M.teal:M.dark);
  const theta=TAU*ramp(t,50,53),px=.28*Math.sin(theta),py=3.8+.28*Math.cos(theta),sy=py-Math.sqrt(1.05**2-px**2);crank.rotation.z=-theta;slider.position.y=sy;const a=new T.Vector3(px,py,.30),b=new T.Vector3(0,sy,.30);rod.position.copy(a.clone().add(b).multiplyScalar(.5));rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());manual.rotation.z=-theta;stamp.visible=t>=51.5;
  const st=resultTimes.filter(v=>t>=v).length;stateLabels.forEach((p,i)=>p.visible=i===Math.min(st,6));studs.forEach((s,i)=>s.material=i<st?M.amber:M.dark);stationLamps.forEach((l,i)=>l.material=t>=resultTimes[i]?M.teal:M.dark);
  feedback.visible=t>=54;feedback.position.copy(feedbackCurve.getPoint(ramp(t,54,59.3)));
  return {caseId:'A017',caseX:x,completed:st,screwAngle:ang,screwLead:LEAD,assessment:[1,t<4.3?1:lerp(1,3,ramp(t,4.3,6.3))],press:{theta,pin:[px,py],sliderY:sy,rodLength:Math.hypot(px,py-sy),contactGap:sy-.870-1.600},feedback:t>=54};
 }
 return {update,carrierAt,caseX,stages:ST};
}
