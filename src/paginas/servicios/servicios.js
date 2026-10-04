import { leerJSON } from '../../servicios/archivos.js';
import { cargarContenidoServicios } from '../../servicios/configuracion-servicios.js';
import { cargarContenidoInicio } from '../../servicios/configuracion-sitio.js';
import { montarNavegacion } from '../../componentes/navegacion/navegacion.js';
import { montarPie } from '../../componentes/pie-pagina/pie-pagina.js';
import { RUTAS_SERVICIOS } from '../../configuracion/rutas-servicios.js';
const el = id => document.getElementById(id);
function crearTarjeta(servicio, etiqueta) {
  const tarjeta = document.createElement('article'); tarjeta.className = 'servicio-tarjeta';
  if(servicio.id === 'desarrollo-software') tarjeta.classList.add('servicio-software');
  const visual = document.createElement('div'); visual.className = 'servicio-imagen';
  const imagen = document.createElement('img'); imagen.alt = ''; imagen.width = 1536; imagen.height = 1024; imagen.loading = 'lazy';
  imagen.addEventListener('error', () => { imagen.hidden = true; }, { once: true }); imagen.src = servicio.id === 'desarrollo-software' ? '/assets/imagenes/software/actualizacion-34/tarjeta.webp' : servicio.imagen; visual.append(imagen);
  const cuerpo = document.createElement('div'); cuerpo.className = 'servicio-cuerpo';
  const titulo = document.createElement('h2'); titulo.textContent = servicio.titulo;
  const descripcion = document.createElement('p'); descripcion.textContent = servicio.descripcion;
  const enlace = document.createElement('a'); enlace.href = RUTAS_SERVICIOS[servicio.id]; enlace.textContent = `${etiqueta} →`; enlace.setAttribute('aria-label', `${etiqueta}: ${servicio.titulo}`);
  cuerpo.append(titulo,descripcion,enlace); tarjeta.append(visual,cuerpo); return tarjeta;
}
try {
  const [comun, textos, contenido, inicio] = await Promise.all([
    leerJSON('/src/idiomas/es/comun.json'), leerJSON('/src/idiomas/es/servicios.json'),
    cargarContenidoServicios(), cargarContenidoInicio()
  ]);
  montarNavegacion(el('cabecera'),comun.navegacion); montarPie(el('pie'),comun.pie);
  for (const a of el('cabecera').querySelectorAll('nav a')) if (new URL(a.href).pathname === location.pathname) a.setAttribute('aria-current','page');
  el('saltar').textContent = textos.saltar; el('catalogo').setAttribute('aria-label', contenido.titulo);
  el('marca').textContent = inicio.hero.marca;
  for (const k of ['titulo','subtitulo','introduccion']) el(k).textContent = contenido[k];
  el('hero-servicios').addEventListener('error', () => { el('hero-servicios').hidden = true; }, { once: true });
  el('hero-servicios').src = contenido.imagen;
  const software=await leerJSON('/datos/contenido-inicial/software-servicio.es.json'); if(!contenido.servicios.some(s=>s.id===software.id))contenido.servicios.push(software);
  el('servicios-grid').replaceChildren(...contenido.servicios.map(s => crearTarjeta(s,textos.conocer)));
  el('contacto-titulo').textContent = contenido.contacto.titulo; el('contacto-texto').textContent = contenido.contacto.texto;
  el('contactar').textContent = textos.contactar;
  el('contactar').href = `https://wa.me/${inicio.contacto.whatsapp}?text=${encodeURIComponent(contenido.contacto.mensaje)}`;
  el('contactar').hidden = false;
} catch(error) {
  console.error(error); el('estado').textContent = 'No se pudo cargar el contenido. Recarga la página.'; el('estado').hidden = false;
}
