import {montarMarco} from '../componentes/marco.js';
import {api,subirImagen} from '../componentes/api.js';
import {contextoVisual,vincularVista} from '../componentes/contexto-visual.js';
import {selectorPaginas} from '../componentes/mapa-visual.js';
import {enlaceSoftware,rutaImagenSoftware} from '/src/servicios/validadores/software.js';
montarMarco();
const el=id=>document.getElementById(id),frame=el('ve-pagina'),dialog=el('ve-dialogo'),params=new URLSearchParams(location.search),id=params.get('pagina');
const crear=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
let ctx,baseRaw,base,borrador,revision,doc,ready=false,busy=false,dirty=false,modo='editar',selected=null,resize;
const overlays=[],token=crypto.randomUUID().replaceAll('-','');
function mensaje(text,error=false){el('ve-estado').textContent=text;el('ve-estado').dataset.error=String(error);}
function controles(){for(const key of ['ve-editar','ve-previa','ve-seo','ve-tamano'])el(key).disabled=!ready||busy;el('ve-guardar').disabled=!ready||busy||!dirty;el('ve-descartar').disabled=!ready||busy||!dirty;el('ve-enlace').disabled=busy;for(const n of dialog.querySelectorAll('button,input,textarea,select'))n.disabled=busy;if(doc?.body)doc.body.inert=busy;}
function cambios(){dirty=JSON.stringify(borrador.campos)!==JSON.stringify(base.campos);controles();
 const pairs=ctx.fields.filter(f=>f.tipo!=='numero'||(borrador.campos[f.id].trim()!==''&&Number.isFinite(Number(borrador.campos[f.id])))).map(f=>[f.path,rawCampo(f)]);frame.contentWindow.__roserPuente?.aplicar(pairs);mensaje(dirty?'Cambios preparados · todavía no se han guardado.':'Sin cambios pendientes.');}
