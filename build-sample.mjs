import * as k from 'file:///D:/Codex/skills/anatomy/kit/iso-kit.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {kitScript} from 'file:///D:/Codex/skills/anatomy/scripts/inline-kit.mjs';
const OUT = new URL('./output/',import.meta.url);mkdirSync(OUT,{recursive:true});
const P=k.fitProjection(k.boxCorners({x:-186,y:-108,w:390,d:228,r:8},-18,92),1000,650,{pad:32,azimuth:36,elevation:36});
const at=p=>k.iso(p,P), L=(d,o={})=>k.lineSvg(d,{tone:'lo',...o});
let count=0;
const block=(x,y,w,d,z,h,mat='brass',r=1.5)=>{count++;return `<g class="${mat}">${k.solidSvg(k.slabOf({x,y,w,d,r},z,h,P,5,Math.min(.8,h/4)),{tone:'mid'})}</g>`};
const bolt=(x,y,z)=>block(x-1.6,y-1.6,3.2,3.2,z,1.1,'steel',.5)+L(k.lineOnTop([x-1,y],[x+1,y],z+1.1,P),{free:true});
const screwPlan=(x,y,w,d,z)=>[[x+4,y+4],[x+w-4,y+4],[x+4,y+d-4],[x+w-4,y+d-4]].map(([a,b])=>bolt(a,b,z)).join('');
const group=(id,body)=>`<g id="${id}">${body}</g>`;
let base=`<path class="iso-halo" d="${k.haloOf({x:-180,y:-105,w:375,d:215,r:10},-18,10,P)}"/>`;
for(const [x,y] of [[-164,-88],[166,-88],[-164,84],[166,84]])base+=block(x,y,20,20,-18,8,'steel',4)+block(x-2,y-2,24,24,-10,2,'brass',4);
base+=block(-180,-105,375,215,-8,8,'brass',9)+block(-174,-99,363,203,0,2,'darkbrass',7);
base+=L(k.planOutline({x:-168,y:-93,w:351,d:191,r:5},2,P));
base+=screwPlan(-174,-99,363,203,2);
for(const y of [-78,20]){
 base+=block(-155,y,280,6,2,5,'steel');base+=block(-155,y+58,280,6,2,5,'steel');
 for(const x of [-160,122])base+=block(x,y-4,6,72,2,10)+screwPlan(x,y-4,6,72,12);
 for(const x of [-145,-110,-75,-40,-5,30,65,100])base+=bolt(x,y+3,7)+bolt(x,y+61,7);
}
const ruler={x:-145,y:92,w:265,d:5,r:.6};base+=block(ruler.x,ruler.y,ruler.w,ruler.d,2,1,'brass');
const ticks=k.topTicks(-140,115,5,5,92,3,[2,4],P);base+=L(ticks.minor)+L(ticks.major,{tone:'hi'});
base+=block(139,-83,37,63,2,12,'steel',3)+block(142,-80,31,57,14,2,'brass',2);
for(let i=0;i<5;i++)base+=block(148,-73+i*9,19,3,16,.5,'darkbrass',.8);
base+=group('rule-pointer',block(146,-73,23,3,16.6,1,'signal',.6));
base+=screwPlan(142,-80,31,57,16);
base+=block(138,13,40,63,2,4,'brass',3)+block(141,16,34,57,6,.5,'steel');
for(const [x,y,w,d] of [[138,13,3,63],[175,13,3,63],[141,13,34,3]])base+=block(x,y,w,d,6,5,'brass');
base+=block(-157,-8,77,18,2,1,'brass');
base+=k.faceTextSvg(k.topMatrix([-118,4],3.1,P,'x'),'RISK / 03',{size:4,anchor:'middle',tone:'hi'});

