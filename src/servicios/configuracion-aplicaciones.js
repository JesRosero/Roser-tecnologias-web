import { leerJSON } from './archivos.js';
import { validarContenidoAplicaciones } from './validadores/aplicaciones.js';
export { validarContenidoAplicaciones } from './validadores/aplicaciones.js';
export async function cargarContenidoAplicaciones() {
  return validarContenidoAplicaciones(
    await leerJSON('/datos/contenido-inicial/aplicaciones.es.json'),
  );
}
