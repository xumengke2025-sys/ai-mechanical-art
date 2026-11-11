import * as k from 'file:///D:/Codex/skills/anatomy/kit/iso-kit.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const W=1440,H=810;
const P=k.fitProjection(k.boxCorners({x:-320,y:-205,w:640,d:410,r:12},-19,93),W,H,{pad:65,azimuth:38,elevation:35});
const at=p=>k.iso(p,P),line=(a,b,z)=>k.lineOnTop(a,b,z,P);
let count=0;
function box(x,y,w,d,z,h,mat='brass',r=1.2){count++;return `<g class="${mat}">${k.solidSvg(k.slabOf({x,y,w,d,r},z,h,P,4,Math.min(.8,h/3)),{tone:'mid'})}</g>`}
const rule=(a,b,z,free=false)=>k.lineSvg(line(a,b,z),{tone:'lo',free});
const bolt=(x,y,z)=>box(x-1.2,y-1.2,2.4,2.4,z,.9,'steel',.3);
const pins=(x,y,w,d,z)=>[[x+4,y+4],[x+w-4,y+4],[x+4,y+d-4],[x+w-4,y+d-4]].map(([a,b])=>bolt(a,b,z)).join('');
const group=(id,s)=>`<g id="${id}">${s}</g>`;
function sheet(x,y,w,d,z){let b=box(x,y,w,d,z,.8,'paper',.3);for(let i=0;i<5;i++)b+=rule([x+3,y+4+i*4],[x+w-4-(i%2)*5,y+4+i*4],z+.9,true);return b}
function footing(x,y,w,d,z=3){return box(x,y,w,d,z,4,'brass',3)+box(x+3,y+3,w-6,d-6,z+4,1,'dark',2)+pins(x,y,w,d,z+4)}
function rail(x,y,w){return box(x,y,w,3,8,3,'steel',.6)+box(x,y+52,w,3,8,3,'steel',.6)}
const sites=[[-215,-112],[0,-112],[215,-112],[-215,108],[0,108],[215,108]];
const names=['多源事件采集','主体与持仓匹配','关联风险穿透','制度与知识检索','合同与规则核验','报告校验与复核'];
let base=`<path class="iso-halo" d="${k.haloOf({x:-320,y:-205,w:640,d:410,r:12},-18,12,P)}"/>`;
for(const [x,y] of [[-300,-185],[272,-185],[-300,157],[272,157],[-12,-185],[-12,157]])base+=box(x,y,28,28,-19,9,'steel',4)+box(x-2,y-2,32,32,-10,2,'brass',3);
base+=box(-320,-205,640,410,-8,8,'brass',12)+box(-313,-198,626,396,0,2,'dark',8)+pins(-311,-196,622,392,2);
base+=k.lineSvg(k.planOutline({x:-305,y:-190,w:610,d:380,r:6},2.2,P),{tone:'lo'});
for(const x of [-275,-220,-165,-110,-55,0,55,110,165,220,275])base+=bolt(x,-196,2)+bolt(x,196,2);
for(const y of [-140,-80,-20,40,100,160])base+=bolt(-310,y,2)+bolt(310,y,2);
const paths=[
{id:'r01',p:[[-153,-112,3],[-70,-112,3]],a:0,b:1},
{id:'r12',p:[[70,-112,3],[145,-112,3]],a:1,b:2},
{id:'r13',p:[[-23,-61,3],[-23,-16,3],[-215,-16,3],[-215,54,3]],a:1,b:3},
{id:'r14',p:[[22,-61,3],[22,54,3]],a:1,b:4},
{id:'r24',p:[[215,-61,3],[215,-35,3],[58,-35,3],[58,54,3]],a:2,b:4},
{id:'r35',p:[[-153,110,3],[-110,110,3],[-110,178,3],[210,178,3],[210,160,3]],a:3,b:5},
{id:'r45',p:[[70,108,3],[145,108,3]],a:4,b:5},
{id:'return',p:[[270,130,3],[292,130,3],[292,-180,3],[-215,-180,3],[-215,-165,3]],a:5,b:0},
{id:'feedback',p:[[250,160,3],[250,185,3],[-245,185,3],[-245,160,3]],a:5,b:3}
];
const pathD=p=>p.map((v,i)=>`${i?'L':'M'}${at(v).join(' ')}`).join('');
let channels='';for(const r of paths){const d=pathD(r.p);channels+=`<path d="${d}" class="channel-bed"/><path d="${d}" class="channel-core"/><path id="${r.id}" d="${d}" class="flow-route ${r.id==='return'?'back-route':''}"/>`;for(let j=0;j<3;j++)channels+=`<circle id="${r.id}-p${j}" r="3.1" class="packet"/>`}

