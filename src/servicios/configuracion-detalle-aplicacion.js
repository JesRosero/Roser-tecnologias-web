import { leerJSON } from './archivos.js';
import { validarDetalleAplicacion } from './validadores/detalle-aplicacion.js';
export { validarDetalleAplicacion } from './validadores/detalle-aplicacion.js';
export async function cargarDetalleAplicacion(id = '3dcost') {
  if (!['3dcost', 'construcost'].includes(id)) throw Error('Aplicación desconocida.');
  return validarDetalleAplicacion(
    await leerJSON(`/datos/contenido-inicial/aplicaciones/${id}.es.json`),
    id,
  );
}
