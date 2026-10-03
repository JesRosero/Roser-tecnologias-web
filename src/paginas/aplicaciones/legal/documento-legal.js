import { leerJSON } from '/src/servicios/archivos.js';
import { cargarDocumentoLegal } from '/src/servicios/configuracion-documento-legal.js';
import { montarNavegacion } from '/src/componentes/navegacion/navegacion.js';
import { montarPie } from '/src/componentes/pie-pagina/pie-pagina.js';
import { RUTAS_APLICACIONES, ENLACES_LEGALES_APLICACIONES } from '/src/configuracion/rutas-aplicaciones.js';
const el=id=>document.getElementById(id);
const crear=(tag,texto)=>{const n=document.createElement(tag);if(texto)n.textContent=texto;return n;};
let t;
try {
 const {aplicacion:app,documento:doc}=document.body.dataset;
 const [comun,idioma,c]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/documento-legal.json'),cargarDocumentoLegal(app,doc)]);t=idioma;
 montarNavegacion(el('cabecera'),comun.navegacion);montarPie(el('pie'),comun.pie);
 document.querySelectorAll('#cabecera nav a').forEach(a=>{if(new URL(a.href).pathname==='/paginas/aplicaciones/index.html')a.setAttribute('aria-current','page');});
 document.title=`${c.titulo} — ${c.nombre} | Roser Tecnologías`;
 document.querySelector('meta[name=description]').content=`${c.titulo} de ${c.nombre}.`;
 el('saltar').textContent=t.saltar;el('miga-aplicaciones').textContent=t.aplicaciones;
 el('miga-app').textContent=c.nombre;el('miga-app').href=RUTAS_APLICACIONES[app];el('miga-documento').textContent=c.titulo;
 el('marca').textContent=c.nombre;
 if(app==='3dcost'&&c.nombre.startsWith('3D'))el('marca').replaceChildren(crear('span','3D'),document.createTextNode(c.nombre.slice(2)));
 if(app==='construcost'&&c.nombre.endsWith('Cost'))el('marca').replaceChildren(document.createTextNode(c.nombre.slice(0,-4)),crear('span','Cost'));
 el('titulo').textContent=c.titulo;el('actualizacion').textContent=`${t.actualizacion} ${c.actualizacion}`;
 el('introduccion').textContent=c.introduccion;el('introduccion').hidden=!c.introduccion;
 el('indice-titulo').textContent=t.indice;el('pestanas').setAttribute('aria-label',t.documentos);
 for(const key of ['privacidad','terminos']){const a=crear('a',t[key]);a.href=ENLACES_LEGALES_APLICACIONES[app][key];if(key===doc)a.setAttribute('aria-current','page');el('pestanas').append(a);}
 for(const [i,s] of c.secciones.entries()) {
  const li=crear('li');const a=crear('a',s.titulo);a.href=`#${s.id}`;li.append(a);el('indice').append(li);
  const section=crear('section');section.id=s.id;const h=crear('h2',`${i+1}. ${s.titulo}`);section.append(h);
  for(const b of s.bloques){if(b.tipo==='parrafo')section.append(crear('p',b.texto));else{const lista=crear(b.ordenada?'ol':'ul');for(const item of b.items)lista.append(crear('li',item));section.append(lista);}}
  el('lectura').append(section);
 }
 el('volver').textContent=`← ${t.volver}`;el('volver').href=RUTAS_APLICACIONES[app];el('volver').hidden=false;
}catch(error){console.error(error);el('estado').hidden=false;el('estado').textContent=t?.error||'No se pudo cargar el documento. Recarga la página.';}
