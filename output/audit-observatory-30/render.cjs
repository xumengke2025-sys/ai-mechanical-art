const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const {spawn}=require('child_process');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_PATH||'C:/Users/67236/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const {chromium}=pw;
const ROOT=__dirname,FF=process.env.FFMPEG_PATH||'D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const argv=process.argv.slice(2),arg=(k,d)=>{let i=argv.indexOf(k);return i<0?d:argv[i+1]};
const width=+arg('--width','1920'),height=width*9/16,start=+arg('--start','0'),end=+arg('--end','30'),fps=+arg('--fps','30'),out=path.join(ROOT,arg('--out','renders/full-silent.mp4'));
const errors=[],hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const sources=()=>Object.fromEntries(['scene.mjs','instruments.mjs','mechanics.mjs','timeline.mjs'].map(n=>[n,hash(fs.readFileSync(path.join(ROOT,n)))]));
const server=http.createServer((req,res)=>{const name=path.resolve(ROOT,'.'+decodeURIComponent(req.url.split('?')[0]));if(!name.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(name,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.jpg':'image/jpeg','.png':'image/png'})[path.extname(name)]||'application/octet-stream');res.end(b);});});
let browser,ff;
(async()=>{
 const begin=Date.now(),sourceHashes=sources();fs.mkdirSync(path.join(ROOT,'qa'),{recursive:true});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 async function open(){const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});page.on('pageerror',e=>{errors.push(String(e));console.error(String(e));});await page.goto(`http://127.0.0.1:${server.address().port}/index.html?w=${width}`,{waitUntil:'networkidle',timeout:90000});await page.waitForFunction(()=>window.ready,{timeout:90000});return page;}
 let page=await open();console.log(JSON.stringify(await page.evaluate(()=>window.sceneInfo)));
 const capture=async(t,format='png')=>{await page.evaluate(t=>window.renderAt(t),t);return await page.screenshot({type:format,quality:format==='jpeg'?95:undefined});};
 if(argv.includes('--preview')){
  const times=arg('--times','0.8,4,5.6,8.7,10.3,11.4,14.3,15.7,18.7,20.5,23.4,24.4,25.7,28.7').split(',').map(Number),states=[];
  for(const t of times){const state=await page.evaluate(t=>window.renderAt(t),t);fs.writeFileSync(path.join(ROOT,'qa',`frame-${t}.png`),await capture(t));states.push(state);console.log('STILL '+t);}
  fs.writeFileSync(path.join(ROOT,'qa','states.json'),JSON.stringify({sourceHashes,states,errors},null,2));
 }else if(argv.includes('--motion-audit')){
  const states=await page.evaluate(()=>Array.from({length:901},(_,i)=>window.motionStateAt(i/30)));
  const bounds=[0,1.9,3.25,3.5,5,5.05,5.55,6.65,7,8.7,8.9,9.7,9.75,10.25,10.7,11.2,11.8,12,13.3,13.4,13.5,14.2,14.6,15,15.6,16.8,17.8,18.05,20.7,21,22.6,22.7,22.8,24.4,26,28.65,28.72,28.8,28.88,29,29.25,30];
  const boundaries=await page.evaluate(ts=>ts.map(t=>({t,before:window.motionStateAt(Math.max(0,t-1e-5)),after:window.motionStateAt(t+1e-5)})),bounds);
  const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const summary={samples:states.length,boundaries:bounds.length,max_boundary_camera_delta:Math.max(...boundaries.map(x=>dist(x.before.camera,x.after.camera))),max_boundary_target_delta:Math.max(...boundaries.map(x=>dist(x.before.target,x.after.target))),max_frame_camera_delta:Math.max(...states.slice(1).map((s,i)=>dist(s.camera,states[i].camera))),hidden_counts:[...new Set(states.map(s=>s.hidden))],rod_length_range:[Math.min(...states.map(s=>s.mechanism.press.rodLength)),Math.max(...states.map(s=>s.mechanism.press.rodLength))],minimum_press_gap:Math.min(...states.map(s=>s.mechanism.press.contactGap)),carrier_ndc_x:[Math.min(...states.map(s=>s.caseScreen[0])),Math.max(...states.map(s=>s.caseScreen[0]))],carrier_ndc_y:[Math.min(...states.map(s=>s.caseScreen[1])),Math.max(...states.map(s=>s.caseScreen[1]))]};
  fs.writeFileSync(path.join(ROOT,'qa','motion-audit.json'),JSON.stringify({summary,sourceHashes,states,boundaries,errors},null,2));console.log(JSON.stringify(summary));
  if(summary.max_boundary_camera_delta>.002||summary.hidden_counts.length!==1||summary.minimum_press_gap < -1e-8||summary.rod_length_range[1]-summary.rod_length_range[0]>1e-8)throw Error('Motion continuity/constraint check failed');
 }else if(argv.includes('--verify')){
  const ts=[.8,5.6,9.7,13.4,18.7,24.4,28.8],refs={},checks=[];for(const t of ts)refs[t]=await capture(t);
  async function compare(t,kind){const b=await capture(t),equal=hash(refs[t])===hash(b);checks.push({t,kind,equal});if(!equal){fs.writeFileSync(path.join(ROOT,'qa',`determinism-${t}-reference.png`),refs[t]);fs.writeFileSync(path.join(ROOT,'qa',`determinism-${t}-${kind}.png`),b);}}
  for(const t of [...ts].reverse())await compare(t,'out-of-order');await page.close();page=await open();for(const t of ts)await compare(t,'fresh-page');fs.writeFileSync(path.join(ROOT,'qa','determinism.json'),JSON.stringify({checks,errors,sourceHashes},null,2));console.log(JSON.stringify(checks));if(checks.some(x=>!x.equal))process.exitCode=2;
 }else{
  fs.mkdirSync(path.dirname(out),{recursive:true});const tmp=out+'.partial.mp4';ff=spawn(FF,['-hide_banner','-y','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','fast','-crf','17','-threads','2','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',tmp],{stdio:['pipe','ignore','pipe']});let log='';ff.stderr.on('data',b=>log=(log+b).slice(-5000));ff.stdin.on('error',e=>console.error(e.message));const done=new Promise((r,j)=>ff.on('close',c=>c?j(Error(log)):r()));
  const n=Math.round((end-start)*fps);for(let i=0;i<n;i++){const b=await capture(start+i/fps,'jpeg');if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));if(i%90===0){const s={start,end,frame:i,total:n,elapsed_s:(Date.now()-begin)/1000,errors};fs.writeFileSync(out+'.progress.json',JSON.stringify(s));console.log(JSON.stringify(s));}}
  ff.stdin.end();await done;if(errors.length)throw Error(errors.join('\n'));if(JSON.stringify(sources())!==JSON.stringify(sourceHashes))throw Error('Sources changed during render');fs.renameSync(tmp,out);const result={start,end,frames:n,fps,width,height,sourceHashes,sha256:hash(fs.readFileSync(out)),bytes:fs.statSync(out).size,elapsed_s:(Date.now()-begin)/1000,errors};fs.writeFileSync(out+'.manifest.json',JSON.stringify(result,null,2));console.log('FINISHED '+out);
 }
 await browser.close();server.close();if(errors.length)process.exitCode=1;
})().catch(async e=>{console.error(e);ff?.kill();await browser?.close();server.close();process.exitCode=1;});
