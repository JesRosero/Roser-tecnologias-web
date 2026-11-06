import { montarMarco } from '../componentes/marco.js';
import { api } from '../componentes/api.js';
import { areas, grupoRecurso, tituloRecurso, rutaRecurso } from '../componentes/secciones.js';
montarMarco();
const grupo=new URLSearchParams(location.search).get('grupo');
const titulo=document.getElementById('titulo'), estado=document.getElementById('estado'), lista=document.getElementById('lista'), buscar=document.getElementById('buscar');
if(!['servicios','aplicaciones','documentos'].includes(grupo)){
 titulo.textContent='Sección no encontrada';estado.textContent='Selecciona una sección en el menú lateral.';buscar.disabled=true;
}else{
 titulo.textContent=areas.find(a=>a.id===grupo).titulo;document.title=titulo.textContent+' — Administrador Roser';
 document.getElementById('descripcion').textContent='Selecciona la página que quieres editar. Los cambios se guardan en este proyecto.';

 try{
  const recursos=await api('recursos');const datos=recursos.filter(r=>grupoRecurso(r)===grupo);
  function render(){
   lista.replaceChildren();const q=buscar.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   for(const r of datos){
    const nombre=tituloRecurso(r);if(!nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q))continue;
    const ruta=rutaRecurso(r);const fila=document.createElement(ruta?'a':'div');fila.className='admin-resumen-fila';if(ruta)fila.href=ruta;
    const div=document.createElement('div');div.append(Object.assign(document.createElement('strong'),{textContent:nombre}),Object.assign(document.createElement('span'),{textContent:ruta?'Contenido editable · guardado local':'Recurso registrado sin editor · requiere integración'}));
    fila.append(div,Object.assign(document.createElement('span'),{textContent:ruta?'Editar →':'Pendiente'}));lista.append(fila);
   }
   estado.textContent=lista.children.length?'':'No hay secciones que coincidan con la búsqueda.';
  }
  buscar.addEventListener('input',render);render();
 }catch(e){estado.textContent='No se pudieron cargar las secciones. '+e.message;}
}