function aplicarCampo(f,excepto=null){const v=borrador.campos[f.id];for(const b of f.bindings){const n=b.element;if(!n.isConnected||n===excepto)continue;
 if(b.attr){if(b.attr==='src'&&!rutaImagenSoftware(v))continue;if(b.attr==='href'&&!enlaceSoftware(b.prefix+v+b.suffix))continue;n.setAttribute(b.attr,b.prefix+v+b.suffix);if(b.attr==='src'){n.hidden=false;const phone=n.closest('.telefono');if(phone)phone.hidden=false;}}
 else{const text=b.prefix+v+b.suffix;if(n.textContent!==text)n.textContent=text;}
}}
function rawCampo(f){if(f.tipo==='booleano')return borrador.campos[f.id]==='true';if(f.tipo==='numero')return Number(borrador.campos[f.id]);return borrador.campos[f.id];}
function panel(title){el('ve-dialogo-titulo').textContent=title;el('ve-dialogo-campos').replaceChildren();if(!dialog.open)dialog.showModal();return el('ve-dialogo-campos');}
function inputCampo(box,f){
 const label=crear('label',f.etiqueta),input=crear(f.tipo==='textarea'?'textarea':f.tipo==='opciones'?'select':'input');input.name=f.id;input.id='native-'+f.id;label.htmlFor=input.id;
 if(f.tipo==='opciones'){for(const [v,name]of f.opciones)input.append(new Option(name,v));input.value=borrador.campos[f.id];}
 else if(f.tipo==='booleano'){input.type='checkbox';input.checked=rawCampo(f);}
 else{if(input.tagName==='INPUT')input.type=f.tipo==='numero'?'number':'text';input.value=borrador.campos[f.id];input.maxLength=f.max;}
 input.addEventListener(f.tipo==='booleano'||f.tipo==='opciones'?'change':'input',()=>{borrador.campos[f.id]=f.tipo==='booleano'?String(input.checked):input.value;aplicarCampo(f);cambios();});
 label.append(input);box.append(label);return input;
}
function foto(f){const box=panel('Cambiar imagen'),image=crear('img');image.src=borrador.campos[f.id];image.alt='Imagen seleccionada';box.append(image);const l=crear('label','Seleccionar imagen de este equipo'),upload=crear('input');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';upload.id='ve-archivo';l.htmlFor=upload.id;l.append(upload);box.append(l);
 const alt=ctx.fields.find(a=>a.bindings.some(b=>b.attr==='alt'&&f.bindings.some(i=>i.attr==='src'&&i.element===b.element)));if(alt)inputCampo(box,alt);
 const details=crear('details');details.append(crear('summary','Ruta de imagen · opción avanzada'));const path=inputCampo(details,f);box.append(details);
 upload.onchange=async()=>{if(!upload.files[0]||busy)return;busy=true;controles();try{const url=await subirImagen(upload.files[0]);borrador.campos[f.id]=url;path.value=url;image.src=url;aplicarCampo(f);cambios();mensaje('Imagen preparada. Cierra este panel y guarda los cambios para conservarla.');}catch(e){mensaje(e.message,true);}finally{busy=false;upload.value='';controles();posiciones();}};
}
function adicionales(){const box=panel('Campos y configuración de esta página'),search=crear('input');search.type='search';search.placeholder='Buscar un campo';search.setAttribute('aria-label','Buscar campo');box.append(search);const list=crear('div');box.append(list);
 function render(){list.replaceChildren();const q=search.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();for(const f of ctx.fields){if(!f.etiqueta.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q))continue;if(f.tipo==='imagen'){const b=crear('button','Cambiar · '+f.etiqueta);b.type='button';b.onclick=()=>foto(f);list.append(b);}else inputCampo(list,f);}}
 search.oninput=render;render();
 const backup=crear('button','Revisar respaldos');backup.id='ve-historial';backup.type='button';backup.onclick=respaldos;box.prepend(backup);
}
async function respaldos(){
 if(busy)return;busy=true;controles();try{
  const rows=await api(ctx.r.id==='catalogo'?'respaldos':'documentos/'+ctx.r.id+'/respaldos'),box=panel('Respaldos de '+ctx.titulo);box.append(crear('p','Preparar un respaldo no lo guarda. Revisa la vista y pulsa Guardar cambios para restaurarlo.'));
  if(!rows.length)box.append(crear('p','Todavía no hay respaldos de esta sección.'));
  for(const row of rows){const b=crear('button',new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(row.fecha)));b.type='button';b.onclick=async()=>{
   if(busy)return;busy=true;controles();try{const data=await api(ctx.r.id==='catalogo'?'respaldos/'+row.id:'documentos/'+ctx.r.id+'/respaldos/'+row.id);const c=data.catalogo;
    box.querySelector('.ve-respaldo-detalle')?.remove();const preview=crear('div');preview.className='ve-respaldo-detalle';preview.append(crear('p','Revisa esta versión antes de prepararla. El guardado reemplazará el contenido de esta sección.'));
    const dl=crear('dl'),view=ctx.toView(c);for(const f of ctx.fields){dl.append(crear('dt',f.etiqueta),crear('dd',view.campos[f.id]??'Campo ausente'));}preview.append(dl);
    const usar=crear('button','Preparar este respaldo');usar.type='button';usar.onclick=async()=>{
      const shape=v=>Array.isArray(v)?v.map(shape):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,['id','ruta','aplicacion','documento'].includes(k)?v[k]:shape(v[k])])):typeof v;
      if(JSON.stringify(shape(c))!==JSON.stringify(shape(baseRaw))){mensaje('Este respaldo cambia la estructura de la sección. Restáuralo desde el formulario completo.',true);return;}
      if(!confirm('¿Preparar este respaldo y reemplazar los cambios sin guardar de esta sección?'))return;
      busy=true;controles();try{
    // Conservar el documento completo del respaldo para una restauración íntegra.
    ctx.actualizar(c);borrador=ctx.toView(c);dirty=true;dialog.close();await cargarVista();mensaje('Respaldo preparado. Guarda los cambios para restaurarlo.');
      }catch(e){mensaje(e.message,true);}finally{busy=false;controles();}
    };preview.prepend(usar);box.append(preview);
   }catch(e){mensaje(e.message,true);}finally{busy=false;controles();}};box.append(b);}
 }catch(e){mensaje(e.message,true);}finally{busy=false;controles();}
}
function enlace(a){const f=ctx.fields.find(f=>f.bindings.some(b=>b.attr==='href'&&b.element===a));if(f){const box=panel('Editar destino');inputCampo(box,f);return;}
 const box=panel('Enlace de navegación');box.append(crear('p','Este destino pertenece a la navegación de la web o utiliza el contacto común. Puedes editar los mensajes y otros datos en Campos y configuración.'));
 const href=a.getAttribute('href'),match=ctx.registro.find(r=>r.rutaPublica===href);
 if(match){const go=crear('a','Abrir esta página en el editor →');go.href='/admin/visual.html?pagina='+encodeURIComponent(match.id);box.append(go);}
}
function posiciones(){if(!doc)return;for(const o of overlays){const r=o.target.getBoundingClientRect();o.button.hidden=r.width<1||r.height<1;o.button.style.top=(r.top+frame.contentWindow.scrollY+8)+'px';o.button.style.left=Math.max(5,r.right+frame.contentWindow.scrollX-145)+'px';}}
function overlay(target,text,fn,id){const b=doc.createElement('button');b.type='button';b.dataset.veUi='true';b.dataset.veImagen=id||'elemento';b.textContent=text;b.onclick=fn;doc.body.append(b);overlays.push({target,button:b});}
function montar(){
 const raw=ctx.toRaw(borrador),item=ctx.item&&(ctx.r.id==='proyectos'?raw.proyectos:raw.productos).find(p=>p.id===ctx.item);
 if(item){el('ve-titulo').textContent=item.nombre;document.title='Editor visual · '+item.nombre;}
 let badge=el('ve-visibilidad');if(item&&!item.visible){if(!badge){badge=crear('p');badge.id='ve-visibilidad';badge.className='ve-ayuda';document.querySelector('.ve-cabecera').after(badge);}badge.textContent='Elemento oculto en la web pública. Aquí se muestra para que puedas editarlo.';}else badge?.remove();
 vincularVista(ctx,doc,borrador);const css=doc.createElement('link');css.rel='stylesheet';css.href='/admin/estilos/visual-lienzo.css?v=48';doc.head.append(css);
 for(const f of ctx.fields){for(const b of f.bindings.filter(b=>!b.attr)){
  const n=b.element;n.dataset.veTexto=f.id;n.title='Editar '+f.etiqueta;
  n.addEventListener('input',()=>{let value=n.textContent;if(b.prefix&&value.startsWith(b.prefix))value=value.slice(b.prefix.length);if(b.suffix&&value.endsWith(b.suffix))value=value.slice(0,-b.suffix.length);borrador.campos[f.id]=value;aplicarCampo(f,n);cambios();});
  n.addEventListener('paste',e=>{e.preventDefault();doc.execCommand('insertText',false,e.clipboardData.getData('text/plain'));});
 }}
 for(const f of ctx.fields.filter(f=>f.tipo==='imagen'))for(const b of f.bindings.filter(b=>b.attr==='src'))overlay(b.element,'Cambiar imagen',()=>foto(f),f.id);
 if(ctx.r.id==='servicios'){const imagenSoftware=doc.querySelector('.servicio-software img');if(imagenSoftware)overlay(imagenSoftware,'Cambiar imagen',()=>location.href='/admin/visual.html?pagina=tarjeta-software&imagen=principal','tarjeta-software');}
 if(ctx.r.id==='catalogo'){
  for(const card of doc.querySelectorAll('.tienda-tarjeta')){const a=card.querySelector('a[href*="id="]');if(!a)continue;const item=new URL(a.href).searchParams.get('id');overlay(card,'Editar producto',()=>location.href='/admin/catalogo.html?producto='+encodeURIComponent(item),'producto-'+item);}
  if(ctx.item)overlay(doc.querySelector('main'),'Editar producto',()=>location.href='/admin/catalogo.html?producto='+encodeURIComponent(ctx.item),'producto-'+ctx.item);
 }
 if(ctx.r.id==='proyectos'&&!ctx.item)for(const tile of doc.querySelectorAll('.proyecto-tile')){const href=tile.getAttribute('href');const p=ctx.raw.proyectos.find(p=>p.ruta===href);overlay(tile,'Editar proyecto',()=>location.href=p?'/admin/visual.html?pagina=proyectos&proyecto='+encodeURIComponent(p.id):'/admin/visual.html?pagina=proyecto-bot-ferreteria','proyecto-'+(p?.id||'bot'));}
 doc.addEventListener('click',e=>{
  if(e.target.closest('[data-ve-ui]'))return;const a=e.target.closest('a');const button=e.target.closest('button');
  if(a){e.preventDefault();if(modo==='editar'){selected=a;el('ve-enlace').hidden=false;return;}const href=a.getAttribute('href');if(href?.startsWith('#'))doc.getElementById(href.slice(1))?.scrollIntoView();else if(href&&enlaceSoftware(href))window.open(a.href,'_blank','noopener,noreferrer');return;}
  if(button&&modo==='editar'&&!button.closest('#cabecera')){e.preventDefault();e.stopImmediatePropagation();}
  if(button&&ctx.r.id==='catalogo'&&button.closest('.tienda-tarjeta,#carrito,#personalizacion')){e.preventDefault();e.stopImmediatePropagation();mensaje('Para modificar un producto utiliza su botón Editar producto.');}
 },true);
 doc.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();mensaje('El formulario se muestra como vista previa. No se ha enviado ningún mensaje.');},true);
 doc.addEventListener('keydown',atajos);resize?.disconnect();resize=new ResizeObserver(posiciones);resize.observe(doc.body);frame.contentWindow.addEventListener('resize',posiciones);posiciones();
 doc.documentElement.dataset.veModo=modo;
 for(const n of doc.querySelectorAll('[data-ve-texto]')){n.contentEditable=modo==='editar'?'plaintext-only':'false';n.tabIndex=modo==='editar'?0:-1;if(modo==='editar'){n.setAttribute('role','textbox');n.setAttribute('aria-label',ctx.fields.find(f=>f.id===n.dataset.veTexto).etiqueta);}}
 ready=true;controles();
}
async function cargarVista(){
 ready=false;controles();overlays.length=0;
 window.__roserVisual={token,archivo:ctx.archivo,leer:()=>ctx.toRaw(borrador),mostrar:ctx.item?{tipo:ctx.r.id==='proyectos'?'proyecto':'producto',id:ctx.item}:null};
 const u=new URL(ctx.ruta,location.origin);try{const anterior=new URL(frame.contentWindow.location.href);if(anterior.origin===u.origin&&anterior.pathname===u.pathname)for(const [k,v]of anterior.searchParams)if(!['__roser_visual','__v'].includes(k))u.searchParams.set(k,v);}catch{}u.searchParams.set('__roser_visual',token);u.searchParams.set('__v',String(Date.now()));const anteriorDocumento=frame.contentDocument;frame.src=u.href;
 const until=Date.now()+15000;while(Date.now()<until){const w=frame.contentWindow,d=frame.contentDocument;if(d!==anteriorDocumento&&w?.__roserPuente?.cargado&&w.__roserPuente.pendientes===0&&d.readyState!=='loading'&&d.querySelector('main')?.textContent.trim().length>12){doc=d;await new Promise(r=>setTimeout(r,100));montar();return;}await new Promise(r=>setTimeout(r,70));}
 throw Error('La vista no terminó de cargar. Comprueba la actualización del servidor y vuelve a abrir el administrador.');
}
async function modoNuevo(value){if(busy||!ready)return;busy=true;controles();try{ctx.validar(borrador);modo=value;await cargarVista();el('ve-editar').setAttribute('aria-pressed',String(modo==='editar'));el('ve-previa').setAttribute('aria-pressed',String(modo==='previa'));el('ve-enlace').hidden=true;mensaje(modo==='previa'?(dirty?'Vista previa del borrador sin guardar.':'Vista previa del contenido guardado.'):(dirty?'Cambios preparados · todavía no se han guardado.':'Sin cambios pendientes.'));}catch(e){mensaje(e.message,true);}finally{busy=false;controles();}}
async function guardar(){if(busy||!ready||!dirty)return;busy=true;controles();let confirmado=false;try{
 const next=structuredClone(borrador);for(const f of ctx.fields)if(!['booleano','numero'].includes(f.tipo)&&next.campos[f.id]!==base.campos[f.id])next.campos[f.id]=next.campos[f.id].trim();for(const f of ctx.fields){if(f.requerido&&!next.campos[f.id].trim())throw Error('Completa el campo: '+f.etiqueta);}
 ctx.validar(next);
 const body=ctx.r.id==='catalogo'?{catalogo:ctx.toRaw(next),revision}:{contenido:ctx.toRaw(next),revision};const r=await api(ctx.r.id==='catalogo'?'catalogo':'documentos/'+ctx.r.id,{method:'PUT',body:JSON.stringify(body)});
 confirmado=true;const c=r.contenido||r.catalogo;ctx.actualizar(c);baseRaw=structuredClone(c);base=ctx.toView(c);borrador=structuredClone(base);revision=r.revision;dirty=false;await cargarVista();mensaje(r.sinCambios?'No hay cambios nuevos.':'Cambios guardados en el proyecto. La página local ya utiliza esta versión.');
 }catch(e){mensaje((confirmado?'El guardado fue confirmado, pero la vista no pudo recargarse. ':'')+e.message,true);}finally{busy=false;controles();}}
