import { mkdir,copyFile,rm } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));process.chdir(root);
await rm('www',{recursive:true,force:true});await mkdir('www');
for(const name of ['index.html','styles.css','config.js','core.js','audio.js','ads.js','game.js','icon.svg','privacy.html'])await copyFile(name,`www/${name}`);
await build({entryPoints:['src/native.js'],bundle:true,format:'iife',target:'es2020',outfile:'www/native.js',minify:true});
console.log('Built www — web assets and bundled native AdMob adapter.');
