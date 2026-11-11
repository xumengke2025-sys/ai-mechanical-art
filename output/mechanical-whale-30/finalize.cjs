const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const ff=require('../probation-film/ffmpeg-runtime.cjs');const root=__dirname;
const silent=path.join(root,process.argv[2]||'renders/whale-silent-v1.mp4'),output=path.join(root,process.argv[3]||'delivery/mechanical-whale-30.mp4');fs.mkdirSync(path.dirname(output),{recursive:true});
function run(args){const r=spawnSync(ff,args,{encoding:'utf8',maxBuffer:8*1024*1024});if(r.status!==0)throw Error(r.stderr);return r;}
run(['-hide_banner','-loglevel','error','-y','-i',silent,'-i',path.join(root,'renders/soundtrack.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af','loudnorm=I=-20:TP=-1:LRA=9','-c:a','aac','-b:a','192k','-ar','48000','-t','30','-movflags','+faststart',output]);
const meta=spawnSync(ff,['-hide_banner','-i',output],{encoding:'utf8'}).stderr;
const decoded=run(['-v','error','-i',output,'-map','0:v:0','-map','0:a:0','-progress','pipe:1','-f','null','-']);
const frames=[...decoded.stdout.matchAll(/^frame=(\d+)/gm)].at(-1)?.[1];if(+frames!==900)throw Error('Expected 900 decoded frames, got '+frames);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sources={};for(const f of ['scene.js','index.html','render.cjs','compose.py'])sources[f]=hash(path.join(root,f));
const data={video:output,sha256:hash(output),bytes:fs.statSync(output).size,decoded_frames:+frames,decode_exit:decoded.status,metadata:meta,source_hashes:sources,audio_listened:false};
fs.writeFileSync(path.join(root,'qa','final-technical.json'),JSON.stringify(data,null,2));
run(['-v','error','-y','-ss','27.6','-i',output,'-frames:v','1',path.join(root,'delivery/cover.png')]);
console.log(JSON.stringify({video:output,sha256:data.sha256,bytes:data.bytes,frames:data.decoded_frames}));
