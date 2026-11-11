#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const targetArg = process.argv[2];
if (!targetArg || process.argv.length !== 3) {
  console.error('Usage: node init-project.cjs <new-project-directory>');
  process.exit(1);
}
const target = path.resolve(targetArg);
if (fs.existsSync(target)) {
  console.error('Refusing to overwrite an existing path: ' + target);
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
fs.cpSync(path.join(root, 'assets', 'template'), target, {recursive: true});
for (const name of ['render.cjs', 'make-foley.cjs']) {
  fs.copyFileSync(path.join(__dirname, name), path.join(target, name));
}
fs.writeFileSync(path.join(target, '.gitignore'), 'node_modules/\noutput/\n');
console.log('Created: ' + target);
console.log('Next: cd into that directory, npm ci, npm run browser:install, npm run preview');
