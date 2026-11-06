import {validarPaginaSoftware} from '/src/servicios/validadores/software.js';
export async function cargarPaginaSoftware() {
 const id=document.documentElement.dataset.roserPagina;if(!id)return;
 try{
  const [resEsquema,resContenido]=await Promise.all([fetch('/src/configuracion/software-admin.json',{cache:'no-store'}),fetch('/datos/contenido-inicial/software/'+encodeURIComponent(id)+'.es.json',{cache:'no-store'})]);
  if(!resEsquema.ok||!resContenido.ok)throw Error('No se pudo recuperar el contenido editable.');
  const [esquema,c]=await Promise.all([resEsquema.json(),resContenido.json()]);validarPaginaSoftware(c,id,esquema);
  // Comprobar todos los destinos antes de modificar la página.
  const operaciones=esquema.paginas[id].campos.map(f=>{
   const d=f.destino;if(['titulo','descripcion'].includes(d.tipo))return {f};
   const nodo=document.querySelector('[data-roser-nodo="'+d.nodo+'"]');
   if(!nodo||(d.tipo==='texto'&&nodo.childNodes[d.indice]?.nodeType!==Node.TEXT_NODE))throw Error('La plantilla no coincide con su contenido.');
   for(const alias of d.aliases||[]){const a=document.querySelector('[data-roser-nodo="'+alias.nodo+'"]');if(!a||a.childNodes[alias.indice]?.nodeType!==Node.TEXT_NODE)throw Error('El índice no coincide con el documento.');}
   return {f,nodo};
  });
  for(const {f,nodo} of operaciones){
   const d=f.destino,v=c.campos[f.id];
   if(d.tipo==='titulo')document.title=v;
   else if(d.tipo==='descripcion')document.querySelector('meta[name=description]')?.setAttribute('content',v);
   else if(d.tipo==='texto'){
    nodo.childNodes[d.indice].textContent=(d.prefijo||'')+v+(d.sufijo||'');
    for(const alias of d.aliases||[])document.querySelector('[data-roser-nodo="'+alias.nodo+'"]').childNodes[alias.indice].textContent=(alias.prefijo||'')+v+(alias.sufijo||'');
   }
   else if(d.tipo==='atributo'&&['src','alt','href'].includes(d.atributo)){
    nodo.setAttribute(d.atributo,v);
    if(d.atributo==='href'&&v.startsWith('https:'))nodo.rel='noopener noreferrer';
   }
  }
  document.documentElement.dataset.roserContenido='listo';
 }catch(e){document.documentElement.dataset.roserContenido='respaldo';console.error('Se mantiene el contenido de respaldo de la página.',e);}
}
