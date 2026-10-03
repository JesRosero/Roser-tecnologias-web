export const APLICACIONES_LEGALES = ['3dcost', 'construcost', 'roser'];
export const DOCUMENTOS_LEGALES = ['privacidad', 'terminos'];
function identificar(app, doc) {
  if (!APLICACIONES_LEGALES.includes(app) || !DOCUMENTOS_LEGALES.includes(doc))
    throw new Error('Documento desconocido.');
  return `roser:legal:${app}:${doc}:borrador:es:v1`;
}
export function validarDocumentoLegal(c, app, doc) {
  identificar(app, doc);
  const texto = (v, max = 12000, vacio = false) =>
    typeof v === 'string' && v.length <= max && (vacio || v.trim().length > 0);
  if (
    !c ||
    c.version !== 1 ||
    c.idioma !== 'es' ||
    c.aplicacion !== app ||
    c.documento !== doc ||
    !texto(c.nombre, 300) ||
    !texto(c.titulo, 300) ||
    !texto(c.actualizacion, 300) ||
    !texto(c.introduccion, 12000, true) ||
    !Array.isArray(c.secciones) ||
    c.secciones.length < 1 ||
    c.secciones.length > 80
  )
    throw new Error('Formato de documento inválido.');
  const ids = new Set();
  for (const s of c.secciones) {
    if (
      !s ||
      typeof s.id !== 'string' ||
      !/^[a-z0-9-]+$/.test(s.id) ||
      ids.has(s.id) ||
      !texto(s.titulo, 300) ||
      !Array.isArray(s.bloques) ||
      !s.bloques.length ||
      s.bloques.length > 100
    )
      throw new Error('Apartado inválido.');
    ids.add(s.id);
    for (const b of s.bloques) {
      if (
        !b ||
        (b.tipo !== 'parrafo' && b.tipo !== 'lista') ||
        (b.tipo === 'parrafo' && !texto(b.texto)) ||
        (b.tipo === 'lista' &&
          (!Array.isArray(b.items) ||
            !b.items.length ||
            b.items.length > 100 ||
            !b.items.every((v) => texto(v)) ||
            typeof b.ordenada !== 'boolean'))
      )
        throw new Error('Texto o lista inválidos.');
    }
  }
  return c;
}
