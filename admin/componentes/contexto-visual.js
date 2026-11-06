import {api} from './api.js';
import {rutaPublica,formulario} from './mapa-visual.js';
const nombres={hero:'Portada',presentacion:'Presentación',contacto:'Contacto',personas:'Personas',perfiles:'Perfiles',origen:'Historia',trabajo:'Trabajo',mision:'Misión',vision:'Visión',areas:'Áreas',servicios:'Servicios',aplicaciones:'Aplicaciones',evaluacion:'Evaluación',proceso:'Proceso',pasos:'Pasos',funciones:'Funciones',galeria:'Galería',planes:'Planes',items:'Elementos',secciones:'Secciones',bloques:'Bloques',parrafos:'Párrafos',proyectos:'Proyectos',comercio:'Configuración comercial',grupos:'Grupos',subcategorias:'Subcategorías',destacados:'Destacados',titulo:'Título',subtitulo:'Subtítulo',introduccion:'Introducción',nombre:'Nombre',descripcion:'Descripción',resumen:'Resumen',texto:'Texto',imagen:'Imagen',imagenes:'Imágenes',alternativo:'Descripción de imagen',captura:'Captura',fondo:'Fondo',etiqueta:'Etiqueta',boton:'Texto del botón',mensaje:'Mensaje de consulta',visible:'Visible',destacado:'Destacado',orden:'Orden',estado:'Estado',formato:'Formato',materiales:'Materiales',nota:'Nota',correo:'Correo',telefono:'Teléfono',whatsapp:'WhatsApp',ubicacion:'Ubicación',actualizacion:'Actualización',alcance:'Alcance',enfoque:'Enfoque',pie:'Pie de imagen',enlace:'Enlace',lema:'Lema'};
export const leerRuta=(obj,path)=>path.reduce((a,k)=>a?.[k],obj);
export function escribirRuta(obj,path,value){let n=obj;for(const k of path.slice(0,-1))n=n[k];n[path.at(-1)]=value;}
export async function contextoVisual(id,params){
 const registro=await api('recursos'),r=registro.find(r=>r.id===id);if(!r||r.editor==='software')throw Error('Página no disponible en este editor.');
 const respuesta=await api(r.id==='catalogo'?'catalogo':'documentos/'+r.id);let raw=respuesta.contenido||respuesta.catalogo;
 const item=r.id==='proyectos'?params.get('proyecto'):r.id==='catalogo'?params.get('producto'):null;let ruta=rutaPublica(r),titulo=r.titulo,prefijo=null;
 if(r.id==='proyectos'&&item){const i=raw.proyectos.findIndex(p=>p.id===item);if(i<0)throw Error('Proyecto no encontrado.');ruta=raw.proyectos[i].ruta;titulo=raw.proyectos[i].nombre;prefijo=['proyectos',i];}
 if(r.id==='catalogo'&&item){const p=raw.productos.find(p=>p.id===item);if(!p)throw Error('Producto no encontrado.');ruta='/paginas/productos/ficha/index.html?id='+encodeURIComponent(item);titulo=p.nombre;}
 if(!ruta)throw Error('No hay página pública asociada a este recurso.');
 const modulo=await import(r.id==='catalogo'?'/src/servicios/catalogo/modelo.js':'/src/servicios/validadores/'+r.modulo+'.js');
 const fields=[],byPath=new Map();const omit=new Set(['id','version','idioma','clave','aplicacion','documento','ruta','icono','tipo','producto','notaInterna','__proto__','constructor','prototype']);
 function recorrer(value,path=[],labels=[]){
  if(Array.isArray(value)){value.forEach((v,i)=>recorrer(v,[...path,i],[...labels,(v?.nombre||v?.titulo||'Elemento '+(i+1)).slice(0,65)]));return;}
  if(value&&typeof value==='object'){for(const [k,v]of Object.entries(value)){
   if(omit.has(k))continue;if(r.id==='catalogo'&&k==='productos')continue;
   if(prefijo&&path.length===0&&k!=='proyectos')continue;
   if(prefijo&&path.length===1&&path[0]==='proyectos')continue;
   recorrer(v,[...path,k],[...labels,nombres[k]||k.replace(/([a-z])([A-Z])/g,'$1 $2')]);
  }return;}
  if(!['string','number','boolean'].includes(typeof value))return;
  const key=path.at(-1),kind=typeof value==='boolean'?'booleano':typeof value==='number'?'numero':typeof value==='string'&&((['imagen','fondo','captura'].includes(key)&&value==='')||(value.startsWith('/assets/')&&/\.(webp|png|jpe?g|avif)(\?|$)/i.test(value)))?'imagen':typeof value==='string'&&/^(https:\/\/|mailto:|tel:|#|\/)/.test(value)?'url':typeof value==='string'&&(value.length>90||['parrafos','texto','descripcion','resumen','mensaje','introduccion','materiales'].includes(key))?'textarea':'text';
  const f={id:'campo-'+path.map(k=>encodeURIComponent(k)).join('__'),path,tipo:kind,etiqueta:labels.join(' · '),max:r.id.startsWith('legal-')?12000:r.id==='proyectos'||r.id==='tarjeta-bot-ferreteria'?5000:r.id==='nosotros'?1800:r.id==='catalogo'?4000:300,requerido:typeof value==='string'&&!!value.trim()&&key!=='nota',original:value,bindings:[]};
  if(key==='estado'){f.tipo='opciones';f.opciones=[['concepto','Concepto'],['desarrollo','En desarrollo'],['terminado','Terminado']];}
  if(key==='formato'){f.tipo='opciones';f.opciones=[['normal','Normal'],['grande','Grande'],['ancho','Ancho']];}
  if(key==='categoria'&&raw.categorias){f.tipo='opciones';f.opciones=raw.categorias.map(x=>[x.id,x.nombre]);}
  if(key==='grupo'&&raw.grupos){f.tipo='opciones';f.opciones=raw.grupos.map(x=>[x.id,x.nombre]);}
  if(key==='tipoDestino'){f.tipo='opciones';f.opciones=[['grupo','Grupo'],['producto','Producto']];}
  if(r.id==='inicio'&&key==='destino'){f.tipo='opciones';f.opciones=[['#areas','Áreas'],['#contacto','Contacto']];}
  fields.push(f);byPath.set(JSON.stringify(path),f);
 }
 if(r.id==='catalogo'&&item){}else if(prefijo)recorrer(leerRuta(raw,prefijo),prefijo,[titulo]);else recorrer(raw);
 if(r.id==='catalogo'&&!item&&raw.comercio.medidaImagen===undefined){recorrer('/assets/imagenes/marketplace/diseno-medida.webp',['comercio','medidaImagen'],['Configuración comercial','Imagen de diseño a medida']);byPath.get(JSON.stringify(['comercio','medidaImagen'])).virtual=true;}
 function toView(c){return {campos:Object.fromEntries(fields.map(f=>[f.id,String(leerRuta(c,f.path)===undefined&&f.virtual?f.original:leerRuta(c,f.path))]))};}
 function toRaw(view){const c=structuredClone(raw);for(const f of fields){let v=view.campos[f.id];if(f.virtual&&leerRuta(raw,f.path)===undefined&&v===f.original)continue;if(f.tipo==='booleano')v=v==='true';else if(f.tipo==='numero'){if(v.trim()===''||!Number.isFinite(Number(v)))throw Error('Revisa '+f.etiqueta);v=Number(v);}escribirRuta(c,f.path,v);}return c;}
 function validar(view){return modulo[r.validar](toRaw(view),...r.args);}
 validar(toView(raw));
 return {r,registro,item,titulo,ruta,fields,byPath,get raw(){return raw;},revision:respuesta.revision,formulario:formulario(r,item),toRaw,toView,validar,actualizar(c){raw=structuredClone(c);},
  get vista(){return toView(raw);},get archivo(){return '/'+r.archivo;},
  scope(doc){if(r.id==='tarjeta-software')return doc.querySelector('.servicio-software')||doc.querySelector('main');if(r.id==='tarjeta-bot-ferreteria')return [...doc.querySelectorAll('.proyecto-tile')].find(a=>a.getAttribute('href')===raw.ruta)||doc.querySelector('main');return doc.querySelector('main');},
  enlaceFormulario:formulario(r,item)
 };
}
export function vincularVista(ctx,doc,view){
 const root=ctx.scope(doc);if(!root)return[];const bound=new WeakMap();for(const f of ctx.fields)f.bindings=[];
 function add(path,element,attr=null,prefix='',suffix=''){
  const f=ctx.byPath.get(JSON.stringify(path));if(!f||!element)return;
  if(!attr){for(let n=element;n&&n!==root.parentElement;n=n.parentElement)if(bound.has(n))return;for(const child of element.querySelectorAll('[data-ve-texto]'))if(child!==element)return;bound.set(element,f.id);}
  const b={element,attr,prefix,suffix};f.bindings.push(b);if(!attr)element.dataset.veTexto=f.id;
 }
 const bind=(path,selector,attr=null,pre='',suf='')=>{for(const n of root.querySelectorAll(selector))add(path.split('.').map(k=>/^\d+$/.test(k)?Number(k):k),n,attr,pre,suf);};
 const id=ctx.r.id,data=ctx.toRaw(view);
 if(id==='inicio'){
  for(const [path,sel,attr]of [['hero.marca','#marca'],['hero.titulo','#titulo-inicio'],['hero.lema','#lema'],['hero.boton','#explorar'],['hero.destino','#explorar','href'],['hero.imagen','#imagen-hero','src'],['contacto.correo','#correo'],['contacto.correo','#correo','href'],['contacto.telefono','#telefono'],['contacto.ubicacion','#ubicacion']])bind(path,sel,attr);
  data.areas.forEach((a,i)=>{const row=root.querySelector('.visual-'+a.id)?.closest('article');if(row){add(['areas',i,'titulo'],row.querySelector('h2'));add(['areas',i,'descripcion'],row.querySelector('p'));add(['areas',i,'imagen'],row.querySelector('img'),'src');}});
  add(['contacto','whatsapp'],root.querySelector('#telefono'),'href','tel:+');
  const correo=ctx.byPath.get(JSON.stringify(['contacto','correo']));if(correo)for(const b of correo.bindings)if(b.attr==='href')b.prefix='mailto:';
 }
 if(id==='servicios'||id.startsWith('servicio-')){
  for(const k of ['titulo','subtitulo','introduccion'])bind(k,'#'+k);bind('imagen',id==='servicios'?'#hero-servicios':'#hero-imagen','src');bind('contacto.titulo','#contacto-titulo');bind('contacto.texto','#contacto-texto');bind('contacto.imagen','#contacto-imagen','src');
  if(id==='servicios')data.servicios.forEach((s,i)=>{const row=root.querySelectorAll('.servicio-tarjeta:not(.servicio-software)')[i];if(row){add(['servicios',i,'titulo'],row.querySelector('h2'));add(['servicios',i,'descripcion'],row.querySelector('p'));add(['servicios',i,'imagen'],row.querySelector('img'),'src');}});
 }
 if(id==='aplicaciones'){
  for(const k of ['etiqueta','titulo','descripcion'])bind(k,'#'+k);data.aplicaciones.forEach((a,i)=>{const row=root.querySelector('[data-app="'+a.id+'"]');if(row){for(const [k,s]of [['nombre','h2'],['categoria','.app-categoria'],['descripcion','.app-descripcion']])add(['aplicaciones',i,k],row.querySelector(s));add(['aplicaciones',i,'fondo'],row.querySelector('.app-fondo'),'src');add(['aplicaciones',i,'captura'],row.querySelector('.telefono img'),'src');add(['aplicaciones',i,'alternativo'],row.querySelector('.telefono img'),'alt');}});
 }
 if(id.startsWith('aplicacion-')){bind('nombre','#nombre');bind('hero.titulo','#lema');bind('hero.descripcion','#descripcion');bind('hero.fondo','#fondo','src');bind('hero.captura','#hero-telefono img','src');bind('hero.alternativo','#hero-telefono img','alt');}
 if(id==='nosotros'){for(const k of ['etiqueta','titulo','lema','descripcion'])bind('hero.'+k,'#'+k);bind('hero.imagen','#hero-imagen','src');bind('hero.nota','#hero-nota');data.personas.perfiles.forEach((p,i)=>{const row=root.querySelector('[data-persona="'+p.id+'"]');if(row){add(['personas','perfiles',i,'nombre'],row.querySelector('h3'));add(['personas','perfiles',i,'imagen'],row.querySelector('img'),'src');add(['personas','perfiles',i,'alternativo'],row.querySelector('img'),'alt');}});}
 if(id.startsWith('legal-')){
  bind('titulo','#titulo');bind('nombre','#marca');bind('introduccion','#introduccion');const actual=root.querySelector('#actualizacion');if(actual){const v=String(data.actualizacion),text=actual.textContent;add(['actualizacion'],actual,null,text.slice(0,text.lastIndexOf(v)));}
  data.secciones.forEach((s,i)=>{const row=doc.getElementById(s.id);if(!row)return;add(['secciones',i,'titulo'],row.querySelector('h2'),null,(i+1)+'. ');const a=[...root.querySelectorAll('#indice a')].find(a=>a.getAttribute('href')==='#'+s.id);add(['secciones',i,'titulo'],a);
   const bloques=[...row.children].filter(n=>n.tagName!=='H2');s.bloques.forEach((b,j)=>{if(b.tipo==='parrafo')add(['secciones',i,'bloques',j,'texto'],bloques[j]);else b.items.forEach((v,k)=>add(['secciones',i,'bloques',j,'items',k],bloques[j]?.children[k]));});
  });
 }
 if(id==='proyectos'){
  if(ctx.item){const i=data.proyectos.findIndex(p=>p.id===ctx.item),p=data.proyectos[i],path=['proyectos',i];add([...path,'nombre'],root.querySelector('h1'));add([...path,'resumen'],root.querySelector('.proyectos-lema'));add([...path,'imagen'],root.querySelector('.proyecto-principal img'),'src');add([...path,'alternativo'],root.querySelector('.proyecto-principal img'),'alt');p.galeria.forEach((g,j)=>{const row=root.querySelectorAll('.proyecto-galeria figure')[j];if(row){for(const [key,sel,attr]of [['imagen','img','src'],['alternativo','img','alt'],['pie','figcaption',null]])add([...path,'galeria',j,key],row.querySelector(sel),attr);}});}
  else for(const [i,p]of data.proyectos.entries()){const row=[...root.querySelectorAll('.proyecto-tile')].find(a=>a.getAttribute('href')===p.ruta);if(row){add(['proyectos',i,'nombre'],row.querySelector('h3'));add(['proyectos',i,'imagen'],row.querySelector('img'),'src');add(['proyectos',i,'alternativo'],row.querySelector('img'),'alt');}}
 }
 if(id==='catalogo'&&!ctx.item){bind('comercio.titulo','#titulo');bind('comercio.descripcion','#descripcion');for(const k of ['Titulo','Descripcion','Boton'])bind('comercio.medida'+k,'#medida-'+k.toLowerCase(),null,'',k==='Boton'?' →':'');}

 // Vinculación explícita por estructura: no se adivina la propiedad por el texto visible.
 if(id.startsWith('servicio-')){
  bind('evaluacion.titulo','#evaluacion-titulo');bind('proceso.titulo','#proceso-titulo');
  data.evaluacion.areas.forEach((a,i)=>{const row=root.querySelectorAll('#areas .detalle-area')[i];if(row){add(['evaluacion','areas',i,'titulo'],row.querySelector('h3'));add(['evaluacion','areas',i,'descripcion'],row.querySelector('p'));}});
  data.proceso.pasos.forEach((a,i)=>{const row=root.querySelectorAll('#pasos li')[i];if(row){add(['proceso','pasos',i,'titulo'],row.querySelector('h3'));add(['proceso','pasos',i,'descripcion'],row.querySelector('p'));}});
 }
 if(id==='aplicaciones'){bind('contacto.texto','#contacto-texto');bind('contacto.enlace','#contactar',null,'',' →');}
 if(id.startsWith('aplicacion-')){
  for(const section of ['funciones','galeria','planes']){bind(section+'.titulo','#'+section+'-titulo');bind(section+'.descripcion','#'+section+'-descripcion');}
  data.funciones.items.forEach((f,i)=>{const row=root.querySelectorAll('#funciones article')[i];if(row){add(['funciones','items',i,'titulo'],row.querySelector('h3'));add(['funciones','items',i,'descripcion'],row.querySelector('p'));}});
  data.galeria.items.forEach((g,i)=>{const row=root.querySelectorAll('#galeria figure')[i];if(row){for(const [k,sel,attr]of [['titulo','h3',null],['descripcion','p',null],['imagen','img','src'],['alternativo','img','alt']])add(['galeria','items',i,k],row.querySelector(sel),attr);}});
  data.planes.items.forEach((a,i)=>{const row=root.querySelectorAll('#planes article')[i];if(row){add(['planes','items',i,'nombre'],row.querySelector('h3'));add(['planes','items',i,'titulo'],row.querySelector('p'));a.beneficios.forEach((v,j)=>add(['planes','items',i,'beneficios',j],row.querySelectorAll('li')[j]));}});
  bind('planes.nota','#planes-nota');bind('contacto.titulo','#contacto-titulo');bind('contacto.boton','#contactar',null,'',' →');
  add(['tiendas','google'],root.querySelectorAll('#tiendas a')[0],'href');add(['tiendas','apple'],root.querySelectorAll('#tiendas a')[1],'href');
 }
 if(id==='nosotros'){
  bind('origen.titulo','#origen-titulo');data.origen.parrafos.forEach((t,i)=>add(['origen','parrafos',i],root.querySelectorAll('#origen>p')[i]));bind('personas.titulo','#personas-titulo');
  data.personas.perfiles.forEach((p,i)=>{const row=root.querySelector('[data-persona="'+p.id+'"]');if(row){add(['personas','perfiles',i,'cargo'],row.querySelector('.nosotros-cargo'));p.parrafos.forEach((v,j)=>add(['personas','perfiles',i,'parrafos',j],row.querySelectorAll('.nosotros-biografia>p')[j]));}});
  for(const k of ['trabajo','mision','vision','contacto'])for(const sub of ['titulo','descripcion'])bind(k+'.'+sub,'#'+k+'-'+sub);
  data.trabajo.pasos.forEach((v,i)=>add(['trabajo','pasos',i],root.querySelectorAll('#pasos strong')[i]));bind('contacto.boton','#contactar',null,'',' →');
 }
 if(id==='proyectos'&&!ctx.item){
  add(['presentacion','etiqueta'],root.querySelector('.proyectos-intro .proyectos-etiqueta'));add(['presentacion','titulo'],root.querySelector('.proyectos-intro h1'));add(['presentacion','descripcion'],root.querySelector('.proyectos-intro .proyectos-lema'));add(['presentacion','galeriaTitulo'],root.querySelector('.proyectos-galeria-cabecera h2'));add(['presentacion','nota'],root.querySelector('.proyectos-nota'));
  add(['contacto','titulo'],root.querySelector('.proyectos-contacto h2'));add(['contacto','descripcion'],root.querySelector('.proyectos-contacto p'));add(['contacto','boton'],root.querySelector('.proyectos-contacto a'));
 }
 if(id==='proyectos'&&ctx.item){
  const index=data.proyectos.findIndex(p=>p.id===ctx.item),p=data.proyectos[index],path=['proyectos',index];
  add([...path,'nota'],root.querySelector('.proyecto-presentacion>.proyectos-nota'));add([...path,'alcance'],root.querySelectorAll('.proyecto-meta dd')[0]);add([...path,'enfoque'],root.querySelectorAll('.proyecto-meta dd')[1]);
  let visible=0;p.etapas.forEach((e,i)=>{if(!e.visible||!p.mostrarEtapas)return;const row=root.querySelectorAll('.proyecto-etapas article')[visible++];if(row){add([...path,'etapas',i,'titulo'],row.querySelector('h3 span:last-child'));add([...path,'etapas',i,'texto'],row.querySelector('p'));add([...path,'etapas',i,'imagen'],row.querySelector('img'),'src');}});
  p.detalles.forEach((d,i)=>{const row=root.querySelectorAll('.proyecto-detalles article')[i];if(row){add([...path,'detalles',i,'titulo'],row.querySelector('h3'));add([...path,'detalles',i,'texto'],row.querySelector('p'));}});
  add([...path,'materiales'],root.querySelector('.proyecto-materiales-bloque p'));p.videos.forEach((v,i)=>{const a=root.querySelectorAll('.proyecto-video')[i];add([...path,'videos',i,'titulo'],a,null,'',' ↗');add([...path,'videos',i,'url'],a,'href');});
 }
 if(id==='catalogo'&&!ctx.item){
  data.grupos.forEach((g,i)=>{const row=root.querySelector('[data-grupo="'+g.id+'"].tienda-categoria');if(row){add(['grupos',i,'nombre'],row.querySelector('strong'));add(['grupos',i,'imagen'],row.querySelector('img'),'src');add(['grupos',i,'nombre'],row.querySelector('img'),'alt');}});
  data.destacados.forEach((d,i)=>{const row=root.querySelector('[data-destacado="'+d.id+'"]');if(row){for(const [k,sel,attr,suffix]of [['titulo','h2',null,''],['descripcion','p',null,''],['boton','.tienda-boton',null,' →'],['imagen','img','src','']])add(['destacados',i,k],row.querySelector(sel),attr,'',suffix);}});
  bind('comercio.medidaImagen','.tienda-medida-imagen','src');
 }
 if(id==='tarjeta-software'){add(['titulo'],root.querySelector('h2'));add(['descripcion'],root.querySelector('p'));add(['imagen'],root.querySelector('img'),'src');}
 if(id==='tarjeta-bot-ferreteria'){add(['nombre'],root.querySelector('h3'));add(['imagen'],root.querySelector('img'),'src');add(['alternativo'],root.querySelector('img'),'alt');}
 return ctx.fields;

}