function station(i){const [x,y]=sites[i];let b=footing(x-70,y-54,140,108);
 if(i===0){
  for(let j=0;j<7;j++){const xx=x-59+j*17;b+=box(xx,y-43,13,35,8,17,'steel',1);b+=box(xx-1,y-44,15,37,25,2,'brass');b+=sheet(xx+2,y-40,9,27,27);b+=group('feed'+j,box(xx+3,y-10,7,5,28,2,'teal'));}
  b+=box(x-61,y+8,122,5,8,3,'steel');b+=box(x-61,y+37,122,5,8,3,'steel');
  b+=group('collector',box(x-50,y+7,23,36,11,5)+box(x-47,y+11,17,28,16,13,'steel')+box(x-49,y+9,21,32,29,2)+pins(x-49,y+9,21,32,31));
 }else if(i===1){
  b+=rail(x-59,y-28,118);
  for(let j=0;j<2;j++){let c=box(x-54+j*58,y-23,50,44,11,5)+sheet(x-49+j*58,y-19,40,32,16);b+=group('match'+j,c);}
  for(let j=0;j<8;j++)b+=box(x-51+j*14,y+37,8,7,8,3,'steel');
  b+=group('matching',box(x-5,y-32,10,62,17,4,'teal'));
 }else if(i===2){
  const links=[[-44,-29],[43,-29],[-44,29],[43,29]];
  for(let j=0;j<4;j++){const [dx,dy]=links[j];b+=`<path d="${pathD([[x,y,9],[x+dx,y,9],[x+dx,y+dy,9]])}" class="local-link" id="local${j}"/>`;}
  for(let j=0;j<4;j++){const [dx,dy]=links[j];b+=group('relation'+j,box(x+dx-12,y+dy-10,24,20,8,10,'steel',2)+box(x+dx-13,y+dy-11,26,22,18,2)+pins(x+dx-13,y+dy-11,26,22,20));}
  b+=box(x-18,y-17,36,34,8,21,'brass',4)+box(x-14,y-13,28,26,29,3,'steel',2)+group('hub',box(x-7,y-6,14,12,32,2,'teal',1));
 }else if(i===3){
  b+=box(x-60,y-43,8,60,8,65)+box(x+51,y-43,8,60,8,65)+box(x-60,y-43,119,60,73,5);
  for(let j=0;j<4;j++){const z=9+j*15;b+=box(x-52,y-43,103,54,z,2,'steel');let c=box(x-50,y-40,99,48,z+2,3)+sheet(x-45,y-36,87,35,z+5)+box(x-50,y+6,99,3,z+5,7)+box(x-8,y+9,16,3,z+6,3,'steel');b+=group('drawer'+j,c);}
  b+=pins(x-60,y-43,119,60,78);
 }else if(i===4){
  b+=rail(x-61,y-33,122)+sheet(x-54,y-28,40,41,11)+sheet(x+8,y-28,40,41,11);
  let c=box(x-60,y-38,6,6,8,35)+box(x-60,y+25,6,6,8,35)+box(x-62,y-40,10,73,43,5)+box(x-59,y-31,4,54,39,4,'steel');b+=group('verifier',c);
  b+=box(x-52,y+39,103,6,8,2,'steel');for(let j=0;j<10;j++)b+=box(x-48+j*10,y+39,2,6,10,.6,'brass',.2);
  b+=group('rule-gauge',box(x-49,y+37,7,10,11,2,'teal',.5));
 }else{
  b+=box(x-54,y-39,10,12,8,60)+box(x+43,y-39,10,12,8,60)+box(x-57,y-43,113,19,68,7)+pins(x-57,y-43,113,19,75);
  b+=box(x-49,y-19,98,58,8,4,'steel')+box(x-48,y+33,96,4,12,7);
  b+=group('report',sheet(x-39,y-15,78,43,12.2));
  b+=group('press',box(x-4,y-36,8,8,36,32,'steel')+box(x-40,y-30,80,39,30,6,'brass',2)+pins(x-40,y-30,80,39,36));
  b+=group('gate',box(x+51,y-8,5,48,8,29,'brass')+box(x+51,y-8,5,48,37,2,'teal'));
 }
 const labelAt=at([x,y+55,5]);const lamp=at([x-62,y+46,8]);
 return `<g class="station" id="station${i}">${b}<circle class="status-lamp" id="lamp${i}" cx="${lamp[0]}" cy="${lamp[1]}" r="3"/><g transform="translate(${labelAt[0]},${labelAt[1]+15})"><rect x="-72" y="-10" width="144" height="24" rx="4" fill="#f7f1e3" stroke="#b9a276" stroke-width=".5"/><text class="module-label" y="6" text-anchor="middle">0${i+1} ${names[i]}</text></g></g>`;
}
const modules=sites.map((p,i)=>({i,depth:k.depthOf([...p,0],P)})).sort((a,b)=>a.depth-b.depth).map(s=>station(s.i)).join('');
const css=readFileSync('D:/Codex/skills/anatomy/kit/iso.css','utf8');
const svg=k.figureSvg({width:W,height:H,label:'六模块黄铜风险控制中枢：多源采集、主体持仓匹配、关联穿透、知识检索、合同规则核验、报告校验与人工复核。蓝绿信号代表证据流，琥珀色回路代表补证。',body:`<defs><linearGradient id="gold" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f2d6a0"/><stop offset=".35" stop-color="#d0ab69"/><stop offset=".65" stop-color="#e9c98d"/><stop offset="1" stop-color="#ab7b3c"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2"/></filter></defs><g id="camera">${base}${channels}${modules}</g>`});
writeFileSync(new URL('./output/risk-system.html',import.meta.url),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>风险控制中枢 · 黄铜系统演示</title><style>${css}
*{box-sizing:border-box}body{margin:0;background:#e9e5dc;color:#353c36;font-family:"Microsoft YaHei","PingFang SC",sans-serif}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid #96713a;outline-offset:3px}.shell{max-width:1600px;padding:22px 34px 18px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.brand{font:10px Consolas;letter-spacing:3px;color:#92744c;margin-bottom:8px}h1{font-size:25px;letter-spacing:3px;font-weight:500;margin:0}.scenario{display:flex;align-items:center;gap:5px;font-size:11px}.scenario span{color:#8a8376;margin-right:8px}.scenario button{padding:9px 12px;border:1px solid #cfc2a9;background:transparent;color:#87734f;border-radius:3px}.scenario button.selected{background:#6b5738;border-color:#6b5738;color:#fff5df}.film{background:#f5f1e7;border:1px solid #cdbf9f;position:relative;overflow:hidden}.iso-plate{padding:0;border:0;box-shadow:none;background:transparent;height:min(66vh,740px);min-height:430px;overflow:hidden;position:relative}.iso-svg{height:100%;width:100%;overflow:visible}.topline{position:absolute;top:17px;left:22px;right:22px;display:flex;justify-content:space-between;align-items:center;z-index:1;pointer-events:none;font:10px Consolas;letter-spacing:1px;color:#92816a}.topline b{font-weight:400;color:#3d746c}.event{position:absolute;left:24px;top:54px;width:206px;padding:14px 15px;border-left:2px solid #a67e3e;background:#fbf8f0eb;z-index:1;box-shadow:0 3px 16px #63513208}.event small{font:10px Consolas;color:#a18a66;letter-spacing:1px}.event strong{display:block;font-size:14px;font-weight:500;margin:8px 0}.event p{font-size:11px;color:#877d6d;line-height:1.8;margin:0}.monitor{position:absolute;right:24px;bottom:25px;z-index:1;background:#faf7efed;border:1px solid #ddd1b9;width:205px;padding:13px 15px}.monitor small{font-size:10px;color:#a08b68;letter-spacing:1px}.monitor div{display:flex;justify-content:space-between;align-items:center;margin-top:9px;font-size:11px;color:#847d6c}.monitor b{font-size:14px;font-weight:500;color:#44756b}.monitor .hold{color:#a66c2f}.caption{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:center;padding:18px 25px;border-top:1px solid #d7ccb7;min-height:100px;background:#f0eade}.caption small{font:10px Consolas;color:#9f8255;letter-spacing:2px}.caption h2{font-weight:500;font-size:21px;margin:7px 0 0}.caption p{font-size:13px;line-height:1.8;color:#79715f;margin:0}.controls{display:flex;gap:14px;align-items:center;padding-top:15px}.controls button{border:1px solid #c6b695;background:#f6f1e6;color:#715b36;border-radius:3px;padding:8px 14px}.controls button.primary{background:#6b5738;color:#fcf4e4;min-width:73px}.controls input{flex:1;accent-color:#9f8046;min-width:20px}.time{font:12px Consolas;color:#8c7d64;min-width:94px}.chapters{display:flex;gap:6px;margin-top:12px}.chapters button{flex:1;padding:10px 3px;border:0;border-top:2px solid #d7cebd;background:transparent;font-size:11px;color:#938675;text-align:left}.chapters button.active{border-color:#9c7c45;color:#5d573f}.note{font-size:10px;line-height:1.6;color:#9b9283;margin:10px 0 0}.brass{--anatomy-paper:#bd9652;--anatomy-top:#e0bd7b;--anatomy-shade-0:#76552c;--anatomy-shade-1:#997038;--anatomy-shade-2:#b58d4b;--anatomy-shade-3:#d2ad6b;--anatomy-mid:#806239;--anatomy-lo:#997b49}.brass .iso-top{fill:url(#gold)}.steel{--anatomy-paper:#666e64;--anatomy-top:#929b8a;--anatomy-shade-0:#3a453d;--anatomy-shade-1:#4c584c;--anatomy-shade-2:#606b5c;--anatomy-shade-3:#788272;--anatomy-mid:#4d594d}.dark{--anatomy-paper:#c5ae82;--anatomy-top:#c9b38b;--anatomy-shade-0:#79613d;--anatomy-shade-1:#8a7148;--anatomy-shade-2:#a78b59;--anatomy-shade-3:#b49d72;--anatomy-mid:#9c845b}.paper{--anatomy-paper:#fff9e9;--anatomy-top:#fff9e9;--anatomy-shade-0:#c6bdab;--anatomy-shade-1:#d5cab4;--anatomy-shade-2:#e4dbc7;--anatomy-shade-3:#eee4ce;--anatomy-mid:#c4b69b}.teal{--anatomy-paper:#507f73;--anatomy-top:#77a393;--anatomy-shade-0:#34594b;--anatomy-shade-1:#41695c;--anatomy-shade-2:#527d6a;--anatomy-shade-3:#69917d;--anatomy-mid:#426755}.iso-line{--anatomy-lo:#9b8b6e}.iso-halo{fill:#756344;opacity:.23;filter:blur(15px)}.channel-bed{fill:none;stroke:#9a8054;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}.channel-core{fill:none;stroke:#d9c69f;stroke-width:3.6;stroke-linejoin:round}.flow-route{fill:none;stroke:#4a8b7a;stroke-width:2;stroke-linejoin:round;opacity:0}.back-route{stroke:#bb763d}.packet{fill:#407f71;stroke:#e7f4d9;stroke-width:.7;opacity:0}.local-link{fill:none;stroke:#736a51;stroke-width:2;stroke-linejoin:round}.module-label{fill:#6d5938;font:12px 'Microsoft YaHei',sans-serif;letter-spacing:.6px}.status-lamp{fill:#aaa38a;stroke:#e7dfc9;stroke-width:1}.station.active .status-lamp{fill:#4b9b82;filter:drop-shadow(0 0 3px #65b89b)}.station.hold .status-lamp{fill:#c58139}.film.focused .station:not(.active){opacity:.65}.station{transition:opacity .65s}.flow-route,.local-link{transition:opacity .4s}.film[data-mode="confirmed"] .event{border-color:#4c8777}
@media(max-width:850px){.shell{padding:16px 12px}header{display:block}.scenario{margin-top:13px}h1{font-size:21px}.iso-plate{height:440px;min-height:0}.event{top:45px;left:12px;width:150px;padding:10px}.event strong{font-size:11px}.event p{font-size:10px}.monitor{right:10px;bottom:12px;width:158px;padding:10px}.monitor div{font-size:10px}.monitor b{font-size:11px}.caption{grid-template-columns:1fr;gap:10px;padding:15px;min-height:150px}.caption h2{font-size:19px}.caption p{font-size:12px}.chapters{flex-wrap:wrap}.chapters button{min-width:28%;font-size:10px}.controls{gap:8px}.controls button{padding:8px}.topline{left:12px;right:12px;font-size:8px}}
@media(max-width:850px){.iso-plate{height:470px}.iso-plate>.iso-svg{position:absolute;top:93px;height:270px}.event{top:44px;left:12px;right:12px;width:auto;padding:8px 10px}.event small{display:none}.event strong{margin:0;font-size:12px}.event p{font-size:9px;line-height:1.5;margin-top:4px}.event br{display:none}.monitor{bottom:12px;left:12px;right:12px;width:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}.monitor small{grid-column:1/-1}.monitor div{margin-top:2px;gap:5px}.monitor b{font-size:10px}} </style><body class="iso" data-theme="light"><main class="shell"><header><div><div class="brand">RISK INTELLIGENCE / SYSTEM STUDY 02</div><h1>一条事件，牵动整个风险系统</h1></div><div class="scenario"><span>演示情景</span><button id="rumor" class="selected">传闻待核实</button><button id="confirmed">事件获证实</button></div></header><section class="film" id="film" data-mode="rumor"><div class="iso-plate" tabindex="0" aria-label="45秒系统动画，空格播放暂停，左右方向键调整时间"><div class="topline"><span>FIG. 02 / BRASS RISK CONTROL SYSTEM</span><b id="global-status">系统待命</b></div><div class="event"><small>EVENT / X-001</small><strong>X 集团违约传闻</strong><p id="event-note">外部事件进入<br>来源与事实状态待核验</p></div>${svg}<div class="monitor"><small>LIVE CONTROL / 演示状态</small><div><span>事件事实</span><b id="fact">待核实</b></div><div><span>直接持仓敞口</span><b id="exposure">待匹配</b></div><div><span>证据流程</span><b id="evidence">等待接入</b></div><div><span>决策闸门</span><b class="hold">人工复核</b></div></div></div><div class="caption"><div><small id="step"></small><h2 id="heading"></h2></div><p id="description"></p></div></section><div class="controls"><button id="play" class="primary">暂停</button><button id="restart">重播</button><input id="timeline" aria-label="播放进度" type="range" min="0" max="45" step=".01" value="0"><span class="time" id="time">00:00 / 00:45</span></div><nav class="chapters"><button data-t="0">01 系统全景</button><button data-t="7">02 事件进入</button><button data-t="14">03 关联穿透</button><button data-t="22">04 并行核验</button><button data-t="30">05 补证 / 汇总</button><button data-t="38">06 人工复核</button></nav><p class="note">依据风险管理分册六大场景设计。跨模块编排、关系拓扑及处理时序为拟议演示；1.2 亿元源自材料演示案例，不代表实时测算。无配音，45 秒可交互样片。</p></main><script>
const P=${JSON.stringify(P)},sites=${JSON.stringify(sites)},paths=${JSON.stringify(paths)},projectedSites=${JSON.stringify(sites.map(p=>at([...p,20])))};
const el=id=>document.getElementById(id),clamp=x=>Math.max(0,Math.min(1,x)),ease=(a,b,x)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q)};
const origin=${JSON.stringify(at([0,0,0]))};
const axisX=${JSON.stringify(at([1,0,0]).map((v,i)=>v-at([0,0,0])[i]))},axisY=${JSON.stringify(at([0,1,0]).map((v,i)=>v-at([0,0,0])[i]))},axisZ=${JSON.stringify(at([0,0,1]).map((v,i)=>v-at([0,0,0])[i]))};
const move=(id,x=0,y=0,z=0)=>el(id).setAttribute('transform','translate('+(axisX[0]*x+axisY[0]*y+axisZ[0]*z)+' '+(axisX[1]*x+axisY[1]*y+axisZ[1]*z)+')');
let t=0,mode='rumor',playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true,frame=0,last=0;
const routeEls=paths.map(p=>({meta:p,path:el(p.id),len:el(p.id).getTotalLength(),dots:[0,1,2].map(i=>el(p.id+'-p'+i))}));
const stages=[
{t:0,title:'六个模块，一套协同系统',text:'多源采集、主体匹配、关联穿透、知识检索、规则核验、报告复核分工协作。数据、证据与处理结果沿不同路径流动。',active:[0,1,2,3,4,5]},
{t:7,title:'先把事件匹配到持仓',text:'外部信息先聚合与初筛，再匹配主体和内部持仓。同一事件在多个来源出现，并不等于事实已经得到证实。',active:[0,1]},
{t:14,title:'直接敞口之外，继续穿透',text:'定位材料案例中的 1.2 亿元直接敞口；再展开关联方与上下游。关系存在只代表需要进一步研判，不能直接认定损失。',active:[1,2]},
{t:22,title:'知识与规则，并行核验',text:'一条支路检索制度和历史经验，另一条支路核验合同约束与业务规则。两路证据带着来源回到报告模块。',active:[3,4,5]},
{t:30,title:'证据不足，退回补证',text:'跨源核查发现事件事实仍未确认。补证请求沿外圈返回采集端；分析保留为条件性推演，不能把传闻写成确定结论。',active:[0,5]},
{t:38,title:'汇总依据，保留决策闸门',text:'报告保留事实状态、直接敞口和待验证的传导关系。人工研判处置意见；经复核的知识修正进入待入库区。',active:[3,5]}
];
function state(){const s=stages.findLastIndex(v=>t>=v.t),v=stages[s];return {s,v,confirmed:mode==='confirmed',active:v.active}}
function setRoute(id,on){const r=routeEls.find(r=>r.meta.id===id);r.path.style.opacity=on?.8:0;r.dots.forEach((dot,j)=>{dot.style.opacity=on?1:0;if(on){const progress=(t*.15+j/3)%1,p=r.path.getPointAtLength(progress*r.len);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.style.fill=id==='return'?'#ba793c':'#477f70'}})}
function draw(){
const {s,v,confirmed}=state();el('film').dataset.mode=mode;el('film').classList.toggle('focused',s>0&&s<5);
el('step').textContent='SEQUENCE '+String(s+1).padStart(2,'0')+' / 06';el('heading').textContent=s===4&&confirmed?'事件获证实，继续汇总':v.title;el('description').textContent=s===4&&confirmed?'演示情景中，事件已获得证据确认。事实依据、持仓敞口和规则核验结果进入汇总；关联传导仍需判断，不自动等同于损失。':v.text;
el('global-status').textContent=['SYSTEM OVERVIEW','EVENT INGESTION','EXPOSURE & RELATIONS','PARALLEL VERIFICATION',confirmed?'EVIDENCE ASSEMBLY':'EVIDENCE REQUIRED','HUMAN REVIEW'][s];
el('fact').textContent=t<10?'待核实':confirmed?'已证实（演示）':'传闻待核实';el('exposure').textContent=t>=14?'1.2 亿元':'待匹配';el('evidence').textContent=t<7?'等待接入':t<14?'来源聚合':t<22?'关联研判':t<30?'并行核验':confirmed?'汇总待复核':'补证 / 条件性推演';
el('event-note').innerHTML=confirmed?'情景切换：假设已有权威证据<br>关联影响仍需研判':'多个来源汇聚为同一事件<br>重复传播不等于事实确认';
for(let i=0;i<6;i++){el('station'+i).classList.toggle('active',v.active.includes(i));el('station'+i).classList.toggle('hold',!confirmed&&s>=4&&[0,5].includes(i))}
const routes={r01:t>=7&&t<16,r12:t>=12&&t<23,r13:t>=20&&t<30,r14:t>=20&&t<30,r24:t>=19&&t<29,r35:t>=24&&t<38,r45:t>=24&&t<38,return:!confirmed&&t>=30&&t<39,feedback:t>=40};
for(const r of paths)setRoute(r.id,!!routes[r.id]);
for(let j=0;j<7;j++)move('feed'+j,0,t>=7&&t<14?11*(.5+.5*Math.sin(t*2-j*.65)):0,0);
move('collector',t>=7&&t<16?75*(.5+.5*Math.sin(t*.8)):0,0,0);
move('match0',8*ease(10,13,t));move('match1',-8*ease(10,13,t));el('matching').style.opacity=ease(11,13,t);
for(let j=0;j<4;j++){const q=ease(14+j*.8,17+j*.8,t);el('relation'+j).style.opacity=.25+.75*q;el('local'+j).style.stroke=q>.6?'#447f6f':'#8b7855';el('local'+j).style.opacity=.25+.75*q}
for(let j=0;j<4;j++)move('drawer'+j,0,t>=22&&t<30?(j===1?14*(ease(22,24,t)-ease(28,30,t)):0):t>=40&&j===3?10*ease(40,43,t):0,0);
move('verifier',t>=22?105*ease(22,28,t):0);move('rule-gauge',t>=22?80*ease(23,28,t):0);
move('press',0,0,-14*(ease(34,35.5,t)-ease(36.5,38,t)));move('report',0,14*ease(36,39,t),0);
el('report').style.opacity=.25+.75*ease(32,35,t);
const zoom=1+.19*(ease(7,11,t)-ease(33,38,t));const mix=(a,b,q)=>a.map((v,i)=>v+(b[i]-v)*q);const firstFocus=projectedSites[0].map((v,i)=>(v+projectedSites[1][i])/2);const parallelFocus=projectedSites[3].map((v,i)=>(v+projectedSites[4][i])/2);let target=mix([720,405],firstFocus,ease(7,11,t));target=mix(target,projectedSites[2],ease(14,17,t));target=mix(target,parallelFocus,ease(22,25,t));target=mix(target,[720,405],ease(30,34,t));
const factor=.23*(ease(7,11,t)-ease(30,34,t));const cx=720+(target[0]-720)*factor,cy=405+(target[1]-405)*factor;
el('camera').setAttribute('transform','translate('+(720-cx*zoom)+' '+(405-cy*zoom)+') scale('+zoom+')');
el('timeline').value=t;el('time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:45';el('play').textContent=playing?'暂停':t>=45?'重播':'播放';document.querySelectorAll('[data-t]').forEach((b,i)=>{b.classList.toggle('active',i===s);b.setAttribute('aria-current',i===s?'step':'false')});
}
function run(){last=0;if(playing&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
function tick(now){frame=0;if(playing&&visible&&!document.hidden){t=Math.min(45,t+(last?Math.min((now-last)/1000,.1):0));if(t===45)playing=false;draw()}last=now;if(playing&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
function seek(x){t=Math.max(0,Math.min(45,x));playing=false;draw()}
function toggle(){if(t>=45)t=0;playing=!playing;draw();run()}
el('play').onclick=toggle;el('restart').onclick=()=>{t=0;playing=true;draw();run()};el('timeline').oninput=e=>seek(+e.target.value);document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>seek(+b.dataset.t));
for(const m of ['rumor','confirmed'])el(m).onclick=()=>{mode=m;el('rumor').classList.toggle('selected',m==='rumor');el('confirmed').classList.toggle('selected',m==='confirmed');draw()};
document.querySelector('.iso-plate').onkeydown=e=>{if(e.code==='Space'){e.preventDefault();toggle()}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();seek(t+(e.key==='ArrowRight'?1:-1))}};
new IntersectionObserver(es=>{visible=es.at(-1).isIntersecting;run()}).observe(el('film'));document.addEventListener('visibilitychange',run);
window.seekSystem=seek;window.systemState=()=>({time:t,mode,playing,stage:state().s,active:state().active});draw();run();
</script></body></html>`);
console.log('Built 45s system sample: '+count+' solid parts, '+paths.length+' routed connections, 2 evidence scenarios.');

