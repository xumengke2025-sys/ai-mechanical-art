const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const {chromium}=require('C:/Users/67236/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'output','film-eighteenth');
const ffmpeg='C:/Users/67236/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const preview=process.argv.includes('--preview');
let activeBrowser;
(async()=>{
 fs.mkdirSync(path.join(out,'qa'),{recursive:true});
 const browser=activeBrowser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error(e)});
 page.on('console',m=>{if(m.type()==='error')console.error(m.text())});
 await page.goto('http://127.0.0.1:8769/film-eighteenth/index.html?w=1920',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>window.ready,{timeout:60000});
 console.log(JSON.stringify(await page.evaluate(()=>window.sceneInfo)));
 if(preview){
  const data=[];
  for(const t of [0,1.9,6,10.4,12,16,18.4,23.5]){const start=Date.now();const stat=await page.evaluate(t=>window.renderAt(t),t);await page.screenshot({path:path.join(out,'qa',`frame-${t}.png`)});data.push(stat);console.log(`Preview ${t}s: ${Date.now()-start}ms, ${stat.drawcalls} calls, ${stat.triangles} triangles`)}
  fs.writeFileSync(path.join(out,'qa','preview-stats.json'),JSON.stringify({errors,frames:data},null,2));await browser.close();return;
 }
 const target=path.join(out,'eighteenth-century-silent.mp4');
 const ff=spawn(ffmpeg,['-y','-f','image2pipe','-vcodec','mjpeg','-r','30','-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',target],{stdio:['pipe','ignore','pipe']});
 let log='';ff.stderr.on('data',d=>log=(log+d).slice(-6000));ff.stdin.on('error',e=>console.error('Encoder pipe',e.message));
 const done=new Promise((res,rej)=>ff.on('close',c=>c?rej(new Error(log)):res()));
 const started=Date.now();
 for(let i=0;i<720;i++){await page.evaluate(t=>window.renderAt(t),i/30);const buf=await page.screenshot({type:'jpeg',quality:97});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%60===0)console.log(`Rendered ${i}/720, elapsed ${((Date.now()-started)/1000).toFixed(1)}s`)}
 ff.stdin.end();await done;await browser.close();if(errors.length)throw new Error(errors.join('\n'));console.log('Finished: '+target);
})().catch(async e=>{console.error(e);await activeBrowser?.close();process.exitCode=1});
