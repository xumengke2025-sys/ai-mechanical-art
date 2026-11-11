'use strict';
// Original synthesized test foley; no recordings, samples or external assets.
const fs = require('node:fs');
const path = require('node:path');
function makeFoley(target, duration = 24) {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Invalid duration');
  const rate = 48000, frames = Math.round(rate * duration), pcm = Buffer.alloc(frames * 4);
  let seed = 19;
  const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
  const events = [[.98,.025,1850],[1.35,.11,690],[2.6,.07,920],[6.35,.10,570],[7.5,.045,1250],[8.7,.06,810],[9.6,.04,950],[12.9,.10,590],[13.85,.15,310],[14.8,.07,740]];
  const windows = [[3,6.35,-.8,0],[6.7,8.9,0,.1],[10,12.9,0,.8],[15,17.6,.8,-.8]];
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x*x*(3-2*x); };
  for (let i = 0; i < frames; i++) {
    const t = i / rate * 18 / duration, noise = random()*2-1;
    let left = 0, right = 0;
    for (const [a,b,p0,p1] of windows) if (t >= a && t <= b) {
      const u = (t-a)/(b-a), env = smooth((t-a)/.18)*smooth((b-t)/.22);
      const v = env*(.014*Math.sin(2*Math.PI*132*t)+.005*Math.sin(2*Math.PI*264*t)+.002*noise);
      const pan = p0+(p1-p0)*smooth(u);
      left += v*Math.sqrt((1-pan)/2); right += v*Math.sqrt((1+pan)/2);
    }
    for (const [when,amp,freq] of events) {
      const dt = t-when;
      if (dt >= 0 && dt < .36) {
        const v = amp*(.58*Math.sin(2*Math.PI*freq*dt)*Math.exp(-dt*43)+.3*noise*Math.exp(-dt*85)+.12*Math.sin(2*Math.PI*freq*2.71*dt)*Math.exp(-dt*24));
        const pan = Math.max(-.75, Math.min(.75, (when-8)/10));
        left += v*Math.sqrt((1-pan)/2); right += v*Math.sqrt((1+pan)/2);
      }
    }
    pcm.writeInt16LE(Math.trunc(Math.max(-1,Math.min(1,left))*32767), i*4);
    pcm.writeInt16LE(Math.trunc(Math.max(-1,Math.min(1,right))*32767), i*4+2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36+pcm.length,4); header.write('WAVEfmt ',8);
  header.writeUInt32LE(16,16); header.writeUInt16LE(1,20); header.writeUInt16LE(2,22);
  header.writeUInt32LE(rate,24); header.writeUInt32LE(rate*4,28); header.writeUInt16LE(4,32);
  header.writeUInt16LE(16,34); header.write('data',36); header.writeUInt32LE(pcm.length,40);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, Buffer.concat([header,pcm]));
  return {path:target, duration:frames/rate, rate, channels:2, bytes:44+pcm.length};
}
module.exports = {makeFoley};
if (require.main === module) {
  console.log(JSON.stringify(makeFoley(path.resolve(process.argv[2] || 'mechanical-foley.wav'), Number(process.argv[3] || 24)), null, 2));
}
