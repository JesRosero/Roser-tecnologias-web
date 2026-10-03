import { normalizarCatalogo } from './catalogo/normalizacion.js';
import { leerJSON } from './archivos.js';
import { validarCatalogo } from './catalogo/modelo.js';
export { validarCatalogo } from './catalogo/modelo.js';
// La web pública siempre lee el archivo del proyecto, sin borradores del navegador.
export async function cargarCatalogo() {
  return normalizarCatalogo(
    validarCatalogo(await leerJSON('/datos/contenido-inicial/catalogo.es.json')),
  );
}
async function api(ruta, opciones = {}) {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('/__roser/' + ruta, {
      ...opciones,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'X-Roser-Local': '1',
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...opciones.headers,
      },
    });
    let dato;
    try {
      dato = await res.json();
    } catch {
      throw Error(
        'Abre este panel desde Administrador Roser, en http://127.0.0.1:8088/admin/catalogo.html.',
      );
    }
    if (!res.ok) throw Error(dato.error || 'No se pudo completar la operación local.');
    return dato;
  } catch (e) {
    if (e.name === 'AbortError')
      throw Error('El servidor no respondió. Comprueba el catálogo antes de volver a guardar.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export async function cargarEdicionCatalogo() {
  const d = await api('catalogo');
  validarCatalogo(d.catalogo);
  normalizarCatalogo(d.catalogo);
  return d;
}
export function guardarCatalogo(catalogo, revision) {
  validarCatalogo(catalogo);
  return api('catalogo', { method: 'PUT', body: JSON.stringify({ catalogo, revision }) });
}
export const listarRespaldos = () => api('respaldos');
export async function cargarRespaldo(id) {
  const d = await api('respaldos/' + encodeURIComponent(id));
  validarCatalogo(d.catalogo);
  return d;
}
