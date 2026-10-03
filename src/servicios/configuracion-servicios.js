import { leerJSON } from './archivos.js';
import { validarContenidoServicios } from './validadores/servicios.js';
export { validarContenidoServicios } from './validadores/servicios.js';
export async function cargarContenidoServicios() {
  return validarContenidoServicios(await leerJSON('/datos/contenido-inicial/servicios.es.json'));
}
