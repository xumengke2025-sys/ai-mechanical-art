const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const {spawn}=require('child_process');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_PATH||'C:/Users/67236/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const {chromium}=pw;
const ROOT=__dirname,FF=process.env.FFMPEG_PATH||'D:/ai项目/绘本转3d/MLSharp-3D-Maker-by-GemosDodo/python_env/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const argv=process.argv.slice(2),arg=(k,d)=>{let i=argv.indexOf(k);return i<0?d:argv[i+1]};
const width=+arg('--width','1920'),height=width*9/16,start=+arg('--start','0'),end=+arg('--end','60'),fps=+arg('--fps','30'),out=path.join(ROOT,arg('--out','renders/full-silent.mp4'));
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
  const times=arg('--times','0,5,9,14,20,24,29,32,36,39,44,48,51.5,53,58').split(',').map(Number),states=[];
  for(const t of times){const state=await page.evaluate(t=>window.renderAt(t),t);fs.writeFileSync(path.join(ROOT,'qa',`frame-${t}.png`),await capture(t));states.push(state);console.log('STILL '+t);}
  fs.writeFileSync(path.join(ROOT,'qa','states.json'),JSON.stringify({sourceHashes,states,errors},null,2));
 }else if(argv.includes('--verify')){
  const ts=[0,9,20,32,39,51.5,58],refs={},checks=[];for(const t of ts)refs[t]=hash(await capture(t));for(const t of [...ts].reverse())checks.push({t,kind:'out-of-order',equal:refs[t]===hash(await capture(t))});await page.close();page=await open();for(const t of ts)checks.push({t,kind:'fresh-page',equal:refs[t]===hash(await capture(t))});fs.writeFileSync(path.join(ROOT,'qa','determinism.json'),JSON.stringify({checks,errors,sourceHashes},null,2));console.log(JSON.stringify(checks));if(checks.some(x=>!x.equal))process.exitCode=2;
 }else{
  fs.mkdirSync(path.dirname(out),{recursive:true});const tmp=out+'.partial.mp4';ff=spawn(FF,['-hide_banner','-y','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','fast','-crf','17','-threads','2','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',tmp],{stdio:['pipe','ignore','pipe']});let log='';ff.stderr.on('data',b=>log=(log+b).slice(-5000));ff.stdin.on('error',e=>console.error(e.message));const done=new Promise((r,j)=>ff.on('close',c=>c?j(Error(log)):r()));
  const n=Math.round((end-start)*fps);for(let i=0;i<n;i++){const b=Buffer.from(await page.evaluate(t=>window.captureJPEG(t),start+i/fps),'base64');if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));if(i%150===0){const s={start,end,frame:i,total:n,elapsed_s:(Date.now()-begin)/1000,errors};fs.writeFileSync(out+'.progress.json',JSON.stringify(s));console.log(JSON.stringify(s));}}
  ff.stdin.end();await done;if(errors.length)throw Error(errors.join('\n'));if(JSON.stringify(sources())!==JSON.stringify(sourceHashes))throw Error('Sources changed during render');fs.renameSync(tmp,out);const result={start,end,frames:n,fps,width,height,sourceHashes,sha256:hash(fs.readFileSync(out)),bytes:fs.statSync(out).size,elapsed_s:(Date.now()-begin)/1000,errors};fs.writeFileSync(out+'.manifest.json',JSON.stringify(result,null,2));console.log('FINISHED '+out);
 }
 await browser.close();server.close();if(errors.length)process.exitCode=1;
})().catch(async e=>{console.error(e);ff?.kill();await browser?.close();server.close();process.exitCode=1;});
