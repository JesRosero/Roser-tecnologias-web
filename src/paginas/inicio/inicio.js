import { cargarContenidoInicio } from '../../servicios/configuracion-sitio.js';
import { leerJSON } from '../../servicios/archivos.js';
import { montarNavegacion } from '../../componentes/navegacion/navegacion.js';
import { montarPie } from '../../componentes/pie-pagina/pie-pagina.js';
import { crearTarjetaArea } from '../../componentes/tarjeta-area/tarjeta-area.js';
const elemento = id => document.getElementById(id);
const hero = elemento('imagen-hero');
hero.addEventListener('load', () => { hero.hidden = false; });
if (hero.complete && hero.naturalWidth) hero.hidden = false;
async function iniciar() {
  try {
    const [textos, contenido] = await Promise.all([
      leerJSON('/src/idiomas/es/comun.json'), cargarContenidoInicio()
    ]);
    montarNavegacion(elemento('cabecera'), textos.navegacion);
    montarPie(elemento('pie'), textos.pie);
    for (const [id, texto] of [['marca',contenido.hero.marca],['titulo-inicio',contenido.hero.titulo],['lema',contenido.hero.lema],['explorar',contenido.hero.boton],['contacto-titulo',textos.contacto.titulo],['etiqueta-nombre',textos.contacto.nombre],['etiqueta-correo',textos.contacto.correo],['etiqueta-mensaje',textos.contacto.mensaje],['enviar',textos.contacto.enviar]]) elemento(id).textContent = texto;
    elemento('explorar').href = contenido.hero.destino;
    hero.hidden = true;
    hero.addEventListener('error', () => { hero.hidden = true; });
    hero.src = contenido.hero.imagen;
    if (hero.complete && hero.naturalWidth) hero.hidden = false;
    elemento('tarjetas').replaceChildren(...contenido.areas.map(area => crearTarjetaArea(area, textos.acciones.explorar)));
    elemento('correo').textContent = contenido.contacto.correo; elemento('correo').href = `mailto:${contenido.contacto.correo}`;
    elemento('telefono').textContent = contenido.contacto.telefono; elemento('telefono').href = `tel:+${contenido.contacto.whatsapp}`;
    elemento('ubicacion').textContent = contenido.contacto.ubicacion;
    elemento('form-contacto').addEventListener('submit', evento => {
      evento.preventDefault();
      const datos = new FormData(evento.currentTarget);
      const mensaje = `Hola Roser Tecnologías, me contacto desde el sitio web:\n\nNombre: ${datos.get('nombre')}\nEmail: ${datos.get('correo')}\nMensaje: ${datos.get('mensaje')}`;
      window.open(`https://wa.me/${contenido.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
    });
    elemento('enviar').disabled = false;
  } catch (error) {
    console.error(error);
    elemento('estado').textContent = 'No se pudo cargar el contenido. Recarga la página.';
    elemento('estado').hidden = false;
  }
}
iniciar();
