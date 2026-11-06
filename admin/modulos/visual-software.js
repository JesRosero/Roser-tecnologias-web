import {selectorPaginas} from '../componentes/mapa-visual.js';
import {montarMarco} from '../componentes/marco.js';
import {api,subirImagen} from '../componentes/api.js';
import {validarPaginaSoftware,enlaceSoftware,rutaImagenSoftware} from '/src/servicios/validadores/software.js';
montarMarco();
const el=id=>document.getElementById(id),frame=el('ve-pagina'),dialogo=el('ve-dialogo');
const id=new URLSearchParams(location.search).get('pagina')||'software';
let esquema,pagina,base,borrador,revision,doc,listo=false,ocupado=false,sucio=false,modo='editar',seleccionEnlace=null;
const textos=new Map(),imagenes=new Map(),overlays=new Map();
const crear=(tag,texto)=>{const n=document.createElement(tag);if(texto!==undefined)n.textContent=texto;return n;};
function mensaje(texto,error=false){el('ve-estado').textContent=texto;el('ve-estado').dataset.error=String(error);}
function controles(){
 for(const key of ['ve-editar','ve-previa','ve-seo'])el(key).disabled=!listo||ocupado;
 el('ve-guardar').disabled=!listo||ocupado||!sucio;el('ve-descartar').disabled=!listo||ocupado||!sucio;
 el('ve-tamano').disabled=!listo||ocupado;el('ve-enlace').disabled=!listo||ocupado;
 for(const n of dialogo.querySelectorAll('input,textarea,button'))n.disabled=ocupado;
 if(doc?.body)doc.body.inert=ocupado;
}
function marcar(){sucio=JSON.stringify(borrador.campos)!==JSON.stringify(base.campos);controles();mensaje(sucio?'Cambios preparados · todavía no se han guardado.':'Sin cambios pendientes.');}
function nodo(destino){return doc.querySelector('[data-roser-nodo="'+destino.nodo+'"]');}
function actualizarAlias(f){for(const a of f.destino.aliases||[]){const n=nodo(a);if(n?.childNodes[a.indice])n.childNodes[a.indice].textContent=(a.prefijo||'')+borrador.campos[f.id]+(a.sufijo||'');}}
function actualizarTexto(f){actualizarAlias(f);const span=textos.get(f.id),valor=(f.destino.prefijo||'')+borrador.campos[f.id]+(f.destino.sufijo||'');if(span&&span.textContent!==valor)span.textContent=valor;}
function actualizarAtributo(f){const v=borrador.campos[f.id],d=f.destino,n=nodo(d);if(!n)return;
 if(d.atributo==='src'&&!rutaImagenSoftware(v))return;
 if(d.atributo==='href'&&!enlaceSoftware(v))return;
 n.setAttribute(d.atributo,v);
 if(d.atributo==='href'&&v.startsWith('https:'))n.rel='noopener noreferrer';
}
function aplicarBorrador(){
 for(const f of pagina.campos){const d=f.destino;
  if(d.tipo==='texto')actualizarTexto(f);else if(d.tipo==='atributo')actualizarAtributo(f);
  else if(d.tipo==='titulo')doc.title=borrador.campos[f.id];
  else if(d.tipo==='descripcion')doc.querySelector('meta[name=description]')?.setAttribute('content',borrador.campos[f.id]);
 }
 posicionarImagenes();
}
function cambiarModo(nuevo){
 if(!listo)return;modo=nuevo;doc.documentElement.dataset.veModo=modo;
 for(const [id,span]of textos){const f=pagina.campos.find(f=>f.id===id);span.contentEditable=modo==='editar'?'plaintext-only':'false';span.tabIndex=modo==='editar'?0:-1;
  if(modo==='editar'){span.setAttribute('role','textbox');span.setAttribute('aria-label',f.etiqueta+' · '+f.referencia);span.setAttribute('aria-multiline',String(f.tipo==='textarea'));}
  else{span.removeAttribute('role');span.removeAttribute('aria-label');span.removeAttribute('aria-multiline');}
 }
 el('ve-editar').setAttribute('aria-pressed',String(modo==='editar'));el('ve-previa').setAttribute('aria-pressed',String(modo==='previa'));
 el('ve-enlace').hidden=modo!=='editar'||!seleccionEnlace;
 el('ve-ayuda').textContent=modo==='editar'?'Pulsa un texto para escribir. Usa «Cambiar imagen» sobre las fotografías. Guardar actualiza el proyecto local.':'Vista previa del borrador. Los enlaces a otras páginas se abren fuera del editor; no descartan los cambios.';
 mensaje(modo==='previa'?(sucio?'Vista previa de cambios sin guardar.':'Vista previa del contenido guardado.'):(sucio?'Cambios preparados · todavía no se han guardado.':'Sin cambios pendientes.'));
}
function abrirPanel(titulo){el('ve-dialogo-titulo').textContent=titulo;el('ve-dialogo-campos').replaceChildren();if(!dialogo.open)dialogo.showModal();return el('ve-dialogo-campos');}
function campo(caja,f,{multilinea=false}={}){
 const label=crear('label',f.etiqueta),input=crear(multilinea||f.tipo==='textarea'?'textarea':'input');if(input.tagName==='INPUT')input.type='text';
 input.id='visual-'+f.id;input.name=f.id;input.value=borrador.campos[f.id];input.maxLength=f.max;label.htmlFor=input.id;label.append(input);caja.append(label);return input;
}
function abrirImagen(f){
 const caja=abrirPanel('Cambiar imagen'),vista=crear('img');vista.alt='Vista previa de la imagen';vista.src=borrador.campos[f.id];caja.append(vista);
 const label=crear('label','Seleccionar imagen de este equipo'),archivo=crear('input');archivo.type='file';archivo.accept='image/png,image/jpeg,image/webp';archivo.id='ve-archivo';label.htmlFor=archivo.id;label.append(archivo);caja.append(label);
 const alt=pagina.campos.find(x=>x.destino.nodo===f.destino.nodo&&x.destino.atributo==='alt');
 if(alt){const input=campo(caja,alt,{multilinea:true});input.addEventListener('input',()=>{borrador.campos[alt.id]=input.value;actualizarAtributo(alt);marcar();});}
 const detalles=crear('details'),summary=crear('summary','Ruta de imagen · opción avanzada');detalles.append(summary);const ruta=campo(detalles,f);caja.append(detalles);
 ruta.addEventListener('input',()=>{borrador.campos[f.id]=ruta.value.trim();actualizarAtributo(f);if(rutaImagenSoftware(ruta.value.trim()))vista.src=ruta.value.trim();marcar();});
 archivo.onchange=async()=>{
  const file=archivo.files[0];if(!file||ocupado)return;ocupado=true;controles();mensaje('Copiando imagen al proyecto…');
  try{const path=await subirImagen(file);borrador.campos[f.id]=path;ruta.value=path;vista.src=path;actualizarAtributo(f);sucio=JSON.stringify(borrador.campos)!==JSON.stringify(base.campos);mensaje('Imagen preparada. Cierra este panel y guarda los cambios para conservarla.');}
  catch(e){mensaje(e.message,true);}finally{ocupado=false;archivo.value='';controles();posicionarImagenes();}
 };
}
function abrirEnlace(a){
 const f=pagina.campos.find(f=>f.destino.nodo===a.dataset.roserNodo&&f.destino.atributo==='href');
 const caja=abrirPanel('Destino del botón o enlace');
 if(!f){caja.append(crear('p',a.hasAttribute('data-contacto')?'Este botón utiliza el WhatsApp común de Roser, que se configura en Inicio.':'Este enlace forma parte de la navegación general de la web.'));return;}
 caja.append(crear('p','El texto se edita directamente sobre la página. Aquí cambias su destino.'));
 const input=campo(caja,f);input.addEventListener('input',()=>{borrador.campos[f.id]=input.value.trim();actualizarAtributo(f);marcar();});input.focus();
}
function abrirBuscadores(){
 const caja=abrirPanel('Título y descripción para buscadores');
 for(const f of pagina.campos.filter(f=>f.grupo==='seo')){const input=campo(caja,f,{multilinea:f.destino.tipo==='descripcion'});input.addEventListener('input',()=>{borrador.campos[f.id]=input.value;if(f.destino.tipo==='titulo')doc.title=input.value;else doc.querySelector('meta[name=description]').content=input.value;marcar();});}
}
function posicionarImagenes(){
 if(!doc)return;
 for(const [id,b]of overlays){const im=imagenes.get(id),r=im.getBoundingClientRect();b.hidden=r.width<1||r.height<1;b.style.top=(r.top+frame.contentWindow.scrollY+10)+'px';b.style.left=Math.max(5,r.right+frame.contentWindow.scrollX-144)+'px';}
}
function prepararLienzo(){
 const css=doc.createElement('link');css.rel='stylesheet';css.href='/admin/estilos/visual-lienzo.css';doc.head.append(css);
 // Capturar referencias antes de reemplazar textos: así se conservan los índices de los demás campos.
 const destinos=pagina.campos.filter(f=>f.destino.tipo==='texto').map(f=>({f,n:nodo(f.destino)?.childNodes[f.destino.indice]}));
 if(destinos.some(x=>x.n?.nodeType!==3))throw Error('La plantilla no coincide con sus campos. Abre el formulario y comprueba la instalación.');
 for(const {f,n}of destinos){
  const span=doc.createElement('span');span.dataset.veTexto=f.id;span.dataset.veEnvoltura='true';span.title='Editar '+f.etiqueta.toLowerCase();n.replaceWith(span);textos.set(f.id,span);actualizarTexto(f);
  span.addEventListener('input',()=>{span.removeAttribute('data-ve-error');borrador.campos[f.id]=span.textContent;actualizarAlias(f);marcar();});
  span.addEventListener('beforeinput',e=>{if(f.tipo!=='textarea'&&['insertParagraph','insertLineBreak'].includes(e.inputType))e.preventDefault();});
  span.addEventListener('paste',e=>{e.preventDefault();const plain=e.clipboardData.getData('text/plain');if(plain.length>f.max){mensaje('El texto pegado supera el límite del campo.',true);return;}doc.execCommand('insertText',false,f.tipo==='textarea'?plain:plain.replace(/[\r\n]+/g,' '));});
 }
 for(const f of pagina.campos.filter(f=>f.tipo==='imagen')){
  const im=nodo(f.destino);if(!im)throw Error('Falta una imagen de la plantilla.');imagenes.set(f.id,im);
  const b=doc.createElement('button');b.type='button';b.dataset.veUi='imagen';b.dataset.veImagen=f.id;b.textContent='Cambiar imagen';b.setAttribute('aria-label','Cambiar '+f.etiqueta.toLowerCase());b.onclick=()=>abrirImagen(f);doc.body.append(b);overlays.set(f.id,b);
  im.addEventListener('load',posicionarImagenes);im.addEventListener('error',posicionarImagenes);
 }
 const resize=new ResizeObserver(posicionarImagenes);resize.observe(doc.body);frame.contentWindow.addEventListener('resize',posicionarImagenes);
 doc.addEventListener('click',e=>{
  if(e.target.closest('[data-ve-ui]'))return;
  const button=e.target.closest('button');if(button&&modo==='editar'&&!button.closest('#cabecera')){e.preventDefault();e.stopImmediatePropagation();return;}
  const a=e.target.closest('a');if(a){
   e.preventDefault();
   if(modo==='editar'){if(a.getAttribute('href')?.startsWith('#')&&!e.target.closest('[data-ve-texto]')){doc.getElementById(a.getAttribute('href').slice(1))?.scrollIntoView();return;}seleccionEnlace=a;el('ve-enlace').hidden=false;return;}
   const href=a.getAttribute('href');if(!href)return;
   if(href.startsWith('#')){doc.getElementById(href.slice(1))?.scrollIntoView({behavior:'smooth'});return;}
   if(enlaceSoftware(href))window.open(a.href,'_blank','noopener,noreferrer');return;
  }
  if(modo==='editar'){const im=e.target.closest('img');const f=pagina.campos.find(f=>f.tipo==='imagen'&&f.destino.nodo===im?.dataset.roserNodo);if(f){e.preventDefault();abrirImagen(f);}}
 },true);
 doc.addEventListener('submit',e=>e.preventDefault(),true);
 doc.addEventListener('keydown',atajos);
 aplicarBorrador();listo=true;cambiarModo('editar');controles();
}
function normalizar(){const c=structuredClone(borrador);for(const k of Object.keys(c.campos))c.campos[k]=c.campos[k].trim();return c;}
async function guardar(){
 if(!listo||ocupado||!sucio)return;
 const foco=doc.hasFocus()?doc.activeElement:null,seleccion=doc.getSelection(),rango=seleccion?.rangeCount?seleccion.getRangeAt(0).cloneRange():null;let correcto=false;
 ocupado=true;controles();for(const s of textos.values())s.removeAttribute('data-ve-error');
 try{
  const nuevo=normalizar();validarPaginaSoftware(nuevo,id,esquema);mensaje('Guardando cambios en el proyecto…');
  const r=await api('documentos/'+pagina.recurso,{method:'PUT',body:JSON.stringify({contenido:nuevo,revision})});
  base=structuredClone(r.contenido);borrador=structuredClone(r.contenido);revision=r.revision;sucio=false;correcto=true;aplicarBorrador();mensaje(r.sinCambios?'No hay cambios nuevos.':'Cambios guardados en el proyecto. La página local ya utiliza esta versión.');
 }catch(e){
  if(e.campo){const f=pagina.campos.find(f=>f.id===e.campo);if(f){
   if(f.destino.tipo==='texto'){cambiarModo('editar');const span=textos.get(f.id);span.dataset.veError='true';requestAnimationFrame(()=>{span.scrollIntoView({block:'center'});span.focus();});}
   else if(f.tipo==='imagen')abrirImagen(f);else if(f.grupo==='seo')abrirBuscadores();else if(f.tipo==='url')abrirEnlace(nodo(f.destino));
  }}
  mensaje(e.message,true);
 }finally{ocupado=false;controles();if(correcto&&foco?.matches('[data-ve-texto]'))requestAnimationFrame(()=>{foco.focus();if(rango?.startContainer.isConnected){const s=doc.getSelection();s.removeAllRanges();s.addRange(rango);}});}
}
function descartar(){
 if(!listo||ocupado||!sucio)return;
 if(!confirm('¿Descartar los cambios sin guardar de esta página?'))return;
 borrador=structuredClone(base);sucio=false;for(const span of textos.values())span.removeAttribute('data-ve-error');aplicarBorrador();mensaje('Cambios descartados. Se muestra la última versión guardada.');controles();
}
function atajos(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();guardar();}}
el('ve-editar').onclick=()=>cambiarModo('editar');el('ve-previa').onclick=()=>cambiarModo('previa');el('ve-guardar').onclick=guardar;el('ve-descartar').onclick=descartar;
el('ve-seo').onclick=abrirBuscadores;el('ve-enlace').onclick=()=>{if(seleccionEnlace)abrirEnlace(seleccionEnlace);};el('ve-cerrar').onclick=()=>dialogo.close();
el('ve-tamano').onchange=()=>{el('ve-lienzo').dataset.tamano=el('ve-tamano').value;};
document.addEventListener('keydown',atajos);window.addEventListener('beforeunload',e=>{if(sucio||ocupado){e.preventDefault();e.returnValue='';}});
async function esperarContenido(){
 const limite=Date.now()+15000;
 while(Date.now()<limite){
  if(frame.contentDocument?.documentElement?.dataset.roserContenido==='listo')return;
  if(frame.contentDocument?.documentElement?.dataset.roserContenido==='respaldo')throw Error('No cargó el contenido editable de la página. Comprueba los archivos de la actualización.');
  await new Promise(r=>setTimeout(r,75));
 }
 throw Error('La página tardó demasiado en cargar. Cierra y vuelve a abrir el editor.');
}
try{

 const response=await fetch('/src/configuracion/software-admin.json',{cache:'no-store'});if(!response.ok)throw Error('No se pudo cargar la estructura de la página.');
 esquema=await response.json();pagina=esquema.paginas[id];if(!pagina)throw Error('Página no encontrada.');el('ve-formulario').href='/admin/software.html?pagina='+encodeURIComponent(id);await selectorPaginas(id);
 const r=await api('documentos/'+pagina.recurso);validarPaginaSoftware(r.contenido,id,esquema);base=structuredClone(r.contenido);borrador=structuredClone(r.contenido);revision=r.revision;
 el('ve-titulo').textContent=pagina.nombre;document.title='Editor visual · '+pagina.nombre;
 frame.src=pagina.ruta+'?vista-editor=1';await esperarContenido();doc=frame.contentDocument;prepararLienzo();
}catch(e){mensaje(e.message,true);controles();}
