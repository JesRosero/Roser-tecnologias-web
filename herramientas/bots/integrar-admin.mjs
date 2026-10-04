import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const file=path.join(root,'admin/index.html');
await mkdir(path.dirname(file),{recursive:true});
let html;
try{await access(file);html=await readFile(file,'utf8');}
catch{
  html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Administrador Roser</title><link rel="stylesheet" href="/src/estilos/tema.css"></head><body style="margin:0;padding:40px;background:var(--color-fondo);color:var(--color-texto);font-family:var(--fuente-base)"><main><h1>Administrador Roser Tecnologías</h1><p>Selecciona el área que deseas administrar.</p></main></body></html>';
}
if(!html.includes('id="roser-bots-admin-access"')){
  const link='<aside id="roser-bots-admin-access" style="margin:16px;padding:16px 20px;border:1px solid #2a3b50;border-radius:12px;background:#111c2b;color:#f4f7fc;font:14px/1.5 system-ui"><a href="/admin/bots/" style="color:#59c7f2;font-weight:700;text-decoration:none">Bots de WhatsApp →</a><span style="display:block;color:#b2bfd0;margin-top:4px">Catálogo y configuración en Firebase · requiere inicio de sesión</span></aside>';
  const marker=/<body\b[^>]*>/i;
  if(!marker.test(html))throw new Error('admin/index.html no tiene una etiqueta body. No se modificó.');
  const backupDir=path.join(root,'.roser-local/bots-integracion');
  try{await access(file);await mkdir(backupDir,{recursive:true});await copyFile(file,path.join(backupDir,'admin-index.antes-bots.html'));}catch(e){if(e.code!=='ENOENT')throw e;}
  html=html.replace(marker,match=>match+link);
  await writeFile(file,html);
  console.log('Acceso a Bots integrado en admin/index.html. Conserva el resto del administrador.');
}else console.log('El acceso a Bots ya estaba integrado; no se duplicó.');
const ignorePath=path.join(root,'.gitignore');
let ignore='';try{ignore=await readFile(ignorePath,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
if(!ignore.split(/\r?\n/).some(line=>line.trim()==='.roser-local/'))await writeFile(ignorePath,ignore+'\n.roser-local/\n');
// El servidor del administrador de escritorio debe servir los módulos ES con MIME JavaScript.
const localServer=path.join(root,'herramientas/servidor-local/iniciar.mjs');
try {
  const source=await readFile(localServer,'utf8');
  if(!source.includes("'.mjs':")) {
    const jsMime=/(['"])\.js\1\s*:\s*(['"])text\/javascript; charset=utf-8\2\s*,/;
    if(jsMime.test(source)) {
      await writeFile(localServer,source.replace(jsMime,match=>match+"\n    '.mjs': 'text/javascript; charset=utf-8',"));
      console.log('MIME .mjs añadido al servidor local.');
    }else console.log('No se reconoció la tabla MIME del servidor local. Usa el panel publicado o añade .mjs con text/javascript.');
  }
}catch(e){if(e.code!=='ENOENT')throw e;}