function document(y,id){
 let b=block(-116,y-4,109,66,7,4,'brass',3)+screwPlan(-116,y-4,109,66,11);
 b+=block(-108,y+3,91,52,11,1.2,'paper',.7);
 b+=block(-105,y+7,17,2,12.3,.12,'ink',.1);
 for(let i=0;i<8;i++)b+=L(k.lineOnTop([-104,y+13+i*4],[-28-(i%3)*5,y+13+i*4],12.4,P),{tone:'faint',free:true});
 b+=group('mark-'+id,`<path d="${k.planOutline({x:-107,y:y+26,w:88,d:8,r:.8},12.6,P)}" fill="#c55b3530" stroke="#ac4a32" stroke-width="1"/>`);
 for(const x of [-112,-15])b+=block(x,y+17,5,22,11,3,'steel')+bolt(x+2.5,y+21,14)+bolt(x+2.5,y+35,14);
 return group(id,b);
}
const docs=document(-72,'approved')+document(26,'seal');
let back=block(-18,-97,18,12,2,10)+block(-15,-94,12,6,12,62)+block(-20,-99,22,16,70,8);
back+=screwPlan(-20,-99,22,16,78);
let front=block(-18,86,18,12,2,10)+block(-15,89,12,6,12,62)+block(-20,84,22,16,70,8);
front+=screwPlan(-20,84,22,16,78);
let scanner=block(-20,-83,22,167,70,8,'brass',3)+block(-17,-82,16,165,78,2,'darkbrass',2);
scanner+=block(-23,-68,28,40,63,7,'steel',2)+block(-23,30,28,40,63,7,'steel',2);
for(const y of [-64,34])scanner+=block(-20,y,22,30,80,3,'brass',2)+screwPlan(-20,y,22,30,83);
for(const y of [-76,22])scanner+=group('beam'+y,`<path d="${k.planOutline({x:-10,y,w:2,d:62,r:0},13,P)}" fill="#35878a" opacity=".8"/>`);
const mechanism=group('backpost',back)+docs+group('scan',scanner)+group('frontpost',front);
let ticket=block(143,21,30,47,7,1,'paper',.5);
for(let i=0;i<7;i++)ticket+=L(k.lineOnTop([147,27+i*5],[168-(i%2)*5,27+i*5],8.1,P),{free:true,tone:'faint'});
ticket+=`<path d="${k.planOutline({x:147,y:58,w:20,d:5,r:.5},8.2,P)}" fill="#bb5b36"/>`;
const svg=k.figureSvg({width:1000,height:650,label:'黄铜合同核验台。终审版与用印版沿双轨送入扫描架，定位保证金条款的差异，再核验演示底线，输出人工复核单。',body:`<defs><linearGradient id="brassTop" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#f3d999"/><stop offset=".42" stop-color="#c59b51"/><stop offset=".65" stop-color="#e4c17a"/><stop offset="1" stop-color="#b68b42"/></linearGradient></defs><g id="world">${base}${mechanism}${group('ticket',ticket)}</g>`});
const css=readFileSync('D:/Codex/skills/anatomy/kit/iso.css','utf8');
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>风险管理 · 黄铜合同核验台</title><style>${css}
*{box-sizing:border-box}body{margin:0;background:#e8e5de;color:#383a35;font-family:"Microsoft YaHei","PingFang SC",sans-serif}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid #976723;outline-offset:4px}.shell{max-width:1440px;margin:0 auto;padding:38px 48px 26px}.eyebrow{font:11px Consolas,monospace;letter-spacing:2.5px;color:#8e7650;display:flex;justify-content:space-between}.header{display:flex;align-items:baseline;gap:20px;margin:18px 0 28px}.header h1{font-size:30px;font-weight:500;letter-spacing:2px;margin:0}.header p{font-size:12px;color:#888678;margin:0}.film{background:#f5f2ea;border:1px solid #d4cbbb;box-shadow:0 20px 50px #52452910}.iso-plate{padding:0;border:0;box-shadow:none;background:transparent;--anatomy-paper:#e6ca8f;display:grid;grid-template-columns:minmax(0,1fr) 330px;min-height:570px}.stage{position:relative;min-width:0;overflow:hidden;display:flex;align-items:center;background:radial-gradient(ellipse at 50% 62%,#fffdf9 0%,#f5f2ea 72%)}.stage .iso-svg{width:100%}.stage-label{position:absolute;left:26px;top:24px;font:11px Consolas,monospace;color:#8d887b;letter-spacing:1.2px}.plate-footer{position:absolute;bottom:24px;left:26px;right:26px;display:flex;justify-content:space-between;font-size:11px;color:#8d887b}.stage-label b{color:#8b642d;font-weight:400}.side{padding:35px 28px 26px;border-left:1px solid #ddd6c8;background:#f0ede4;display:flex;flex-direction:column}.stepcount{font:11px Consolas;color:#997844;letter-spacing:2px}.side h2{font-size:25px;line-height:1.4;margin:16px 0 12px;font-weight:500}.desc{font-size:13px;line-height:1.9;color:#77776b;min-height:74px;margin:0}.evidence{margin-top:24px;border-top:1px solid #d7cdbd;padding-top:16px}.evidence .label{font-size:10px;letter-spacing:1.5px;color:#9b8867}.data-row{display:flex;justify-content:space-between;align-items:center;margin:15px 0;font-size:12px;color:#747469}.data-row strong{font:24px Georgia,serif;color:#4e5146}.data-row em{font-style:normal;font-size:10px;color:#8c887c}.data-row.alert strong{color:#a34c33}.result{margin-top:auto;padding-top:20px}.badge{display:inline-block;border:1px solid #c8b58e;background:#ece2ce;color:#8b6936;padding:7px 10px;font-size:12px}.badge.alert{background:#f0e0d6;border-color:#d8b5a1;color:#a24f32}.subline{font-size:11px;color:#888578;line-height:1.7;margin-top:11px}.caption{height:72px;padding:16px 32px;border-top:1px solid #ddd6c8;display:flex;align-items:center;gap:20px}.caption small{font:10px Consolas;color:#a0875d;white-space:nowrap;letter-spacing:2px}.caption p{font-size:15px;letter-spacing:.3px;margin:0;line-height:1.7}.controls{display:flex;gap:18px;align-items:center;margin-top:20px}.controls button{border:1px solid #c9beaa;background:#f6f3eb;padding:9px 15px;border-radius:3px;color:#66583d}.controls .primary{background:#6c5837;color:#fff9ec;border-color:#6c5837;min-width:80px}.controls input{flex:1;accent-color:#94713f;min-width:40px}.time{font:12px Consolas;color:#807866}.chapters{display:grid;grid-template-columns:repeat(5,1fr);margin:18px 0 0;gap:7px}.chapters button{border:0;border-top:2px solid #d7d0c2;background:transparent;text-align:left;padding:12px 4px;color:#969080;font-size:11px}.chapters button.active{border-color:#9c773a;color:#6c5837}.footnote{margin:18px 0 0;font-size:10px;line-height:1.6;color:#969184}.brass{--anatomy-paper:#c39950;--anatomy-top:#dfbd79;--anatomy-shade-0:#705027;--anatomy-shade-1:#94692e;--anatomy-shade-2:#b58b45;--anatomy-shade-3:#d2aa63;--anatomy-mid:#79582d;--anatomy-lo:#a17c41;--anatomy-hi:#5f4522}.brass .iso-top{fill:url(#brassTop)}.darkbrass{--anatomy-paper:#bd995a;--anatomy-top:#c5a36c;--anatomy-shade-0:#70532f;--anatomy-shade-1:#80653c;--anatomy-shade-2:#967846;--anatomy-shade-3:#ae8d53;--anatomy-mid:#8d7249}.steel{--anatomy-paper:#676a63;--anatomy-top:#93968d;--anatomy-shade-0:#303730;--anatomy-shade-1:#474e46;--anatomy-shade-2:#596058;--anatomy-shade-3:#71796e;--anatomy-mid:#4a5148;--anatomy-lo:#73796e}.paper{--anatomy-paper:#fffdf4;--anatomy-top:#fffdf4;--anatomy-shade-0:#cec6b5;--anatomy-shade-1:#d9d0bb;--anatomy-shade-2:#e5dcc9;--anatomy-shade-3:#f0eadc;--anatomy-mid:#c4baa3}.ink{--anatomy-top:#696b60;--anatomy-mid:#696b60}.iso-line{--anatomy-lo:#8c744c;--anatomy-faint:#b2ad9c}.iso-dots{--anatomy-dot:#433d2c}#mark-approved,#mark-seal,#ticket{opacity:0}#beam-76,#beam22{opacity:0}.iso-halo{fill:#756449;opacity:.22;filter:blur(12px)}
@media(min-width:1500px){.shell{padding-top:55px}}@media(max-width:850px){.shell{padding:22px 18px}.iso-plate{grid-template-columns:1fr;min-height:0}.stage{min-height:310px}.side{border-left:0;border-top:1px solid #ddd6c8;padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:0 20px}.side .stepcount,.side h2,.side .desc{grid-column:1}.side h2{font-size:22px}.evidence{grid-column:2;grid-row:1/5;margin:0;padding:0;border:0}.result{grid-column:1/-1}.desc{min-height:0;font-size:12px}.header{display:block}.header p{margin-top:10px}.header h1{font-size:24px}.caption{padding:14px 18px;height:90px}.caption small{display:none}.caption p{font-size:13px}.controls{gap:8px}.controls button{padding:8px}.chapters button{font-size:10px}.plate-footer{bottom:14px}.stage-label{top:14px}}
</style><body class="iso" data-theme="light"><main class="shell"><div class="eyebrow"><span>RISK INTELLIGENCE / STUDY 01</span><span>00:30 · MATERIAL STUDY</span></div><header class="header"><h1>让每一次用印，都有据可核</h1><p>场外衍生品合同审核 · 黄铜机构动画样片</p></header><div class="film"><section class="iso-plate"><div class="stage" tabindex="0" aria-label="动画，可用空格播放或暂停，左右方向键调整时间"><div class="stage-label">FIG. 03 <b> / CONTRACT VERIFICATION</b></div>${svg}<div class="plate-footer"><span>终审版 × 用印版 · 双轨核验</span><span data-readout id="readout">等待文档进入</span></div></div><aside class="side"><div class="stepcount" id="counter"></div><h2 id="title"></h2><p class="desc" id="description"></p><div class="evidence"><div class="label">保证金比例 / 演示数据</div><div class="data-row"><span>终审版本</span><strong id="v1">—</strong></div><div class="data-row" id="sealrow"><span>用印版本</span><strong id="v2">—</strong></div><div class="data-row"><span>演示底线</span><strong id="limit">—</strong></div><div class="data-row"><em>原文定位</em><em id="clause">等待提取</em></div></div><div class="result"><span class="badge" id="badge"></span><div class="subline" id="status"></div></div></aside></section><div class="caption"><small>THE CONTROL POINT</small><p id="caption"></p></div></div><div class="controls"><button class="primary" id="play">暂停</button><button id="restart">重播</button><input id="timeline" type="range" min="0" max="30" step=".01" value="0" aria-label="播放进度"><span class="time" id="time">00:00 / 00:30</span></div><nav class="chapters" aria-label="动画章节"><button data-t="0">01 文档进入</button><button data-t="5">02 要素抽取</button><button data-t="10">03 版本比对</button><button data-t="18">04 底线核验</button><button data-t="24">05 人工复核</button></nav><p class="footnote">依据《内控 AI · 风险管理》场景 3。12%、8%、10% 与条款编号均为演示样例，不代表真实合同或制度。此段为视觉与动作样片，无配音。</p></main><script type="module">${kitScript()}
const projection=${JSON.stringify(P)};
const el=id=>document.getElementById(id);
const stages=[
{t:0,title:'两份合同，同台核验',desc:'终审版本与用印版本进入独立导轨。保留版本身份，为后续对照建立基准。',badge:'文档就位',status:'检查对象：待用印文件与终审文件',caption:'先确认比对的是哪两个版本，再开始审核。'},
{t:5,title:'把条款变成要素',desc:'扫描定位保证金条款，提取比例，并保留原文位置。结构化结果仍可回到合同核对。',badge:'要素抽取',status:'保证金比例 · 条款 4.2（演示）',caption:'提取数值的同时，保留它来自哪一条合同。'},
{t:10,title:'同一条款，出现差异',desc:'终审版为 12%，用印版为 8%。对照机构停在差异条款，标记待核验改动。',badge:'发现版本差异',status:'差异：−4 个百分点 · 改动授权待核实',caption:'版本不一致是一个问题，是否突破业务底线是另一个问题。'},
{t:18,title:'继续核验业务底线',desc:'用印版 8% 低于演示底线 10%。版本比对和规则判断分别保留结果与依据。',badge:'低于演示底线',status:'8% ＜ 10% · 低于底线 2 个百分点',caption:'即使两个版本完全一致，也仍需独立检查业务底线。'},
{t:24,title:'依据齐备，交给复核',desc:'差异位置、抽取结果与规则命中形成复核单。审核人员核实授权与条款，再决定后续处理。',badge:'待人工复核',status:'两项发现：版本差异 / 底线未满足',caption:'AI 提供可追溯的审核辅助；业务处置进入人工复核。'}];
let t=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,frame=0,visible=true;
const ease=(a,b,x)=>{const q=Math.max(0,Math.min(1,(x-a)/(b-a)));return q*q*(3-2*q)};
function draw(){
const s=stages.findLastIndex(s=>t>=s.t),v=stages[s];
el('counter').textContent='CONTROL '+String(s+1).padStart(2,'0')+' / 05';
for(const [id,value] of Object.entries({title:v.title,description:v.desc,badge:v.badge,status:v.status,caption:v.caption}))el(id).textContent=value;
el('badge').className='badge'+(s>=2?' alert':'');el('sealrow').className='data-row'+(s>=2?' alert':'');
el('v1').textContent=t>=7?'12%':'—';el('v2').textContent=t>=8?'8%':'—';el('limit').textContent=t>=19?'10%':'—';el('clause').textContent=t>=8?'条款 4.2':'等待提取';
const shift=-35*(1-ease(0,4,t));el('approved').setAttribute('transform',translateAlong(projection,[shift,0,0]));el('seal').setAttribute('transform',translateAlong(projection,[shift,0,0]));
const scan=-84+78*ease(5,11,t);for(const id of ['scan','backpost','frontpost'])el(id).setAttribute('transform',translateAlong(projection,[scan,0,0]));
for(const id of ['beam-76','beam22'])el(id).style.opacity=ease(5,5.6,t)*(1-ease(11,12,t));
for(const id of ['mark-approved','mark-seal'])el(id).style.opacity=ease(10.5,12,t);
el('ticket').style.opacity=ease(24,25,t);el('ticket').setAttribute('transform',translateAlong(projection,[0,-12*(1-ease(24,27,t)),0]));
el('readout').textContent=['文档定位中','提取保证金比例','已定位 1 处版本差异','已命中 1 项演示规则','复核单已生成'][s];
el('timeline').value=t;el('time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:30';el('play').textContent=playing?'暂停':t>=30?'重播':'播放';
document.querySelectorAll('[data-t]').forEach((b,i)=>{b.classList.toggle('active',s===i);b.setAttribute('aria-current',s===i?'step':'false')});
}
function tick(now){frame=0;if(playing&&visible&&!document.hidden){t=Math.min(30,t+(last?Math.min((now-last)/1000,.1):0));if(t===30)playing=false;draw()}last=now;if(playing&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
function run(){last=0;if(!frame&&playing&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
function toggle(){if(t>=30)t=0;playing=!playing;draw();run()}
window.seekSample=(next)=>{t=Math.max(0,Math.min(30,next));playing=false;draw()};
window.sampleState=()=>({time:t,playing,stage:stages.findLastIndex(s=>t>=s.t),versionDifference:12-8,ruleShortfall:10-8});
el('play').onclick=toggle;el('restart').onclick=()=>{t=0;playing=true;draw();run()};el('timeline').oninput=e=>window.seekSample(Number(e.target.value));
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>window.seekSample(Number(b.dataset.t)));
document.querySelector('.stage').onkeydown=e=>{if(e.code==='Space'){e.preventDefault();toggle()}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();window.seekSample(t+(e.key==='ArrowRight'?1:-1))}};
new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;run()}).observe(document.querySelector('.film'));document.addEventListener('visibilitychange',run);draw();run();
</script></body></html>`;
const adjusted=html.replace('</style>',`.signal{--anatomy-top:#a55538;--anatomy-mid:#87482e;--anatomy-shade-0:#703c29;--anatomy-shade-1:#87472e;--anatomy-shade-2:#9d5636;--anatomy-shade-3:#b86a45}#rule-pointer{opacity:0}.shell{max-width:1360px;padding:24px 34px 18px}.header{margin:12px 0 18px}.header h1{font-size:27px}.iso-plate{min-height:450px;grid-template-columns:minmax(0,1fr) 300px}.stage .iso-svg{height:460px}.side{padding:24px}.side h2{font-size:22px;margin:12px 0 8px}.desc{font-size:12px;min-height:62px}.evidence{margin-top:15px;padding-top:12px}.data-row{margin:10px 0}.data-row strong{font-size:23px}.result{padding-top:14px}.caption{height:62px}.controls{margin-top:14px}.chapters{margin-top:12px}.footnote{margin-top:10px}@media(max-width:850px){.shell{padding:18px 14px}.iso-plate{grid-template-columns:1fr;min-height:0}.stage .iso-svg{height:auto}.stage{min-height:290px}.side{padding:20px}.header h1{font-size:23px}.evidence{margin:0;padding:0}.desc{min-height:0}.caption{height:82px}}
</style>`).replace("t>=19?'10%'","t>=18?'10%'").replace('ease(10.5,12,t)','ease(9.5,10,t)').replace("el('ticket').style.opacity=ease(24,25,t)","el('rule-pointer').style.opacity=ease(18,18.5,t);el('rule-pointer').setAttribute('transform',translateAlong(projection,[0,27*ease(18,20,t),0]));el('ticket').style.opacity=ease(23.5,24,t)");
const safeHtml=adjusted.replace(/<script type="module">([\s\S]*)<\/script><\/body>/,(_,code)=>'<script type="module">'+code.replaceAll('</script','<\\/script')+'</script></body>');
writeFileSync(new URL('contract-brass-sample.html',OUT),safeHtml);
console.log(`Built 30-second sample. ${count} solid parts.`);
