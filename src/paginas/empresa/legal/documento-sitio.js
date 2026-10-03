import { leerJSON } from '/src/servicios/archivos.js';
import { cargarDocumentoLegal } from '/src/servicios/configuracion-documento-legal.js';
import { montarNavegacion } from '/src/componentes/navegacion/navegacion.js';
import { montarPie } from '/src/componentes/pie-pagina/pie-pagina.js';
import { RUTAS } from '/src/configuracion/rutas.js';
const el=id=>document.getElementById(id);
const crear=(tag,texto)=>{const n=document.createElement(tag);if(texto)n.textContent=texto;return n;};

function conEnlaces(n,texto) {
 const patron=/https:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
 let desde=0;
 for(const m of texto.matchAll(patron)) {
  const valor=m[0].replace(/[.,;]+$/,'');
  n.append(document.createTextNode(texto.slice(desde,m.index)));
  const a=crear('a',valor);a.href=valor.startsWith('https://')?valor:`mailto:${valor}`;
  if(valor.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}
  n.append(a);desde=m.index+valor.length;
 }
 n.append(document.createTextNode(texto.slice(desde)));return n;
}

let t;
try {
 const app='roser'; const {documento:doc}=document.body.dataset;
 const [comun,idioma,c]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/documento-sitio.json'),cargarDocumentoLegal(app,doc)]);t=idioma;
 montarNavegacion(el('cabecera'),comun.navegacion);montarPie(el('pie'),comun.pie);

 document.title=`${c.titulo} — ${c.nombre}`;
 document.querySelector('meta[name=description]').content=`${c.titulo} de ${c.nombre}.`;
 el('saltar').textContent=t.saltar;el('miga-inicio').textContent=t.inicio;
 el('miga-documento').textContent=c.titulo;
 el('marca').textContent=c.nombre;
 el('titulo').textContent=c.titulo;el('actualizacion').textContent=`${t.actualizacion} ${c.actualizacion}`;
 el('introduccion').textContent=c.introduccion;el('introduccion').hidden=!c.introduccion;
 el('indice-titulo').textContent=t.indice;el('pestanas').setAttribute('aria-label',t.documentos);
 for(const key of ['privacidad','terminos']){const a=crear('a',t[key]);a.href=RUTAS[key];if(key===doc)a.setAttribute('aria-current','page');el('pestanas').append(a);}
 for(const [i,s] of c.secciones.entries()) {
  const li=crear('li');const a=crear('a',s.titulo);a.href=`#${s.id}`;li.append(a);el('indice').append(li);
  const section=crear('section');section.id=s.id;const h=crear('h2',`${i+1}. ${s.titulo}`);section.append(h);
  for(const b of s.bloques){if(b.tipo==='parrafo')section.append(conEnlaces(crear('p'),b.texto));else{const lista=crear(b.ordenada?'ol':'ul');for(const item of b.items)lista.append(conEnlaces(crear('li'),item));section.append(lista);}}
  el('lectura').append(section);
 }
 el('volver').textContent=`← ${t.volver}`;el('volver').href=RUTAS.inicio;el('volver').hidden=false;
}catch(error){console.error(error);el('estado').hidden=false;el('estado').textContent=t?.error||'No se pudo cargar el documento. Recarga la página.';}
