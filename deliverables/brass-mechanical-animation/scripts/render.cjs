#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const crypto = require('node:crypto');
const {makeFoley} = require('./make-foley.cjs');
const root = path.resolve(__dirname);
const args = process.argv.slice(2);
const allowed = new Set(['--preview','--smoke','--verify','--out','--help']);
for (let i=0;i<args.length;i++) {
  if (!allowed.has(args[i])) throw new Error('Unknown option: '+args[i]);
  if (args[i]==='--out' && (!args[++i] || args[i].startsWith('--'))) throw new Error('--out requires a directory');
}
if (args.includes('--help')) {
  console.log('node render.cjs [--preview | --smoke | --verify] [--out directory]\nRun from an initialized project. CHROME_PATH and FFMPEG_PATH are optional absolute executable overrides.');
  process.exit(0);
}
const modes = ['--preview','--smoke','--verify'].filter(x=>args.includes(x));
if (modes.length>1) throw new Error('Choose one mode');
const config = JSON.parse(fs.readFileSync(path.join(root,'config.json'),'utf8'));
for (const key of ['width','height','fps','duration']) if (!Number.isFinite(config[key]) || config[key]<=0) throw new Error('Invalid config: '+key);
if (![config.width,config.height,config.fps].every(Number.isInteger) || config.width%2 || config.height%2) throw new Error('Width/height must be even integers; fps must be an integer');
if (!Number.isInteger(config.duration*config.fps)) throw new Error('duration * fps must be an integer frame count');
if (!Number.isInteger(config.crf) || config.crf<0 || config.crf>51) throw new Error('crf must be 0..51');
if (!['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow'].includes(config.preset)) throw new Error('Invalid x264 preset');
const smoke = args.includes('--smoke'), preview = args.includes('--preview');
const customOut = args.indexOf('--out');
const out = path.resolve(root, customOut>=0 ? args[customOut+1] : smoke ? 'output-smoke' : 'output');
const silent = path.join(out,'film-silent.mp4'), target = path.join(out,'film.mp4');
const qa = path.join(out,'qa');
function encoderPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
  return 'ffmpeg';
}
const ffmpeg = encoderPath();
function runFF(args) {
  return new Promise((resolve,reject)=>{
    const child = spawn(ffmpeg,args,{stdio:['ignore','pipe','pipe'],windowsHide:true});
    let log='', progress='';
    child.stdout.on('data',d=>{progress=(progress+d).slice(-20000)});
    child.stderr.on('data',d=>{log=(log+d).slice(-20000)});
    child.once('error',reject);
    child.once('close',code=>code===0?resolve({log,progress}):reject(new Error('FFmpeg failed ('+code+')\n'+log)));
  });
}
async function verify(file, expected) {
  const result = await runFF(['-hide_banner','-nostdin','-v','info','-xerror','-i',file,'-map','0:v:0','-map','0:a:0','-progress','pipe:1','-f','null','-']);
  const counts = [...result.progress.matchAll(/^frame=(\d+)/gm)].map(m=>Number(m[1]));
  const frames = counts.at(-1);
  const video = result.log.match(/Video: h264[^\r\n]*/)?.[0];
  const audio = result.log.match(/Audio: aac[^\r\n]*/)?.[0];
  if (!video || !audio || !video.includes('yuv420p') || !audio.includes('48000 Hz') || !audio.includes('stereo')) throw new Error('Unexpected media format\n'+result.log);
  if (!video.includes(expected.width+'x'+expected.height) || !video.includes(expected.fps+' fps') || frames!==expected.frames) throw new Error('Unexpected size, fps or frame count: '+JSON.stringify({video,frames,expected}));
  const timestamp = [...result.progress.matchAll(/^out_time_us=(\d+)/gm)].at(-1);
  const decodedDuration = timestamp ? Number(timestamp[1])/1e6 : null;
  if (decodedDuration===null || Math.abs(decodedDuration-expected.duration)>.15) throw new Error('Unexpected decoded duration: '+decodedDuration);
  return {fullDecode:true,frames,decodedDuration,video,audio,bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')};
}
function startServer() {
  const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
  const server = http.createServer((req,res)=>{
    try {
      const url = new URL(req.url,'http://localhost'), relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(root,relative), rel = path.relative(root,file);
      if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    } catch {res.writeHead(404);res.end();}
  });
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve(server));});
}
let browser, server, encoder;
async function main() {
  fs.mkdirSync(qa,{recursive:true});
  if (args.includes('--verify')) {
    const reportPath = path.join(out,'verification.json');
    const expected = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath,'utf8')).expected : {width:config.width,height:config.height,fps:config.fps,frames:config.duration*config.fps,duration:config.duration};
    console.log(JSON.stringify(await verify(target,expected),null,2)); return;
  }
  if (!preview && [target,silent].some(p=>fs.existsSync(p))) throw new Error('Video already exists. Choose a fresh --out directory.');
  let chromium;
  try { ({chromium} = require('playwright')); } catch {throw new Error('Install dependencies first: npm ci');}
  const options = {headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']};
  if (process.env.CHROME_PATH) options.executablePath=process.env.CHROME_PATH;
  browser = await chromium.launch(options);
  const width = smoke?640:config.width, height=smoke?Math.max(2,Math.round(640*config.height/config.width/2)*2):config.height;
  const fps = smoke?12:config.fps, duration=smoke?2:config.duration, frames=Math.round(fps*duration);
  const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
  page.setDefaultTimeout(60000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
  server = await startServer();
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?w=${width}&h=${height}`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.ready===true,{timeout:60000});
  const sceneInfo = await page.evaluate(()=>window.sceneInfo);
  console.log(JSON.stringify(sceneInfo));
  if (preview) {
    if (!Array.isArray(config.previewTimes) || !config.previewTimes.length) throw new Error('previewTimes must be a nonempty array');
    const states=[];
    for (const time of config.previewTimes) {
      if (!Number.isFinite(time) || time<0 || time>config.duration) throw new Error('Invalid preview time: '+time);
      states.push(await page.evaluate(t=>window.renderAt(t),time));
      await page.screenshot({path:path.join(qa,`frame-${time}.png`),timeout:60000});
      console.log('Preview '+time+'s');
    }
    fs.writeFileSync(path.join(qa,'preview.json'),JSON.stringify({sceneInfo,states,errors},null,2));
    if (errors.length) throw new Error(errors.join('\n')); return;
  }
  const ffArgs=['-n','-hide_banner','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset',config.preset,'-crf',String(config.crf),'-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',silent];
  encoder=spawn(ffmpeg,ffArgs,{stdio:['pipe','ignore','pipe'],windowsHide:true});
  let log='', pipeError;
  encoder.stderr.on('data',d=>log=(log+d).slice(-6000));
  encoder.stdin.on('error',e=>pipeError=e);
  const done=new Promise((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(new Error('Encoder failed ('+code+')\n'+log)));});
  done.catch(()=>{});
  const started=Date.now();
  for(let i=0;i<frames;i++) {
    const time=smoke?config.duration*i/(frames-1):i/fps;
    await page.evaluate(t=>window.renderAt(t),time);
    if (errors.length || pipeError || encoder.exitCode!==null) throw new Error(errors.join('\n') || pipeError?.message || log);
    const jpeg=await page.screenshot({type:'jpeg',quality:97,timeout:60000});
    if(!encoder.stdin.write(jpeg)) await Promise.race([once(encoder.stdin,'drain'),done.then(()=>{throw new Error('Encoder exited early');})]);
    if(i%Math.max(1,Math.round(fps*2))===0) console.log(`Rendered ${i}/${frames}, elapsed ${((Date.now()-started)/1000).toFixed(1)}s`);
  }
  encoder.stdin.end();await done;encoder=undefined;
  await browser.close();browser=undefined;server.close();server=undefined;
  if(errors.length) throw new Error(errors.join('\n'));
  const wav=path.join(out,'mechanical-foley.wav');makeFoley(wav,duration);
  await runFF(['-n','-hide_banner','-nostdin','-i',silent,'-i',wav,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',String(duration),'-movflags','+faststart',target]);
  const expected={width,height,fps,duration,frames};
  const verification=await verify(target,expected);
  const decoded=path.join(qa,'decoded-middle.png');
  await runFF(['-y','-hide_banner','-nostdin','-ss',String(duration/2),'-i',target,'-frames:v','1',decoded]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({expected,acceleratedSmoke:smoke,sceneInfo,verification,errors,elapsedSeconds:(Date.now()-started)/1000,notes:'Technical decode only; inspect source images and play the film for visual/audio acceptance.'},null,2));
  console.log('Finished: '+target+'\n'+JSON.stringify(verification));
}
main().catch(e=>{console.error(e.stack || e);process.exitCode=1;}).finally(async()=>{
  encoder?.stdin.destroy();encoder?.kill();
  await browser?.close().catch(()=>{});
  server?.close();
});
