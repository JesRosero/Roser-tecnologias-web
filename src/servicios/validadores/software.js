// Contrato compartido por el editor, el servidor local y la página pública.
export function rutaImagenSoftware(valor) {
 if(typeof valor!=='string'||!valor.startsWith('/assets/')||valor.startsWith('//')||/[\\\u0000-\u0020]/.test(valor))return false;
 try{if(decodeURIComponent(valor.split(/[?#]/)[0]).split('/').includes('..'))return false;const u=new URL(valor,'https://roser.local');const p=decodeURIComponent(u.pathname);return p.startsWith('/assets/')&&u.origin==='https://roser.local'&&!p.split('/').includes('..')&&!p.includes('\\')&&/\.(webp|png|jpe?g|avif)$/i.test(p)&&!u.hash;}catch{return false;}
}
export function enlaceSoftware(valor) {
 if(typeof valor!=='string'||!valor||/[\\\u0000-\u0020]/.test(valor)||valor.startsWith('//'))return false;
 if(valor.startsWith('#'))return /^#[a-zA-Z0-9_.:-]+$/.test(valor);
 if(valor.startsWith('/')){try{return !decodeURIComponent(valor.split(/[?#]/)[0]).split('/').includes('..');}catch{return false;}}
 try{const u=new URL(valor);return !u.username&&!u.password&&((u.protocol==='https:'&&!!u.hostname)||(u.protocol==='mailto:'&&/^[^@\s]+@[^@\s]+$/.test(u.pathname))||(u.protocol==='tel:'&&/^\+?[0-9()-]+$/.test(u.pathname)));}catch{return false;}
}
export function validarPaginaSoftware(c,id,esquema) {
 const pagina=esquema?.paginas?.[id];
 if(!pagina||!c||c.version!==1||c.idioma!=='es'||c.pagina!==id||!c.campos||typeof c.campos!=='object'||Array.isArray(c.campos))throw Error('Contenido de página incompatible.');
 if(Object.keys(c).some(k=>!['version','idioma','pagina','campos'].includes(k))||Object.keys(c.campos).length!==pagina.campos.length)throw Error('La estructura de la página cambió. Recarga el administrador.');
 function fallo(m,f){const e=Error(m);e.campo=f.id;throw e;}
 for(const f of pagina.campos){
  const valor=c.campos[f.id];
  if(typeof valor!=='string'||valor.length>f.max||(f.requerido&&!valor.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(valor))fallo('Revisa «'+f.etiqueta+'»: valor vacío, demasiado largo o no válido.',f);
  if(f.tipo==='imagen'&&!rutaImagenSoftware(valor))fallo('La imagen debe estar dentro de /assets/ y ser WebP, PNG, JPG o AVIF.',f);
  if(f.tipo==='url'&&!enlaceSoftware(valor))fallo('Revisa «'+f.etiqueta+'»: utiliza una ruta local, ancla, HTTPS, correo o teléfono válido.',f);
 }
 return c;
}