async function descartar(){if(busy||!dirty||!confirm('¿Descartar los cambios sin guardar de esta página?'))return;busy=true;controles();try{ctx.actualizar(baseRaw);borrador=structuredClone(base);dirty=false;await cargarVista();mensaje('Cambios descartados.');}catch(e){mensaje(e.message,true);}finally{busy=false;controles();}}
function atajos(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();guardar();}}
el('ve-editar').onclick=()=>modoNuevo('editar');el('ve-previa').onclick=()=>modoNuevo('previa');el('ve-guardar').onclick=guardar;el('ve-descartar').onclick=descartar;el('ve-seo').onclick=adicionales;el('ve-enlace').onclick=()=>{if(selected)enlace(selected);};el('ve-cerrar').onclick=()=>dialog.close();el('ve-tamano').onchange=()=>{el('ve-lienzo').dataset.tamano=el('ve-tamano').value;};document.addEventListener('keydown',atajos);window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
try{
 ctx=await contextoVisual(id,params);baseRaw=structuredClone(ctx.raw);base=ctx.vista;borrador=structuredClone(base);revision=ctx.revision;el('ve-titulo').textContent=ctx.titulo;document.title='Editor visual · '+ctx.titulo;el('ve-seo').textContent='Campos y configuración';
 if(ctx.r.id==='catalogo'&&ctx.item){el('ve-seo').textContent='Editar producto';el('ve-seo').onclick=()=>location.href=ctx.formulario;el('ve-ayuda').textContent='Esta ficha utiliza el catálogo real. Pulsa Editar producto para modificar fotos, precios, variantes y disponibilidad.';}
 if(ctx.formulario){el('ve-formulario').href=ctx.formulario;el('ve-formulario').textContent=ctx.r.id==='catalogo'?(ctx.item?'Editar este producto →':'Administrar productos →'):'Formulario y respaldos →';}else{el('ve-formulario').href='#';el('ve-formulario').onclick=e=>{e.preventDefault();adicionales();};el('ve-formulario').textContent='Campos y respaldos →';}
 await selectorPaginas(id);await cargarVista();mensaje('Sin cambios pendientes.');
 if(ctx.r.id==='tarjeta-software'&&params.get('imagen')==='principal'){const imagen=ctx.fields.find(f=>f.tipo==='imagen'&&f.path.length===1&&f.path[0]==='imagen');if(imagen)foto(imagen);}
}catch(e){el('ve-titulo').textContent='No se pudo abrir esta página';mensaje(e.message,true);controles();}
