import * as T from 'three';
import {TAU,group,mesh,box,cyl,sphere,bar,ring,curve,lathe,screw,post,bearing,wheel,plaque,paper,dial,ramp,lerp,textTexture} from './mechanics.mjs';

// A constrained kinematic model: shared axes, real bearing bores and screw lead.
export function createLaboratory(scene,M){
 const root=group(scene),tracks=[],rollers=[],meters=[],LEAD=.35,outer=7.30,inner=3.18;
 function bore(parent,ri,ro,len,p,mat=M.brass){const o=lathe(parent,[[ri,-len/2],[ro,-len/2],[ro,len/2],[ri,len/2],[ri,-len/2]],mat,p);o.rotation.x=Math.PI/2;return o;}
 function hub(parent,p,r=.13,len=.22){bore(parent,.085,r,len,p);}
 function base(parent,w,d,p){box(parent,w,.22,d,M.wood,p,.10);box(parent,w+.035,.036,d+.035,M.edge,[p[0],p[1]+.12,p[2]],.06);for(const x of [-w/2+.14,w/2-.14])for(const z of [-d/2+.14,d/2-.14])screw(parent,[p[0]+x,p[1]+.155,p[2]+z],M,.7);}
 function card(parent,text,p,accent=M.teal){const g=group(parent,p);box(g,.88,.18,1.02,M.blued);box(g,.78,.08,.92,accent,[0,.13,0]);for(const x of [-.35,.35]){bar(g,[x,.185,-.38],[x,.185,.38],.015,M.brass);screw(g,[x,.20,.35],M,.6);}paper(g,.56,.60,[0,.185,0],M,text);return g;}
 function track(theta,idx,text){const g=group(root);g.rotation.y=theta;const start=2.43,end=8.10;
  base(g,1.30,5.85,[0,.68,5.43]);
  for(const x of [-.39,.39]){bar(g,[x,1.16,start],[x,1.16,end],.065,M.steel);for(const z of [2.55,8.02]){box(g,.22,.30,.25,M.blued,[x,.96,z]);hub(g,[x,1.16,z],.115,.25);screw(g,[x,.83,z+.12],M,.6);}}
  const lead=group(g,[0,1.0,0]);bar(lead,[0,0,2.72],[0,0,8.42],.071,M.steel);
  const pts=[];for(let i=0;i<=850;i++){let z=2.74+i/850*5.52,a=(z-2.74)/LEAD*TAU;pts.push([.094*Math.cos(a),.094*Math.sin(a),z]);}curve(lead,pts,.014,M.edge,850);
  for(const z of [2.77,8.16]){box(g,.30,.26,.28,M.blued,[0,.87,z]);bore(g,.074,.145,.26,[0,1,z]);screw(g,[.105,1.02,z],M,.6);}
  const hand=wheel(g,.24,[0,1,8.0],M);hand.rotation.y=Math.PI;
  const carriage=group(g,[0,0,outer]);box(carriage,1.02,.18,1.10,M.blued,[0,1.36,0]);
  for(const x of [-.39,.39]){bore(carriage,.067,.12,.72,[x,1.16,0]);for(const z of [-.39,.39])screw(carriage,[x,1.47,z],M,.6);}
  bore(carriage,.095,.18,.42,[0,1,0]);box(carriage,.24,.25,.28,M.brass,[0,1.18,0]);
  card(carriage,text,[0,1.49,0]);
  for(const z of [2.53,8.30])box(g,1.10,.16,.14,M.brass,[0,1.28,z]);
  base(g,2.90,2.30,[0,.50,8.80]);
  // Each source has its own short engraved identification, never a paragraph sheet.
  const sign=plaque(g,text,[0,1.10,9.82],1.18,.38,M);sign.rotation.x=-.18;
  const t={g,theta,carriage,lead,hand,idx,text};tracks.push(t);return t;
 }
 const coordinates=[[-7,-4.8],[7,-4.8],[-7,4.8],[7,4.8]];
 ['档案','问卷','测评','交易'].forEach((s,i)=>track(Math.atan2(coordinates[i][0],coordinates[i][1]),i,s));
 // Archive: drawer cabinet, thumb pulls, index tabs and mechanical clamping jaws.
 {const g=tracks[0].g;box(g,1.78,1.28,.70,M.wood,[0,1.31,8.84]);for(let i=0;i<3;i++){box(g,1.60,.32,.09,M.blued,[0,.9+i*.38,9.25]);bar(g,[-.20,.9+i*.38,9.34],[.20,.9+i*.38,9.34],.025,M.brass);for(const x of [-.23,.23])bar(g,[x,.9+i*.38,9.28],[x,.9+i*.38,9.34],.022,M.brass);}for(const x of [-.73,.73])post(g,[x,.66,8.45],1.5,M,.06);}
 // Questionnaire: supported rollers feed a continuous perforated strip.
 {const g=tracks[1].g;for(const z of [8.35,9.17]){for(const x of [-.73,.73]){box(g,.18,.75,.25,M.blued,[x,1.06,z]);const b=cyl(g,.14,.20,M.brass,[x,1.43,z]);b.rotation.z=Math.PI/2;}const r=group(g,[0,1.43,z]);const c=cyl(r,.19,1.48,M.ivory);c.rotation.z=Math.PI/2;bar(r,[-.86,0,0],[.86,0,0],.055,M.steel);rollers.push(r);}box(g,1.28,.025,.84,M.ivory,[0,1.61,8.76]);for(const x of [-.55,.55])for(let j=0;j<6;j++)cyl(g,.032,.006,M.ink,[x,1.628,8.42+j*.135]);for(let j=0;j<3;j++){box(g,.10,.005,.10,M.teal,[.05,1.628,8.48+j*.26]);box(g,.4,.005,.017,M.ink,[-.23,1.628,8.48+j*.26]);}}
 // Assessment: two sliders on one exact five-level scale (R1 to R3).
 {const g=tracks[2].g;box(g,2.20,.16,1.20,M.blued,[0,1.03,8.78]);paper(g,2.02,.90,[0,1.13,8.78],M);for(let i=0;i<5;i++){const x=-.82+i*.41;bar(g,[x,1.16,8.44],[x,1.16,8.98],.012,M.brass);const p=plaque(g,'R'+(i+1),[x,1.175,9.08],.32,.18,M);p.rotation.x=-Math.PI/2;}for(const z of [8.52,8.80]){bar(g,[-.95,1.24,z],[.95,1.24,z],.035,M.steel);const a=group(g,[-.82,1.24,z]);bore(a,.037,.076,.18,[0,0,0],M.brass).rotation.set(0,0,Math.PI/2);const tip=box(a,.09,.13,.11,z<8.6?M.teal:M.amber,[0,.10,0]);meters.push(a);}}
 // Transaction: burette, stopcock and receiving vessel; the glass path is connected.
 let valve,drop;
 {const g=tracks[3].g;post(g,[-.87,.65,8.64],2.72,M,.065);for(const y of [1.50,2.80]){bar(g,[-.87,y,8.64],[.1,y,8.64],.025,M.brass);ring(g,.18,.018,M.brass,[.1,y,8.64]);}lathe(g,[[.10,0],[.14,.06],[.14,1.85],[.10,1.92]],M.glass,[.1,1.18,8.64]);cyl(g,.105,1.1,M.liquid,[.1,1.85,8.64]);for(let i=0;i<14;i++)bar(g,[-.04,1.45+i*.1,8.782],[i%5===0?.11:.04,1.45+i*.1,8.782],.005,M.ivory);
  cyl(g,.14,.17,M.brass,[.1,1.22,8.64]);valve=group(g,[.1,1.21,8.64]);bar(valve,[-.28,0,0],[.28,0,0],.023,M.brass);sphere(valve,.065,M.blued);
  lathe(g,[[.16,0],[.19,.05],[.17,.30],[.08,.46],[.055,.64]],M.glass,[.1,.67,8.64]);cyl(g,.135,.15,M.liquid,[.1,.79,8.64]);drop=sphere(g,.036,M.liquid,[.1,1.05,8.64]);}
 // Central optical chamber: four unobstructed radial receiving mouths.
 const central=group(root);for(const [r,y,h,m] of [[2.67,.31,.50,M.wood],[2.72,.58,.06,M.edge],[2.54,.70,.18,M.blued],[2.35,.82,.06,M.brass]])cyl(central,r,h,m,[0,y,0]);
 for(let i=0;i<4;i++){const a=tracks[i].theta,x=Math.sin(a),z=Math.cos(a);const socket=group(central,[x*2.46,1.50,z*2.46]);socket.rotation.y=a;box(socket,1.14,.12,.44,M.brass);for(const xx of [-.55,.55])box(socket,.08,.34,.47,M.blued,[xx,.11,0]);}
 for(let i=0;i<8;i++){const a=i*TAU/8;post(central,[Math.sin(a)*1.91,.86,Math.cos(a)*1.91],2.45,M,.055);}
 lathe(central,[[1.55,3.29],[1.90,3.29],[1.90,3.39],[1.55,3.39],[1.55,3.29]],M.blued);ring(central,1.88,.025,M.brass,[0,3.40,0]);
 for(let i=0;i<64;i++){const a=i*TAU/64;bar(central,[Math.sin(a)*1.65,3.39,Math.cos(a)*1.65],[Math.sin(a)*(i%4?1.72:1.78),3.39,Math.cos(a)*(i%4?1.72:1.78)],.008,M.ivory);}
 cyl(central,1.72,.055,M.lens,[0,2.03,0]);ring(central,1.73,.035,M.brass,[0,2.06,0]);
 post(central,[0,.84,0],1.95,M,.15);const rotor=group(central,[0,2.80,0]);
 bar(rotor,[-1.45,0,0],[1.45,0,0],.055,M.blued);for(const x of [-1.45,1.45]){cyl(rotor,.22,.24,M.brass,[x,-.08,0]);cyl(rotor,.175,.03,M.lens,[x,-.215,0]);ring(rotor,.20,.016,M.edge,[x,-.23,0]);}
 const lightMat=new T.MeshBasicMaterial({color:'#5bded8',transparent:true,opacity:.12,depthWrite:false});const beam=mesh(rotor,new T.ConeGeometry(.48,.70,32,1,true),lightMat,[1.45,-.60,0],false);
 const result=plaque(central,'待核查',[0,3.94,1.32],1.62,.48,M);post(central,[-.75,3.33,1.32],.43,M,.035);post(central,[.75,3.33,1.32],.43,M,.035);
 const d=dial(central,[0,1.31,2.18],.33,M,'月度');
 // A separate output slide sits between radial tracks, with the same screw constraint.
 const output=group(root);base(output,1.35,4.55,[0,.68,4.93]);for(const x of [-.39,.39]){bar(output,[x,1.16,2.63],[x,1.16,7.30],.065,M.steel);for(const z of [2.70,7.18]){box(output,.22,.30,.25,M.blued,[x,.96,z]);hub(output,[x,1.16,z],.115,.25);}}
 const outLead=group(output,[0,1,0]);bar(outLead,[0,0,2.63],[0,0,7.23],.071,M.steel);const outPts=[];for(let i=0;i<=620;i++){let z=2.65+i/620*4.50,a=(z-2.65)/LEAD*TAU;outPts.push([.094*Math.cos(a),.094*Math.sin(a),z]);}curve(outLead,outPts,.014,M.edge,620);for(const z of [2.76,7.13]){box(output,.30,.26,.24,M.blued,[0,.87,z]);bore(output,.074,.145,.24,[0,1,z]);}
 const outWheel=wheel(output,.30,[0,1,7.38],M),outCar=group(output,[0,0,3.26]);box(outCar,1.02,.18,1.10,M.blued,[0,1.36,0]);for(const x of [-.39,.39])bore(outCar,.067,.12,.72,[x,1.16,0]);bore(outCar,.095,.18,.42,[0,1,0]);box(outCar,.24,.25,.28,M.brass,[0,1.18,0]);const evidence=card(outCar,'线索',[0,1.49,0]);
 // Guided slider crank. Rigid rod endpoints are solved from the same crank pin.
 const press=group(root,[0,0,6.50]);base(press,3.30,2.32,[0,.50,0]);
 for(const x of [-1.20,1.20]){post(press,[x,.66,0],3.56,M,.10);bar(press,[x*.64,.89,-.08],[x*.64,3.80,-.08],.065,M.steel);box(press,.29,.30,.31,M.blued,[x*.64,.78,-.08]);for(const yy of [.96,3.77]){cyl(press,.13,.13,M.brass,[x*.64,yy,-.08]);}}
 box(press,2.70,.28,.48,M.blued,[0,3.76,-.10]);
 const crank=group(press,[0,3.80,.16]);bar(press,[0,3.8,-.65],[0,3.8,.33],.085,M.steel);bore(press,.087,.18,.30,[0,3.80,-.24]);
 const disc=cyl(crank,.36,.12,M.brass);disc.rotation.x=Math.PI/2;ring(crank,.30,.015,M.edge,[0,0,.075],[0,0,0]);const pin=cyl(crank,.071,.16,M.steel,[0,.28,.17]);pin.rotation.x=Math.PI/2;
 const rod=bar(press,[0,4.08,.30],[0,3.03,.30],.075,M.brass);const slider=group(press,[0,3.03,0]);box(slider,1.64,.22,.36,M.blued,[0,0,-.08]);for(const x of [-.768,.768]){const s=lathe(slider,[[.067,-.20],[.13,-.20],[.13,.20],[.067,.20],[.067,-.20]],M.brass,[x,0,-.08]);}bar(slider,[0,0,0],[0,-.645,0],.10,M.steel);box(slider,.54,.13,.50,M.brass,[0,-.710,0]);
 const lowerPin=cyl(slider,.11,.34,M.steel,[0,0,.20]);lowerPin.rotation.x=Math.PI/2;
 const manual=wheel(press,.40,[-1.43,2.20,.30],M);bar(press,[-1.43,2.2,-.65],[-1.43,2.2,.30],.07,M.steel);box(press,.35,.52,.30,M.blued,[-1.43,2.0,-.18]);
 // Equal pulleys and an open leather belt couple the handwheel to the crankshaft.
 for(const p of [[-1.43,2.20,-.53],[0,3.80,-.53]]){const pu=cyl(press,.20,.09,M.brass,p);pu.rotation.x=Math.PI/2;ring(press,.183,.017,M.dark,[p[0],p[1],p[2]+.03],[0,0,0]);}
 {const a=new T.Vector2(-1.43,2.20),b=new T.Vector2(0,3.80),n=b.clone().sub(a).normalize(),normal=new T.Vector2(-n.y,n.x),pts=[];for(let i=0;i<=40;i++){let th=i/40*Math.PI;const v=normal.clone().multiplyScalar(Math.cos(th)).add(n.clone().multiplyScalar(-Math.sin(th))).multiplyScalar(.205);pts.push([a.x+v.x,a.y+v.y,-.50]);}for(let i=0;i<=40;i++){let th=i/40*Math.PI;const v=normal.clone().multiplyScalar(-Math.cos(th)).add(n.clone().multiplyScalar(Math.sin(th))).multiplyScalar(.205);pts.push([b.x+v.x,b.y+v.y,-.50]);}pts.push(pts[0]);curve(press,pts,.022,M.leather,180);}
 plaque(press,'人工复核',[0,4.38,.06],2.05,.40,M);const stamp=mesh(evidence,new T.PlaneGeometry(.43,.19),new T.MeshBasicMaterial({map:textTexture('留痕',{w:512,h:200,size:115}),toneMapped:false}),[0,.207,0],false);stamp.rotation.x=-Math.PI/2;
 function travel(i,t){const starts=[7.3,12.8,17.8,22.9],ends=[11.0,16,21,26];const q=ramp(t,starts[i],ends[i]);const startOffset=i===0?.30*ramp(t,0,2.5):0;return outer-startOffset-(1.28-startOffset)*q-(outer-1.28-inner)*ramp(t,28+i*.12,33+i*.12);}
 function carrierAt(i,t){const r=travel(i,t),th=tracks[i].theta;return new T.Vector3(Math.sin(th)*r,1.8,Math.cos(th)*r);}
 function outputAt(t){return new T.Vector3(0,1.8,lerp(3.26,6.50,ramp(t,41.2,46.2)));}
 function update(t){for(const s of tracks){const r=travel(s.idx,t),a=(outer-r)/LEAD*TAU;s.carriage.position.z=r;s.lead.rotation.z=a;s.hand.rotation.z=-a;}
  rollers.forEach((r,i)=>r.rotation.x=(t>12?Math.min(t-12,4):0)*3);meters[0].position.x=-.82;meters[1].position.x=lerp(-.82,0,ramp(t,18,20));
  valve.rotation.z=Math.PI/2*ramp(t,22.8,23.5);drop.visible=t>=23.5&&t<26;drop.position.y=1.08-((Math.max(0,t-23.5)*2)%1)*.30;
  rotor.rotation.y=lerp(0,TAU*1.2,ramp(t,34,39));beam.visible=t>=34&&t<40;result.visible=t>=37.2;result.position.y=lerp(3.16,3.94,ramp(t,37.2,37.8));d.needle.rotation.z=-t*.12;
  const op=outputAt(t);outCar.position.z=op.z;const oa=(op.z-3.26)/LEAD*TAU;outLead.rotation.z=-oa;outWheel.rotation.z=-oa;
  const theta=TAU*ramp(t,50,53),px=.28*Math.sin(theta),py=3.80+.28*Math.cos(theta),sy=py-Math.sqrt(1.05**2-px**2);crank.rotation.z=-theta;slider.position.y=sy;const a=new T.Vector3(px,py,.30),b=new T.Vector3(0,sy,.30);rod.position.copy(a.clone().add(b).multiplyScalar(.5));rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());manual.rotation.z=-theta;stamp.visible=t>=51.5;
  return {carriages:tracks.map(s=>s.carriage.position.z),outputZ:op.z,press:{theta,pin:[px,py],sliderY:sy,rodLength:Math.hypot(px,py-sy),contactGap:sy-.775-1.695},result:t>=37.5};
 }
 return {update,carrierAt,outputAt,tracks};
}
