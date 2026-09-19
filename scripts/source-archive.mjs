import {readdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {zipSync} from 'fflate';
const omit=new Set(['node_modules','dist','.git','.openai','.sites-runtime','work','test-results']);
const files={};
async function walk(dir='.'){
  for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    if(omit.has(e.name))continue;const p=`${dir}/${e.name}`;
    if(e.isDirectory())await walk(p);
    else if(e.name!=='source.zip')files[p.slice(2)]=[new Uint8Array(await readFile(p)),{mtime:new Date('2000-01-01T00:00:00Z')}];
  }
}
await copyFile('VERIFICATION.md','public/VERIFICATION.md');
await walk();await writeFile('public/source.zip',zipSync(files,{level:6}));
console.log(`Source archive: ${Object.keys(files).length} files`);
