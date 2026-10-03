import { leerJSON } from './archivos.js';
import { validarDetalleServicio, IDS_DETALLE } from './validadores/detalle-servicio.js';
export { validarDetalleServicio, IDS_DETALLE } from './validadores/detalle-servicio.js';
export async function cargarDetalleServicio(id) {
  if (!IDS_DETALLE.includes(id)) throw Error('Servicio desconocido.');
  return validarDetalleServicio(
    await leerJSON(`/datos/contenido-inicial/servicios/${id}.es.json`),
    id,
  );
}
