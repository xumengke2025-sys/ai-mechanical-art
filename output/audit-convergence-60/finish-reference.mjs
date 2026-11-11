import * as T from 'three';
import {TAU,group,box,cyl,bar,ring,sphere,post,gear,wheel,screw,lathe,curve} from './mechanics.mjs';

export function walnutTexture(){
 const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d'),im=x.createImageData(1024,1024);
 for(let y=0;y<1024;y++)for(let a=0;a<1024;a++){
  const u=a/1024,v=y/1024,warp=Math.sin(v*8+Math.sin(u*5)*2)*.08+Math.sin(v*23+u*9)*.015;
  const g=Math.sin((u+warp)*185+Math.sin(v*17)*1.5),fine=Math.sin((u+warp)*729+Math.sin(v*42)*4);
  const cloud=Math.sin(u*9+v*5)*Math.sin(u*13-v*7),k=.87+cloud*.14+g*.045+fine*.022;
  const i=(y*1024+a)*4;im.data[i]=91*k;im.data[i+1]=55*k;im.data[i+2]=31*k;im.data[i+3]=255;
 }x.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=16;return t;
}

export function finishWorkshop(scene,machines,stations,M){
 // Brass corners and raised walnut panels make the bases read as cabinetmaking.
 const sizes={intro:[8.6,4.8],work:[13,9],growth:[6.8,6.2],outlook:[10.8,6.8],support:[10,6.3]};
 for(const [name,g] of Object.entries(machines)){
  const [w,d]=sizes[name];
  for(const x of [-w/2+.30,w/2-.30])for(const z of [-d/2+.30,d/2-.30]){
   bar(g,[x,.43,z],[x,1.10,z],.025,M.brass);sphere(g,.047,M.edge,[x,1.09,z]);
  }
  for(const z of [-d/2-.025,d/2+.025])for(const x of [-w*.33,w*.33]){
   box(g,w*.15,.40,.035,M.wood,[x,.76,z],.06);
   bar(g,[x-w*.07,.55,z+.025],[x+w*.07,.55,z+.025],.007,M.edge);
  }
 }
 const intro=machines.intro;
 // A visible screw thread, bearing collars and carriage fasteners.
 for(let i=0;i<70;i++){const xx=-3.3+i*.095;ring(intro,.095,.008,M.steel,[xx,1.64,-.68],[0,0,Math.PI/2]);}
 for(const x of [-3.45,3.45]){for(const y of [2.29,2.62]){const c=cyl(intro,.15,.055,M.brass,[x,y,0]);c.rotation.z=Math.PI/2;}for(const z of [-.45,.45]){screw(intro,[x,1.36,z],M);bar(intro,[x,1.38,z],[x,2.28,0],.035,M.dark);}}
 // Risk orrery: azimuth circles and graduated rim, evidence pins remain visible.
 const risk=stations.risk;
 for(const r of [1.08,1.24])ring(risk,r,.012,M.edge,[0,1.67,0]);
 for(let i=0;i<32;i++){const a=i*TAU/32;bar(risk,[Math.cos(a)*1.22,1.68,Math.sin(a)*1.22],[Math.cos(a)*1.30,1.68,Math.sin(a)*1.30],.006,M.ink);}
 for(const x of [-1.65,1.65]){cyl(risk,.15,.09,M.brass,[x,1.52,.43]);}
 // Roll holders, small handwheel and the reviewer lever.
 const comp=stations.compliance;
 wheel(comp,.26,[1.88,2.04,.70],M);for(const z of [-.85,.70])for(const x of [-1.05,1.75]){bar(comp,[x,1.51,z],[x,2.05,z],.055,M.dark);screw(comp,[x,1.51,z],M,.65);}
 const audit=stations.audit;
 for(const x of [-1.65,1.65]){cyl(audit,.17,.05,M.brass,[x,1.51,0]);screw(audit,[x,1.54,.1],M,.65);}
 const growth=machines.growth;
 for(const y of [1.53,1.67,4.43,4.61])ring(growth,1.31,.018,M.edge,[0,y,0]);
 // An engraved indexing dial behind the rotating memory leaves.
 for(let i=0;i<48;i++){const a=i*TAU/48;bar(growth,[Math.cos(a)*1.25,4.68,Math.sin(a)*1.25],[Math.cos(a)*1.38,4.68,Math.sin(a)*1.38],.009,M.ink);}
 const outlook=machines.outlook;
 for(const x of [-2.9,2.9]){box(outlook,.22,.18,1.65,M.brass,[x,1.48,-1.65]);screw(outlook,[x,1.58,-1.0],M);}
 const support=machines.support;
 for(const x of [-3.3,3.3]){bar(support,[x-.4,1.35,0],[x,2.5,0],.045,M.dark);bar(support,[x+.4,1.35,0],[x,2.5,0],.045,M.dark);}
 // Period context is fully spatial: columns, wall drawings and a side-table armillary.
 for(const x of [-26,31]){
  lathe(scene,[[.8,0],[.8,.25],[.62,.45],[.48,.7],[.48,10.9],[.64,11.15],[.8,11.3],[.8,11.5]],M.trim,[x,0,-16.9]);
  for(let i=0;i<16;i++){const a=i*TAU/16;bar(scene,[x+Math.cos(a)*.486,.8,-16.9+Math.sin(a)*.486],[x+Math.cos(a)*.486,10.8,-16.9+Math.sin(a)*.486],.014,M.wall);}
 }
 const table=group(scene,[-24,0,4]);box(table,5,.30,3.2,M.wood,[0,2.05,0]);
 for(const x of [-2,2])for(const z of [-1.05,1.05])post(table,[x,.12,z],1.8,{...M,brass:M.wood},.10);
 post(table,[0,2.23,0],.50,M,.08);const globe=group(table,[0,3.70,0]);
 for(const a of [0,.8,1.6])ring(globe,1.04,.025,M.brass,[0,0,0],[Math.PI/2,a,.35]);
 ring(globe,1.13,.025,M.edge,[0,0,0],[.32,0,.2]);sphere(globe,.10,M.ivory);bar(globe,[0,-1.2,0],[0,1.2,0],.025,M.steel);
 // Empty side wall gets a framed geometrical study, never invented historical lettering.
 const art=group(scene,[-8,7.4,-17.0]);box(art,3.4,2.7,.10,M.wood);box(art,3.2,2.5,.11,M.paper);
 for(const r of [.45,.78,1.05])ring(art,r,.012,M.ink,[0,0,.07],[0,0,0]);
 for(let i=0;i<8;i++){const a=i*TAU/8;bar(art,[0,0,.08],[Math.cos(a)*1.15,Math.sin(a)*1.15,.08],.007,M.ink);}
}
