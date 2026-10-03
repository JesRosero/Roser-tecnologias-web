import { leerJSON } from './archivos.js';
import { validarContenido } from './validadores/sitio.js';
export { validarContenido } from './validadores/sitio.js';
export async function cargarContenidoInicio() {
  const c = await leerJSON('/datos/contenido-inicial/inicio.es.json');
  c.hero.imagen ??= '/assets/imagenes/inicio/hero.webp';
  c.areas.forEach((a) => {
    a.imagen ??= `/assets/imagenes/inicio/${a.id}.webp`;
  });
  return validarContenido(c);
}
