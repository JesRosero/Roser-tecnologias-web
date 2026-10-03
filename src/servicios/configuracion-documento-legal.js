import { leerJSON } from './archivos.js';
import {
  validarDocumentoLegal,
  APLICACIONES_LEGALES,
  DOCUMENTOS_LEGALES,
} from './validadores/documento-legal.js';
export {
  validarDocumentoLegal,
  APLICACIONES_LEGALES,
  DOCUMENTOS_LEGALES,
} from './validadores/documento-legal.js';
export async function cargarDocumentoLegal(app, doc) {
  if (!APLICACIONES_LEGALES.includes(app) || !DOCUMENTOS_LEGALES.includes(doc))
    throw Error('Documento desconocido.');
  return validarDocumentoLegal(
    await leerJSON(`/datos/contenido-inicial/legales/${app}/${doc}.es.json`),
    app,
    doc,
  );
}
