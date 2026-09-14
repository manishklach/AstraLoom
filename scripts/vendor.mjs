import {cp,mkdir} from 'node:fs/promises';
await mkdir('public/vendor/swisseph',{recursive:true});
for(const name of ['src','wasm','LICENSE']) await cp(`node_modules/swisseph-wasm/${name}`,`public/vendor/swisseph/${name}`,{recursive:true});
