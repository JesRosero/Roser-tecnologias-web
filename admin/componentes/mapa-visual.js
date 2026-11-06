import {api} from './api.js';
export function rutaPublica(r){
 if(r.rutaPublica)return r.rutaPublica;
 if(r.id==='inicio')return '/index.html';
 if(r.id==='servicios')return '/paginas/servicios/index.html';
 if(r.id==='aplicaciones')return '/paginas/aplicaciones/index.html';
 if(r.id==='nosotros')return '/paginas/empresa/nosotros/index.html';
 if(r.id==='catalogo')return '/paginas/productos/index.html';
 if(r.id==='proyectos')return '/paginas/proyectos/index.html';
 if(r.id.startsWith('servicio-'))return '/paginas/servicios/'+r.args[0]+'/index.html';
 if(r.id.startsWith('aplicacion-'))return '/paginas/aplicaciones/'+r.args[0]+'/index.html';
 if(r.id.startsWith('legal-'))return '/paginas/'+(r.args[0]==='roser'?'empresa':'aplicaciones/'+r.args[0])+'/'+r.args[1]+'/index.html';
 return null;
}
export function formulario(r,item){
 if(r.editor==='software')return '/admin/software.html?pagina='+encodeURIComponent(r.pagina);
 if(r.id==='inicio')return '/admin/index.html';
 if(r.id==='catalogo')return '/admin/catalogo.html'+(item?'?producto='+encodeURIComponent(item):'');
 if(r.id==='proyectos')return '/admin/proyectos.html'+(item?'?proyecto='+encodeURIComponent(item):'');
 if(r.id.startsWith('servicio-'))return '/admin/detalle-servicio.html?servicio='+encodeURIComponent(r.args[0]);
 if(r.id.startsWith('aplicacion-'))return '/admin/detalle-aplicacion.html?aplicacion='+encodeURIComponent(r.args[0]);
 if(r.id.startsWith('legal-'))return '/admin/'+(r.args[0]==='roser'?'documento-sitio.html?':'documento-legal.html?aplicacion='+r.args[0]+'&')+'documento='+r.args[1];
 if(['servicios','aplicaciones','nosotros'].includes(r.id))return '/admin/'+r.id+'.html';
 return null;
}
export async function selectorPaginas(actual){
 const rows=await api('recursos'),box=document.createElement('label');box.className='ve-selector-paginas';box.textContent='Página';const select=document.createElement('select');select.id='ve-navegar';select.setAttribute('aria-label','Página que quieres editar');
 const group=new Map();
 for(const r of rows){
  const id=r.editor==='software'?r.pagina:r.id;if(!rutaPublica(r)&&r.editor!=='software')continue;
  const name=r.titulo,cat=r.grupo||(r.id.startsWith('legal-')?'Documentos':r.id.startsWith('servicio-')||r.id==='servicios'?'Servicios':r.id.startsWith('aplicacion-')||r.id==='aplicaciones'?'Aplicaciones':'Sitio');
  if(!group.has(cat)){const g=document.createElement('optgroup');g.label=cat.charAt(0).toUpperCase()+cat.slice(1);group.set(cat,g);select.append(g);}
  const href='/admin/visual.html?pagina='+encodeURIComponent(id);const op=new Option(name,href);op.selected=id===actual&&!new URLSearchParams(location.search).has('proyecto')&&!new URLSearchParams(location.search).has('producto');group.get(cat).append(op);
 }
 const specs=[['proyectos','documentos/proyectos','proyectos','proyecto','Páginas de proyectos'],['catalogo','catalogo','productos','producto','Fichas de productos']];
 for(const [id,endpoint,key,param,label]of specs){try{const data=await api(endpoint),raw=data.contenido||data.catalogo,g=document.createElement('optgroup');g.label=label;for(const item of raw[key]){const href='/admin/visual.html?pagina='+id+'&'+param+'='+encodeURIComponent(item.id);const op=new Option(item.nombre+(item.visible?'':' · oculto'),href);op.selected=actual===id&&new URLSearchParams(location.search).get(param)===item.id;g.append(op);}select.append(g);}catch{}}
 const selected=select.value;select.onchange=()=>{location.href=select.value;select.value=selected;};box.append(select);document.querySelector('.ve-cabecera').after(box);return rows;
}
