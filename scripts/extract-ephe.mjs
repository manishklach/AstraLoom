import SwissEph from 'swisseph-wasm';
import {mkdir,writeFile} from 'node:fs/promises';
const path=process.argv[2]||'work/ephe431';
const s=new SwissEph();await s.initSwissEph();await mkdir(path,{recursive:true});
for(const name of ['sepl_18.se1','semo_18.se1'])await writeFile(`${path}/${name}`,s.SweModule.FS.readFile(`sweph/${name}`));
console.log('Extracted bundled DE431 ephemerides.');
