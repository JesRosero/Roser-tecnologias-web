import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
test('integrador conserva admin existente, no duplica acceso y añade MIME local',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'roser-admin-'));
 try{
  await mkdir(path.join(root,'herramientas/bots'),{recursive:true});await mkdir(path.join(root,'admin'),{recursive:true});await mkdir(path.join(root,'herramientas/servidor-local'),{recursive:true});
  const script=path.join(root,'herramientas/bots/integrar-admin.mjs');
  await copyFile(new URL('../integrar-admin.mjs',import.meta.url),script);
  const old='<!doctype html><html><body><main id="editor-anterior">Mi administrador original</main></body></html>';
  await writeFile(path.join(root,'admin/index.html'),old);
  await writeFile(path.join(root,'herramientas/servidor-local/iniciar.mjs'),"const mime = { '.js': 'text/javascript; charset=utf-8', };" );
  await exec(process.execPath,[script]);await exec(process.execPath,[script]);
  const html=await readFile(path.join(root,'admin/index.html'),'utf8');
  assert.ok(html.includes('Mi administrador original'));assert.equal(html.match(/id="roser-bots-admin-access"/g).length,1);
  assert.equal(await readFile(path.join(root,'.roser-local/bots-integracion/admin-index.antes-bots.html'),'utf8'),old);
  assert.ok((await readFile(path.join(root,'herramientas/servidor-local/iniciar.mjs'),'utf8')).includes("'.mjs': 'text/javascript; charset=utf-8'"));
  assert.ok((await readFile(path.join(root,'.gitignore'),'utf8')).includes('.roser-local/'));
 }finally{await rm(root,{recursive:true,force:true});}
});
