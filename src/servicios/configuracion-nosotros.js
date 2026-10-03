import { leerJSON } from './archivos.js';
import { validarContenidoNosotros } from './validadores/nosotros.js';
export { validarContenidoNosotros } from './validadores/nosotros.js';
export async function cargarContenidoNosotros() {
  return validarContenidoNosotros(await leerJSON('/datos/contenido-inicial/nosotros.es.json'));
}
