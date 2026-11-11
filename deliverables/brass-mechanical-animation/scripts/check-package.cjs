#!/usr/bin/env node
'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST.json'),'utf8'));
const errors=[];
for(const item of manifest.files){
  const file=path.resolve(root,item.path),rel=path.relative(root,file);
  if(rel.startsWith('..') || path.isAbsolute(rel)){errors.push('Invalid path: '+item.path);continue;}
  try{
    const data=fs.readFileSync(file),hash=crypto.createHash('sha256').update(data).digest('hex');
    if(data.length!==item.bytes || hash!==item.sha256)errors.push('Mismatch: '+item.path);
  }catch(e){errors.push(item.path+': '+e.message);}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Package integrity OK: '+manifest.files.length+' files, version '+manifest.version);
