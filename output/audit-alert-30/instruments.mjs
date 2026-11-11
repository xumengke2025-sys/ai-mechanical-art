import * as T from 'three';
import {TAU,group,mesh,box,cyl,sphere,bar,ring,curve,lathe,screw,post,wheel,gear,plaque,paper,dial,ramp,lerp,textTexture} from './mechanics.mjs';

export function createLaboratory(scene,M){
 const root=group(scene),Y0=1.40,top=.205,labels=[];
 const alertExample={anomalousClients:10,highRiskThreshold:10,fictional:true};
 const qualifiesForAlert=alertExample.anomalousClients>=alertExample.highRiskThreshold;
 const v=a=>new T.Vector3(...a);
 function bore(p,ri,ro,h,pos,axis='z'){
  const b=lathe(p,[[ri,-h/2],[ro,-h/2],[ro,h/2],[ri,h/2],[ri,-h/2]],M.brass,pos);
  b.rotation.z=axis==='x'?Math.PI/2:0;b.rotation.x=axis==='z'?Math.PI/2:0;return b;
 }
 function base(p,w,d,pos){
  box(p,w,.16,d,M.wood,pos,.08);box(p,w+.025,.025,d+.025,M.edge,[pos[0],pos[1]+.09,pos[2]],.025);
  box(p,w-.06,.035,d-.06,M.blued,[pos[0],pos[1]+.12,pos[2]],.02);
  for(const x of [-w/2+.14,w/2-.14])for(const z of [-d/2+.14,d/2-.14])screw(p,[pos[0]+x,pos[1]+.15,pos[2]+z],M,.6);
 }
 function sign(p,s,pos,w=1.5,h=.25){const g=plaque(p,s,pos,w,h,M);labels.push({text:s,object:g,w,h});return g;}
 function flip(p,s,pos,w,h){
  const g=sign(p,s,pos,w,h);bar(p,[pos[0]-w/2-.13,pos[1],pos[2]],[pos[0]+w/2+.13,pos[1],pos[2]],.018,M.steel);
  for(const dx of [-w/2-.12,w/2+.12]){bore(p,.02,.05,.12,[pos[0]+dx,pos[1],pos[2]],'x');bar(p,[pos[0]+dx,.4,pos[2]-.18],[pos[0]+dx,pos[1],pos[2]],.025,M.brass);}
  return g;
 }
 function lamp(p,pos){cyl(p,.075,.055,M.brass,pos);const s=sphere(p,.058,M.dark.clone(),[pos[0],pos[1]+.062,pos[2]]);return s;}
 function light(s,k,mat=M.teal){s.material.color.copy(M.dark.color).lerp(mat.color,k);s.material.metalness=lerp(.5,mat.metalness,k);s.material.emissive.copy(mat.color);s.material.emissiveIntensity=k*.40;}
 function shaft(p,pos,length=.50){bar(p,[pos[0],pos[1],pos[2]-length/2],[pos[0],pos[1],pos[2]+length/2],.045,M.steel);bore(p,.046,.10,.14,[pos[0],pos[1],pos[2]-.17]);}
 // Two supported, continuous rails curve around the courtyard and rise to the rear deck.
 const curves=[
  new T.CubicBezierCurve3(v([-4.4,1.4,2]),v([-4.4,1.4,.5]),v([-4.3,2.2,-1.1]),v([-3.3,2.2,-2.3])),
  new T.CubicBezierCurve3(v([-3.3,2.2,-2.3]),v([-2.3,2.2,-3.5]),v([2.3,2.2,-3.5]),v([3.3,2.2,-2.3])),
  new T.CubicBezierCurve3(v([3.3,2.2,-2.3]),v([4.3,2.2,-1.1]),v([4.4,1.4,.5]),v([4.4,1.4,2]))
 ];
 const lengths=curves.map(c=>c.getLength()),total=lengths.reduce((a,b)=>a+b),U1=lengths[0]/total,U2=(lengths[0]+lengths[1])/total;
 const path=new T.CurvePath();curves.forEach(c=>path.add(c));
 const normalAt=u=>{const d=path.getTangent(Math.max(.00001,Math.min(.99999,u)));return new T.Vector3(d.z,0,-d.x).normalize();};
 function railPoint(u,side=0){return path.getPoint(Math.max(0,Math.min(1,u))).addScaledVector(normalAt(u),side).add(v([0,-.28,0]));}
 for(const side of [-.45,.45]){const pts=[];for(let i=0;i<=300;i++)pts.push(railPoint(i/300,side).toArray());curve(root,pts,.053,M.steel,400);}
 // Deep-blue sleepers and turned supports keep the rails visibly mounted.
 for(let i=0;i<=36;i++){
  const u=i/36,p=railPoint(u),n=normalAt(u);bar(root,p.clone().addScaledVector(n,-.60).toArray(),p.clone().addScaledVector(n,.60).toArray(),.045,M.blued);
  if(i%3===0){post(root,[p.x,.18,p.z],p.y-.22,M,.055);cyl(root,.18,.055,M.blued,[p.x,.17,p.z]);}
 }
 // The carried identity is a small seal, rather than a screen-covering billboard.
 const carrier=group(root),wheels=[];
 box(carrier,1.32,.16,1.02,M.blued);box(carrier,1.19,.09,.90,M.teal,[0,.12,0]);paper(carrier,1.02,.64,[0,.184,0],M,'A017');
 for(const x of [-.52,.52])for(const z of [-.38,.38])screw(carrier,[x,.18,z],M,.6);
 const identity=sign(carrier,'A017',[0,.12,.54],.66,.23);
 const rearIdentity=sign(carrier,'A017',[0,.12,-.54],.66,.23);rearIdentity.rotation.y=Math.PI;
 const seal=ring(carrier,.095,.019,M.teal,[-.48,.14,.59],[0,0,0]);
 for(const z of [-.33,.33])for(const x of [-.45,.45]){const g=group(root);const w=cyl(g,.12,.11,M.brass);w.rotation.z=Math.PI/2;ring(g,.085,.012,M.edge,[0,0,0],[0,Math.PI/2,0]);wheels.push({g,x,z});}
 const stamp=mesh(carrier,new T.PlaneGeometry(.48,.23),new T.MeshBasicMaterial({map:textTexture('复核',{w:512,h:256,size:120}),transparent:true,opacity:0,depthWrite:false,toneMapped:false}),[0,.207,0],false);stamp.rotation.x=-Math.PI/2;

 // I. A calibrated differential instrument, with two readings on one R1—R5 arc.
 const g0=group(root,[-4.4,0,.65]);base(g0,2.80,2.02,[0,.25,0]);
 for(const x of [-.85,.85])post(g0,[x,.4,0],1.85,M,.075);
 const meter=group(g0,[0,3.03,.13]);
 const body=cyl(meter,1.12,.24,M.blued);body.rotation.x=Math.PI/2;
 ring(meter,1.12,.048,M.brass,[0,0,.14],[0,0,0]);ring(meter,1.04,.015,M.edge,[0,0,.17],[0,0,0]);
 const tx=textTexture('',{w:1024,h:1024,bg:'#e4dfcf'}),cx=tx.image.getContext('2d');cx.fillStyle='#e4dfcf';cx.fillRect(0,0,1024,1024);
 for(let j=0;j<=40;j++){const a=(-70+j*3.5)*Math.PI/180,r=j%10?433:409;cx.strokeStyle='#32444a';cx.lineWidth=j%10?2:4;cx.beginPath();cx.moveTo(512+Math.sin(a)*r,512-Math.cos(a)*r);cx.lineTo(512+Math.sin(a)*466,512-Math.cos(a)*466);cx.stroke();}
 cx.textAlign='center';cx.textBaseline='middle';cx.font='500 71px Georgia';cx.fillStyle='#253e45';for(let i=0;i<5;i++){const a=(-70+i*35)*Math.PI/180;cx.fillText('R'+(i+1),512+Math.sin(a)*350,512-Math.cos(a)*350);}
 cx.font='40px Microsoft YaHei';cx.fillText('同一季度',512,695);cx.font='27px Microsoft YaHei';cx.fillStyle='#607373';cx.fillText('两次测评 · 同一标尺',512,754);tx.needsUpdate=true;
 mesh(meter,new T.CircleGeometry(1.02,96),new T.MeshBasicMaterial({map:tx,toneMapped:false}),[0,0,.151],false);
 const needles=[];for(const [mat,z] of [[M.teal,.20],[M.amber,.24]]){const n=group(meter,[0,0,z]);const sh=new T.Shape();sh.moveTo(-.035,-.18);sh.lineTo(.035,-.18);sh.lineTo(.014,.79);sh.lineTo(0,.91);sh.lineTo(-.014,.79);sh.closePath();mesh(n,new T.ExtrudeGeometry(sh,{depth:.015,bevelEnabled:false}),mat);needles.push(n);}
 sphere(meter,.085,M.edge,[0,0,.28]);
 const delta=flip(g0,'差值 2 级',[0,2.12,.64],1.40,.28);sign(g0,'01 · 跨级线索',[0,.58,.84],1.73,.25);
 sign(g0,'规则已审核',[-.64,.45,.68],.95,.16);sign(g0,'月度跑批',[.64,.45,.68],.83,.16);
 const meterGear=gear(g0,.70,40,[0,3.03,-.13],M),meterPinion=gear(g0,.35,20,[1,3.03,-.13],M);shaft(g0,[0,3.03,-.13]);shaft(g0,[1,3.03,-.13]);post(g0,[1,.4,-.32],2.63,M,.04);
 // A real pawl and return pin will close the visual loop at the end.
 const pawl=group(g0,[1.13,.63,.51]);bar(pawl,[0,0,0],[.25,.12,0],.025,M.blued);sphere(pawl,.055,M.brass);

 // II. Two source drawers meet on a screw-driven comparator above the rear terrace.
 const g1=group(root,[-3.3,0,-3.48]);base(g1,3.1,1.80,[0,1.02,0]);
 for(const x of [-1.25,1.25])post(g1,[x,.18,-.40],.76,M,.065);
 const slideA=group(g1,[-.90,0,0]),slideB=group(g1,[.90,0,0]);
 for(const [g,s] of [[slideA,'档案 · 本科'],[slideB,'问卷 · 硕士']]){box(g,1.12,.62,.74,M.wood,[0,1.56,0]);box(g,1.03,.40,.045,M.blued,[0,1.56,.40]);bar(g,[-.14,1.57,.44],[.14,1.57,.44],.023,M.brass);const p=sign(g,s,[0,2.56,.29],1.39,.34);p.rotation.x=-.12;for(const x of [-.50,.50])post(g,[x,1.91,.13],.44,M,.025);for(const z of [-.23,.23])bore(g,.032,.065,.16,[0,1.97,z],'x');}
 for(const z of [-.23,.23])bar(g1,[-1.40,1.97,z],[1.40,1.97,z],.03,M.steel);
 const screwDrive=group(g1,[0,1.97,.02]);bar(screwDrive,[-1.50,0,0],[1.50,0,0],.045,M.steel);
 const helix=[];for(let i=0;i<=480;i++){const x=-1.5+i/480*3,a=Math.abs(x)/.16*TAU;helix.push([x,.058*Math.cos(a),.058*Math.sin(a)]);}curve(screwDrive,helix,.009,M.brass,480);
 for(const x of [-1.51,1.51])bore(g1,.046,.10,.16,[x,1.97,.02],'x');
 const compareWheel=wheel(g1,.22,[1.68,1.97,.02],M);compareWheel.rotation.y=Math.PI/2;
 const mismatch=flip(g1,'信息差异',[0,3.22,.05],1.56,.29);
 sign(g1,'02 · 资料比对',[0,1.22,.80],1.75,.25);
 const trade=flip(g1,'测评变更 → 高风险交易',[0,3.86,-.29],2.62,.28);
 // A burette turns corroboration into one measured drop, not a verdict.
 const chem=group(root,[-.95,0,-3.65]);base(chem,.88,1.03,[0,1.04,0]);post(chem,[.25,1.18,-.13],3.18,M,.037);
 lathe(chem,[[.09,0],[.12,.07],[.12,1.65],[.09,1.72]],M.glass,[0,2.45,0]);cyl(chem,.083,1.10,M.liquid,[0,3.08,0]);
 for(const y of [2.55,4.02]){ring(chem,.145,.013,M.brass,[0,y,0]);bar(chem,[0,y,-.1],[.25,y,-.13],.016,M.brass);}
 for(let i=0;i<14;i++)bar(chem,[-.055,2.65+i*.09,.115],[i%3===0?.055:.010,2.65+i*.09,.115],.004,M.ivory);
 lathe(chem,[[.11,0],[.15,.05],[.13,.23],[.04,.36],[.035,.56]],M.glass,[0,1.51,0]);
 const valve=group(chem,[0,2.44,0]);bar(valve,[-.20,0,0],[.20,0,0],.018,M.brass);sphere(valve,.044,M.blued);
 const drop=sphere(chem,.027,M.liquid,[0,2.34,0]);

 // III. Twin optical heads: retained traces are inputs, both interpretations stay conditional.
 const g2=group(root,[3.3,0,-3.48]);base(g2,3.30,1.98,[0,1.02,0]);for(const x of [-1.32,1.32])post(g2,[x,.18,-.40],.76,M,.065);
 for(const x of [-.77,.77])post(g2,[x,1.18,-.06],1.26,M,.060);
 const optic=group(g2,[0,2.85,.10]);box(optic,2.30,.20,.27,M.blued,[0,0,-.28]);
 const iris=[];
 for(const x of [-.77,.77]){
  const head=group(optic,[x,0,0]);bore(head,.405,.49,.52,[0,0,-.08]);
  for(const z of [-.31,.16,.24])ring(head,.46,.016,M.edge,[0,0,z],[0,0,0]);
  bore(head,.405,.495,.035,[0,0,.274]);
  const l=cyl(head,.40,.035,M.lens,[0,0,.17]);l.rotation.x=Math.PI/2;
  // Blades slide underneath the annular housing, never visibly outside the barrel.
  const bladeMat=M.blued.clone(),center=v([3.3+x,2.85,-3.38]);bladeMat.clippingPlanes=Array.from({length:24},(_,j)=>{const a=j*TAU/24,n=v([-Math.cos(a),-Math.sin(a),0]);return new T.Plane(n,.405-n.dot(center));});bladeMat.clipShadows=true;
  for(let j=0;j<8;j++){
   const a=j*TAU/8,leaf=group(head,[Math.cos(a)*.365,Math.sin(a)*.365,.245+j*.0015]);leaf.rotation.z=a;
   const shape=new T.Shape();shape.moveTo(0,-.035);shape.quadraticCurveTo(-.36,-.24,-.42,-.10);shape.lineTo(-.20,.16);shape.quadraticCurveTo(-.05,.10,0,.035);shape.closePath();
   mesh(leaf,new T.ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false}),bladeMat);iris.push({g:leaf,a});
  }
  sphere(head,.022,M.edge,[.365,0,.273]);
 }
 sign(g2,'MAC / IP',[-.77,3.42,.40],1.14,.23);sign(g2,'销售留痕',[.77,3.42,.40],1.18,.23);
 for(const x of [-.77,.77])bar(g2,[x,3.28,.22],[x,3.36,.40],.018,M.brass);
 const scan=group(g2,[0,2.34,.62]);bar(scan,[-1.35,0,0],[1.35,0,0],.017,M.teal);
 for(const x of [-1.35,1.35]){bar(g2,[x,2.18,.62],[x,3.48,.62],.029,M.steel);bore(scan,.031,.063,.15,[x,0,0],'y');}
 const choices=flip(g2,'自主修改？ / 存在诱导？',[0,4.06,.02],2.87,.30);
 sign(g2,'03 · 留痕核查',[0,1.22,.85],1.90,.25);
 const opticalGear=gear(g2,.25,18,[1.35,1.64,.12],M);shaft(g2,[1.35,1.64,.12]);

 // The center is an armillary filing instrument: three levels, never three verdicts.
 const hub=group(root,[0,0,.0]);cyl(hub,1.25,.17,M.wood,[0,.25,0]);cyl(hub,1.29,.025,M.edge,[0,.35,0]);
 post(hub,[0,.38,0],1.12,M,.12);const frame=group(hub,[0,2.60,0]);
 const orbit=[];for(const [r,rot] of [[1.16,[.25,0,.22]],[.94,[-.36,.12,-.38]],[.72,[.12,.40,.44]]]){const g=group(frame);ring(g,r,.027,M.brass,[0,0,0],rot);orbit.push(g);}
 bar(hub,[0,1.50,0],[0,3.85,0],.052,M.steel);sphere(hub,.095,M.edge,[0,3.90,0]);
 const filing=[],filingPorts=[];for(const [txt,p,w] of [['客户 A017',[-.88,2.06,.92],1.30],['归属经理 M04',[.82,2.80,.95],1.66],['所属营业部 B02',[-.22,3.54,1.18],1.97]]){
  bar(hub,[0,p[1],0],p,.027,M.brass);sign(hub,txt,p,w,.25);
  const port=[p[0]+w/2+.14,p[1]-.02,p[2]];filingPorts.push(port);filing.push(lamp(hub,port));
 }
 // One identity passes through ownership relations; these are not liability findings.
 const filingPoints=[
  [[3.30,2.47,-2.30],[2.26,2.13,-2.25],[.1,1.54,-1.55],[-.26,1.83,.20],filingPorts[0]],
  [filingPorts[0],[.16,2.15,1.50],[1.45,2.32,1.52],filingPorts[1]],
  [filingPorts[1],[1.95,3.11,1.38],[1.52,3.52,1.52],filingPorts[2]],
  [filingPorts[2],[1.55,3.78,1.62],[2.35,3.40,1.60],[2.27,2.47,1.60],[1.76,2.31,1.53]]
 ];
 const filingCurves=filingPoints.map(points=>{const line=new T.CatmullRomCurve3(points.map(v));mesh(root,new T.TubeGeometry(line,100,.019,8,false),M.brass);return line;});
 const filingBead=sphere(root,.073,M.teal,filingPoints[0][0]);
 for(const [x,z,y] of [[2.26,-2.62,1.40],[1.25,-1.87,1.44],[.1,-1.55,1.54]])post(root,[x,.15,z],y-.15,M,.024);
 const countPanel=flip(hub,`异常客户 ${alertExample.anomalousClients} 人`,[0,1.18,1.63],2.32,.31);
 sign(hub,`示例 · 高风险阈值 ≥${alertExample.highRiskThreshold}人`,[0,.71,1.63],2.32,.22);
 // A supported annunciator and a recessed ball elevator share the threshold event.
 const alertStand=[1.76,0,1.53];base(hub,.64,.65,[alertStand[0],.25,alertStand[2]]);
 post(hub,[alertStand[0],.40,alertStand[2]],1.13,M,.046);
 cyl(hub,.158,.06,M.brass,[alertStand[0],2.18,alertStand[2]]);
 const warning=sphere(hub,.14,M.dark.clone(),[alertStand[0],2.31,alertStand[2]]);
 ring(hub,.142,.018,M.edge,[alertStand[0],2.19,alertStand[2]]);
 bar(hub,[alertStand[0],1.50,alertStand[2]],[alertStand[0],2.18,alertStand[2]],.033,M.brass);
 const warningLight=new T.PointLight(0xff301e,0,2.2,2);warningLight.position.set(alertStand[0],2.28,alertStand[2]);hub.add(warningLight);
 const launcher=[1.76,1.68,1.96],liftTravel=.27;
 // The open brass sleeve hides the ball below its rim until the plunger lifts it.
 bore(hub,.137,.173,.31,[launcher[0],launcher[1]-.17,launcher[2]],'y');
 bar(hub,[launcher[0],.42,launcher[2]],[launcher[0],1.36,launcher[2]],.047,M.steel);
 const lift=group(hub,[launcher[0],1.28,launcher[2]]);cyl(lift,.126,.035,M.brass);bar(lift,[0,-.20,0],[0,0,0],.037,M.steel);
 sign(hub,'告警',[1.76,1.94,1.59],.65,.22);
 const alertPoints=[launcher,[2.23,1.64,2.10],[2.90,1.60,2.67],[3.62,1.68,2.92],[4.40,1.72,2.92]];
 const alertCurve=new T.CatmullRomCurve3(alertPoints.map(v));
 // Twin supporting wires, a recessed start and a receiving cup keep the handoff physical.
 const railDrop=Math.sqrt((.114+.019)**2-.072**2);
 for(const side of [-1,1]){const pts=[];for(let j=0;j<=160;j++){const u=.06+j/160*.94,p=alertCurve.getPoint(u),d=alertCurve.getTangent(u),n=new T.Vector3(-d.z,0,d.x).normalize();pts.push(p.addScaledVector(n,side*.072).add(v([0,-railDrop,0])).toArray());}curve(root,pts,.019,M.steel,180);}
 for(const u of [.28,.62,.94]){const p=alertCurve.getPoint(u);post(root,[p.x,.16,p.z],p.y-.28,M,.026);bar(root,[p.x-.14,p.y-.13,p.z],[p.x+.14,p.y-.13,p.z],.022,M.brass);}
 const alertBall=sphere(root,.114,M.ruby.clone(),[launcher[0],launcher[1]-liftTravel,launcher[2]]);

 // IV. An open geared press. Shafts, tooth ratio and guided slider share one input.
 const press=group(root,[4.4,0,2]);base(press,2.96,2.38,[0,.25,0]);
 for(const x of [-1.06,1.06]){post(press,[x,.40,-.22],3.48,M,.087);bar(press,[x*.70,1.08,-.04],[x*.70,3.63,-.04],.048,M.steel);}
 box(press,2.37,.20,.42,M.blued,[0,3.68,-.15]);
 const C=3.685,R=.30,L=1.10,crank=group(press,[0,C,.04]);shaft(press,[0,C,-.18],.8);
 const drivenGear=gear(press,.42,30,[0,C,-.07],M),driver=gear(press,.21,15,[-.60,C,-.07],M);shaft(press,[-.60,C,-.07]);
 const crankDisc=cyl(crank,.34,.095,M.brass,[0,0,.18]);crankDisc.rotation.x=Math.PI/2;
 ring(crank,.28,.01,M.edge,[0,0,.24],[0,0,0]);const crankPin=cyl(crank,.058,.14,M.steel,[0,R,.30]);crankPin.rotation.x=Math.PI/2;
 const rod=bar(press,[0,C+R,.36],[0,C+R-L,.36],.052,M.brass),slider=group(press,[0,C+R-L,0]);
 box(slider,1.63,.16,.33,M.blued,[0,0,-.04]);for(const x of [-.742,.742])bore(slider,.050,.105,.26,[x,0,-.04],'y');
 bar(slider,[0,0,.03],[0,-.59,.03],.083,M.steel);box(slider,.48,.09,.44,M.brass,[0,-.635,.03]);
 const handle=wheel(press,.34,[-1.40,2.38,-.10],M);shaft(press,[-1.40,2.38,-.30]);
 // The drive shaft is bridged by two equal pulleys and an explicit belt.
 const pA=[-1.4,2.38,-.39],pB=[-.60,C,-.39];for(const p of [pA,pB]){const pu=cyl(press,.14,.08,M.brass,p);pu.rotation.x=Math.PI/2;ring(press,.14,.014,M.dark,[p[0],p[1],p[2]+.045],[0,0,0]);}
 {const a=new T.Vector2(...pA),b=new T.Vector2(...pB),d=b.clone().sub(a).normalize(),n=new T.Vector2(-d.y,d.x),pts=[];for(let i=0;i<=32;i++){const q=i/32*Math.PI,o=n.clone().multiplyScalar(Math.cos(q)).addScaledVector(d,-Math.sin(q)).multiplyScalar(.14);pts.push([a.x+o.x,a.y+o.y,-.36]);}for(let i=0;i<=32;i++){const q=i/32*Math.PI,o=n.clone().multiplyScalar(-Math.cos(q)).addScaledVector(d,Math.sin(q)).multiplyScalar(.14);pts.push([b.x+o.x,b.y+o.y,-.36]);}pts.push(pts[0]);curve(press,pts,.014,M.leather,120);}
 sign(press,'04 · 人工专项核查',[0,.66,.85],2.05,.27);
 const accepted=flip(press,'告警受理',[.90,1.72,1.32],.97,.22);
 bore(press,.121,.164,.10,[0,1.60,.92],'y');post(press,[0,.40,.92],1.18,M,.042);cyl(press,.12,.032,M.brass,[0,1.59,.92]);
 // A graceful return conduit, with an actual supporting stand at each bend.
 const fbPts=[[4.4,.68,3.25],[4.9,.68,3.85],[2.4,.68,4.55],[-1.3,.68,4.55],[-4.8,.68,3.90],[-3.02,.75,1.16]];
 const feedbackCurve=new T.CatmullRomCurve3(fbPts.map(v));mesh(root,new T.TubeGeometry(feedbackCurve,180,.028,8,false),M.brass);
 for(const p of [[4.9,.0,3.85],[2.4,0,4.55],[-1.3,0,4.55],[-4.8,0,3.9]])post(root,p,.65,M,.025);
 post(root,[-3.02,.0,1.16],.70,M,.023);
 const feedback=sphere(root,.071,M.teal,fbPts[0]);sign(root,'核查反馈 · 规则优化',[0,.72,4.55],2.20,.23).rotation.x=-.35;

 function routeU(t){return U1*ramp(t,7,8.7)+(U2-U1)*ramp(t,12,13.3)+(1-U2)*ramp(t,21,22.6);}
 function carrierAt(t){return path.getPoint(routeU(t)).add(v([0,.15,0]));}
 function update(t){
  const u=routeU(t),p=path.getPoint(u),dir=path.getTangent(Math.min(.99999,Math.max(.00001,u)));carrier.position.copy(p);carrier.rotation.set(-Math.atan2(dir.y,Math.hypot(dir.x,dir.z)),Math.atan2(dir.x,dir.z),0,'YXZ');
  for(const w of wheels){const wu=Math.max(0,Math.min(1,u+w.z/total)),wp=railPoint(wu,w.x),td=path.getTangent(wu);w.g.position.copy(wp).add(v([0,.173,0]));w.g.rotation.set(u*total/.12,Math.atan2(td.x,td.z),0,'YXZ');}
  const reading=ramp(t,3.5,5.0);needles[0].rotation.z=70*Math.PI/180;needles[1].rotation.z=lerp(70,0,reading)*Math.PI/180;
  delta.rotation.x=Math.PI*(1-ramp(t,5.05,5.55));meterGear.rotation.z=-reading*1.22;meterPinion.rotation.z=reading*2.44;
  const align=ramp(t,8.9,9.7);slideA.position.x=lerp(-.90,-.73,align);slideB.position.x=lerp(.90,.73,align);screwDrive.rotation.x=-.17/.16*TAU*align;compareWheel.rotation.z=-.17/.16*TAU*align;
  mismatch.rotation.x=Math.PI*(1-ramp(t,9.75,10.25));trade.rotation.x=Math.PI*(1-ramp(t,10.7,11.2));
  valve.rotation.y=Math.PI/2*ramp(t,10.8,11.3);drop.position.y=2.34-.29*ramp(t,11.25,11.7);drop.scale.setScalar(.02+.98*(ramp(t,11.1,11.22)-ramp(t,11.75,11.90)));
  iris.forEach(({g,a})=>g.rotation.z=a+1.10*ramp(t,13.5,14.2));scan.position.y=2.34+1.04*ramp(t,13.6,14.6)-1.04*ramp(t,15.9,16.8);opticalGear.rotation.z=-TAU*.45*ramp(t,13.5,14.6);choices.rotation.x=Math.PI*(1-ramp(t,15.0,15.6));
  orbit.forEach((g,i)=>{g.rotation.y=(i%2?-1:1)*.16*ramp(t,17.8+i*.3,19.5+i*.3);});
  const filingTimes=[[17.0,18.05],[18.18,18.82],[18.95,19.50],[19.58,19.96]];
  filing.forEach((l,i)=>light(l,ramp(t,filingTimes[i][1]-.04,filingTimes[i][1]+.12)));
  let filingStage=0;for(let i=1;i<4;i++)if(t>=filingTimes[i][0])filingStage=i;
  filingBead.position.copy(filingCurves[filingStage].getPoint(ramp(t,...filingTimes[filingStage])));
  countPanel.rotation.x=Math.PI*(1-ramp(t,19.48,19.84));
  const alarm=Number(qualifiesForAlert)*ramp(t,19.96,20.14),release=Number(qualifiesForAlert)*ramp(t,20.30,20.62),dispatch=Number(qualifiesForAlert)*ramp(t,20.72,22.65);
  light(warning,alarm,M.ruby);warning.material.emissiveIntensity=alarm*.75;warningLight.intensity=alarm*1.1;
  lift.position.y=1.28+liftTravel*release;
  alertBall.position.copy(alertCurve.getPoint(dispatch));alertBall.position.y-=liftTravel*(1-release);
  alertBall.material.emissive.copy(M.ruby.color);alertBall.material.emissiveIntensity=alarm*.38;
  accepted.rotation.x=Math.PI*(1-ramp(t,22.68,23.10));
  const theta=TAU*ramp(t,22.8,26),px=R*Math.sin(theta),py=C+R*Math.cos(theta),sy=py-Math.sqrt(L*L-px*px);crank.rotation.z=-theta;drivenGear.rotation.z=-theta;driver.rotation.z=theta*2+Math.PI/15;handle.rotation.z=theta*2;
  slider.position.y=sy;const a=v([px,py,.36]),b=v([0,sy,.36]);rod.position.copy(a.clone().add(b).multiplyScalar(.5));rod.quaternion.setFromUnitVectors(v([0,1,0]),b.clone().sub(a).normalize());stamp.material.opacity=ramp(t,24.38,24.52);
  feedback.position.copy(feedbackCurve.getPoint(ramp(t,26,28.8)));pawl.rotation.z=-.18*(ramp(t,28.72,28.88)-ramp(t,29.0,29.25));
  return {caseId:'A017',u,casePosition:p.toArray(),assessment:[1,1+reading*2],filing:{stage:filingStage,position:filingBead.position.toArray(),client:'A017',manager:'M04',branch:'B02'},alert:{countExample:alertExample.anomalousClients,threshold:alertExample.highRiskThreshold,qualifies:qualifiesForAlert,alarm,release,dispatch,ball:alertBall.position.toArray(),accepted:ramp(t,22.68,23.10)},press:{theta,pin:[px,py],sliderY:sy,rodLength:Math.hypot(px,py-sy),contactGap:sy-.68-(Y0+top)},panels:[delta.rotation.x,mismatch.rotation.x,trade.rotation.x,choices.rotation.x,countPanel.rotation.x,accepted.rotation.x],scanY:scan.position.y,stampOpacity:stamp.material.opacity,feedbackPosition:feedback.position.toArray()};
 }
 return {update,carrierAt,routeU,labels,path,pressCenter:[4.4,2.28,2],worldBounds:[[-6,0,-4.8],[6,4.3,5]],feedbackAt:t=>feedbackCurve.getPoint(ramp(t,26,28.8))};
}
