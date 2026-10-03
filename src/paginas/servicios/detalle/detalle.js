import { leerJSON } from '../../../servicios/archivos.js';
import { cargarContenidoInicio } from '../../../servicios/configuracion-sitio.js';
import { cargarDetalleServicio } from '../../../servicios/configuracion-detalle-servicio.js';
import { montarNavegacion } from '../../../componentes/navegacion/navegacion.js';
import { montarPie } from '../../../componentes/pie-pagina/pie-pagina.js';
const el=id=>document.getElementById(id);
const trazos={rayo:'M13 2 4 14h7l-1 8 10-13h-7z',cubo:'M12 2 3 7v10l9 5 9-5V7z M3 7l9 5 9-5 M12 12v10',archivo:'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',herramienta:'M14 3a6 6 0 0 0-7 7L2 15l3 3 5-5a6 6 0 0 0 7-7l-4 4-3-3z',circuito:'M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4',lupa:'M15 15l7 7 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',engranaje:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z'};
function icono(nombre) {
 const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('stroke','currentColor'); svg.setAttribute('stroke-width','1.3'); svg.setAttribute('aria-hidden','true');
 const path=document.createElementNS(ns,'path'); path.setAttribute('d',trazos[nombre]); svg.append(path);
 if (nombre==='engranaje') { const c=document.createElementNS(ns,'circle'); c.setAttribute('cx','12'); c.setAttribute('cy','12'); c.setAttribute('r','3'); svg.append(c); }
 return svg;
}
try {
 const [comun,textos,c,inicio]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/detalle-servicio.json'),cargarDetalleServicio(document.body.dataset.servicio),cargarContenidoInicio()]);
 montarNavegacion(el('cabecera'),comun.navegacion); montarPie(el('pie'),comun.pie);
 for (const a of el('cabecera').querySelectorAll('nav a')) if (new URL(a.href).pathname==='/paginas/servicios/index.html') a.setAttribute('aria-current','page');
 document.title=`${c.titulo} — ${inicio.hero.marca}`;
 document.querySelector('meta[name="description"]').content=c.introduccion;
 for (const k of ['titulo','subtitulo','introduccion']) el(k).textContent=c[k];
 el('miga-actual').textContent=c.titulo; el('miga-inicio').textContent=textos.inicio; el('miga-servicios').textContent=textos.servicios;
 el('saltar').textContent=textos.saltar; el('volver').textContent=textos.volver;
 for (const [k,ruta] of [['hero-imagen',c.imagen],['contacto-imagen',c.contacto.imagen]]) { el(k).addEventListener('error',()=>{el(k).hidden=true;},{once:true}); el(k).src=ruta; }
 el('evaluacion-titulo').textContent=c.evaluacion.titulo;
 el('areas').replaceChildren(...c.evaluacion.areas.map(a=>{ const card=document.createElement('article');card.className='detalle-area';const h=document.createElement('h3');h.textContent=a.titulo;const p=document.createElement('p');p.textContent=a.descripcion;card.append(icono(a.icono),h,p);return card; }));
 el('proceso-titulo').textContent=c.proceso.titulo;
 el('pasos').replaceChildren(...c.proceso.pasos.map((p,i)=>{const li=document.createElement('li');const n=document.createElement('span');n.className='paso-numero';n.textContent=String(i+1).padStart(2,'0');n.setAttribute('aria-hidden','true');const box=document.createElement('div');const h=document.createElement('h3');h.textContent=p.titulo;const t=document.createElement('p');t.textContent=p.descripcion;box.append(h,t);li.append(n,box);return li;}));
 el('contacto-titulo').textContent=c.contacto.titulo;el('contacto-texto').textContent=c.contacto.texto;
 const url=`https://wa.me/${inicio.contacto.whatsapp}?text=${encodeURIComponent(c.contacto.mensaje)}`;
 for (const [id,label] of [['consultar',textos.consultar],['whatsapp',textos.whatsapp]]) { el(id).textContent=`${label} →`;el(id).href=url;el(id).hidden=false; }
} catch(error) { console.error(error);el('estado').textContent='No se pudo cargar el servicio. Recarga la página.';el('estado').hidden=false; }
