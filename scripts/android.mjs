import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const npx=process.platform==='win32'?'npx.cmd':'npx';
if(!existsSync('android'))execFileSync(npx,['cap','add','android'],{stdio:'inherit',shell:process.platform==='win32'});
execFileSync(npx,['cap','sync','android'],{stdio:'inherit',shell:process.platform==='win32'});
await import('./configure-android.mjs');
