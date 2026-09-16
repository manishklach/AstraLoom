import {defineConfig} from 'vite';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
export default defineConfig({root,base:'./',publicDir:resolve(root,'public'),build:{outDir:resolve(root,'../public/studio'),emptyOutDir:true}});
