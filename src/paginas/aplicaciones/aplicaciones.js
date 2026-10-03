import { leerJSON } from '../../servicios/archivos.js';
import { cargarContenidoAplicaciones } from '../../servicios/configuracion-aplicaciones.js';
import { cargarContenidoInicio } from '../../servicios/configuracion-sitio.js';
import { montarNavegacion } from '../../componentes/navegacion/navegacion.js';
import { montarPie } from '../../componentes/pie-pagina/pie-pagina.js';
import { RUTAS_APLICACIONES } from '../../configuracion/rutas-aplicaciones.js';
const el=id=>document.getElementById(id);
function crearBloque(app,textos,i) {
 const section=document.createElement('section');section.className='app-bloque';section.dataset.app=app.id;section.setAttribute('aria-labelledby',`app-${app.id}`);
 const fondo=document.createElement('img');fondo.className='app-fondo';fondo.alt='';fondo.width=1536;fondo.height=1024;fondo.loading=i?'lazy':'eager';fondo.addEventListener('error',()=>{fondo.hidden=true;},{once:true});fondo.src=app.fondo;
 const fila=document.createElement('div');fila.className='contenedor app-fila';const texto=document.createElement('div');texto.className='app-texto';
 const h=document.createElement('h2');h.id=`app-${app.id}`;h.textContent=app.nombre;
 const categoria=document.createElement('p');categoria.className='app-categoria';categoria.textContent=app.categoria;
 const descripcion=document.createElement('p');descripcion.className='app-descripcion';descripcion.textContent=app.descripcion;
 const link=document.createElement('a');link.className='boton';link.href=RUTAS_APLICACIONES[app.id];link.textContent=`${textos.conocer} →`;link.setAttribute('aria-label',`${textos.conocer}: ${app.nombre}`);texto.append(h,categoria,descripcion,link);
 const telefono=document.createElement('div');telefono.className='telefono';const captura=document.createElement('img');captura.alt=app.alternativo;captura.loading=i?'lazy':'eager';captura.width=899;captura.height=2048;captura.addEventListener('error',()=>{telefono.hidden=true;},{once:true});captura.src=app.captura;telefono.append(captura);
 fila.append(texto,telefono);section.append(fondo,fila);return section;
}
try {
 const [comun,textos,c,inicio]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/aplicaciones.json'),cargarContenidoAplicaciones(),cargarContenidoInicio()]);
 montarNavegacion(el('cabecera'),comun.navegacion);montarPie(el('pie'),comun.pie);
 for (const a of el('cabecera').querySelectorAll('nav a')) if (new URL(a.href).pathname==='/paginas/aplicaciones/index.html') a.setAttribute('aria-current','page');
 document.title=`${c.titulo} — ${inicio.hero.marca}`;document.querySelector('meta[name="description"]').content=c.descripcion;
 el('saltar').textContent=textos.saltar;for (const k of ['etiqueta','titulo','descripcion']) el(k).textContent=c[k];
 el('aplicaciones').replaceChildren(...c.aplicaciones.map((a,i)=>crearBloque(a,textos,i)));
 el('contacto-texto').textContent=c.contacto.texto;el('contactar').textContent=`${c.contacto.enlace} →`;el('contactar').href=`https://wa.me/${inicio.contacto.whatsapp}?text=${encodeURIComponent(c.contacto.mensaje)}`;el('contactar').hidden=false;
} catch(error) {console.error(error);el('estado').textContent='No se pudo cargar Aplicaciones. Recarga la página.';el('estado').hidden=false;}
