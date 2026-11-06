import {montarMarco} from '../componentes/marco.js';
import {api,subirImagen} from '../componentes/api.js';
import {validarPaginaSoftware} from '/src/servicios/validadores/software.js';
montarMarco();
const id=new URLSearchParams(location.search).get('pagina');
const el=id=>document.getElementById(id),form=el('editor-software'),entradas=new Map(),imagenes=new Map(),grupos=new Map(),botones=new Map();
let esquema,pagina,contenido,revision,sucio=false,ocupado=false,grupoActual;
function estado(texto,error=false){el('estado').textContent=texto;el('estado').dataset.error=String(error);}
function controles(){form.inert=ocupado;form.setAttribute('aria-busy',String(ocupado));el('guardar').disabled=!contenido||ocupado;el('respaldos').disabled=!contenido||ocupado;}
function cambiarGrupo(id){grupoActual=id;if(el('selector-apartado'))el('selector-apartado').value=id;for(const [k,grupo]of grupos)grupo.hidden=id!==k;for(const [k,b]of botones)b.setAttribute('aria-pressed',String(k===id));}
function marcar(){sucio=true;estado('Hay cambios sin guardar en esta página.');}
function crear(tag,texto){const n=document.createElement(tag);if(texto!==undefined)n.textContent=texto;return n;}
function refrescarImagen(id){const im=imagenes.get(id);if(im)im.src=entradas.get(id).value;}
function recoger(){const c=structuredClone(contenido);for(const [id,input]of entradas)c.campos[id]=input.value.trim();return c;}
function rellenar(c){for(const [id,input]of entradas)input.value=c.campos[id];for(const id of imagenes.keys())refrescarImagen(id);}
function errorCampo(e){
 estado(e.message,true);if(e.campo){const f=pagina.campos.find(f=>f.id===e.campo);if(f){cambiarGrupo(f.grupo);requestAnimationFrame(()=>entradas.get(f.id)?.focus());}}
}
async function guardar(evento){
 evento.preventDefault();if(ocupado||!contenido)return;ocupado=true;controles();
 try{
  const nuevo=recoger();validarPaginaSoftware(nuevo,id,esquema);
  const r=await api('documentos/'+pagina.recurso,{method:'PUT',body:JSON.stringify({contenido:nuevo,revision})});
  contenido=r.contenido;revision=r.revision;sucio=false;
  estado(r.sinCambios?'No hay cambios nuevos.':'Cambios guardados en el proyecto. Ya puedes revisar la página local.');
 }catch(e){errorCampo(e);}finally{ocupado=false;controles();}
}
async function respaldos(){
 if(ocupado)return;ocupado=true;controles();let dialogo;
 try{
  const rows=await api('documentos/'+pagina.recurso+'/respaldos');dialogo=crear('dialog');dialogo.className='admin-respaldos';dialogo.setAttribute('aria-labelledby','titulo-historial-software');
  const titulo=crear('h2','Respaldos de '+pagina.nombre);titulo.id='titulo-historial-software';dialogo.append(titulo);
  const cerrar=crear('button','Cerrar');cerrar.type='button';cerrar.onclick=()=>dialogo.close();dialogo.append(cerrar);
  dialogo.append(crear('p','Usar un respaldo prepara la edición. Debes guardar para restaurarlo en la página.'));
  if(!rows.length)dialogo.append(crear('p','Todavía no hay respaldos de esta página.'));
  const detalle=crear('div');
  for(const row of rows){
   const b=crear('button',new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Bogota'}).format(new Date(row.fecha)));b.type='button';
   b.onclick=async()=>{
    b.disabled=true;
    try{
     const dato=await api('documentos/'+pagina.recurso+'/respaldos/'+encodeURIComponent(row.id));validarPaginaSoftware(dato.catalogo,id,esquema);
     detalle.replaceChildren();const listado=crear('dl');
     for(const f of pagina.campos){listado.append(crear('dt',f.etiqueta),crear('dd',dato.catalogo.campos[f.id]));}
     const usar=crear('button','Usar este respaldo');usar.type='button';usar.onclick=()=>{
      if(!confirm('¿Preparar este respaldo? Reemplazará los cambios sin guardar de esta página.'))return;
      rellenar(dato.catalogo);sucio=true;estado('Respaldo preparado. Revisa los apartados y guarda para restaurar la página.');dialogo.close();
     };
     detalle.append(usar,listado);
    }catch(e){detalle.replaceChildren(crear('p',e.message));}finally{b.disabled=false;}
   };dialogo.append(b);
  }
  dialogo.append(detalle);dialogo.addEventListener('close',()=>dialogo.remove(),{once:true});document.body.append(dialogo);dialogo.showModal();
 }catch(e){estado(e.message,true);dialogo?.remove();}finally{ocupado=false;controles();}
}
function montar(){
 const selectorLabel=crear('label','Apartado de la página'),selector=crear('select');selectorLabel.className='admin-software-selector';selector.id='selector-apartado';selectorLabel.htmlFor=selector.id;selector.onchange=()=>cambiarGrupo(selector.value);selectorLabel.append(selector);el('apartados').before(selectorLabel);
 for(const g of pagina.grupos){
  selector.append(new Option(g.titulo,g.id));
  const b=crear('button',g.titulo);b.type='button';b.onclick=()=>cambiarGrupo(g.id);botones.set(g.id,b);el('apartados').append(b);
  const grupo=crear('fieldset');grupo.append(crear('legend',g.titulo));grupos.set(g.id,grupo);el('campos-software').append(grupo);
 }
 for(const f of pagina.campos){
  const caja=crear('div');caja.className='admin-software-campo';const label=crear('label',f.etiqueta),input=crear(f.tipo==='textarea'?'textarea':'input');input.id='campo-'+f.id;input.name=f.id;
  if(f.tipo!=='textarea')input.type='text';if(f.tipo==='url'||f.tipo==='imagen')input.inputMode='url';
  input.maxLength=f.max;input.required=!!f.requerido;input.value=contenido.campos[f.id];label.htmlFor=input.id;
  if(f.tipo==='textarea')input.rows=3;input.addEventListener('input',marcar);caja.append(label,input);entradas.set(f.id,input);
  if(f.referencia){const ayuda=crear('small','Referencia: '+f.referencia);caja.append(ayuda);}
  if(f.tipo==='imagen'){
   const img=crear('img');img.className='admin-software-imagen';img.alt='Vista previa de la imagen seleccionada';
   const aviso=crear('small','Vista previa no disponible. Comprueba que la imagen exista dentro del proyecto.');aviso.hidden=true;
   img.onerror=()=>{aviso.hidden=false;img.hidden=true;};img.onload=()=>{aviso.hidden=true;img.hidden=false;};imagenes.set(f.id,img);input.addEventListener('change',()=>refrescarImagen(f.id));
   const subir=crear('input');subir.type='file';subir.accept='image/png,image/jpeg,image/webp';const uploadLabel=crear('label','Seleccionar imagen (se copia al proyecto en WebP)');subir.id='subir-'+f.id;uploadLabel.htmlFor=subir.id;
   subir.onchange=async()=>{
    const file=subir.files[0];if(!file||ocupado)return;ocupado=true;controles();
    try{input.value=await subirImagen(file);refrescarImagen(f.id);sucio=true;estado('Imagen copiada al proyecto. Guarda los cambios para usarla en la página.');}
    catch(e){estado(e.message,true);}finally{ocupado=false;controles();subir.value='';}
   };
   caja.append(img,aviso,uploadLabel,subir);refrescarImagen(f.id);
  }
  grupos.get(f.grupo).append(caja);
 }
 cambiarGrupo(pagina.grupos.find(g=>g.id!=='seo')?.id||'seo');
}
form.addEventListener('submit',guardar);el('respaldos').onclick=respaldos;
window.addEventListener('beforeunload',e=>{if(sucio||ocupado){e.preventDefault();e.returnValue='';}});
try{
 const response=await fetch('/src/configuracion/software-admin.json',{cache:'no-store'});if(!response.ok)throw Error('No se pudo cargar la estructura de las páginas.');esquema=await response.json();pagina=esquema.paginas[id];
 if(!pagina)throw Error('Página desconocida. Selecciona una página desde Servicios, Documentos o Proyectos.');
 const r=await api('documentos/'+pagina.recurso);validarPaginaSoftware(r.contenido,id,esquema);contenido=r.contenido;revision=r.revision;
 if(pagina){const visual=crear('a','Abrir editor visual →');visual.href='/admin/visual.html?pagina='+encodeURIComponent(id);visual.className='admin-caso-bot';form.before(visual);}
 el('titulo').textContent=pagina.nombre;document.title=pagina.nombre+' — Administrador Roser';el('ver-pagina').href=pagina.ruta;el('ver-pagina').hidden=false;
 montar();controles();estado('Contenido cargado desde los archivos del proyecto.');
}catch(e){el('titulo').textContent='No se pudo abrir esta página';estado(e.message,true);controles();}
