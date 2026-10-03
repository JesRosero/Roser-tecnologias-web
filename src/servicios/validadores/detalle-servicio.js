export const IDS_DETALLE = [
  'diseno-ingenieria',
  'prototipado-impresion-3d',
  'fabricacion-montaje',
  'mantenimiento-electromecanico',
];
function comprobarID(id) {
  if (!IDS_DETALLE.includes(id)) throw new Error('Servicio no disponible.');
}
export function validarDetalleServicio(c, id) {
  comprobarID(id);
  if (!c || c.version !== 1 || c.idioma !== 'es' || c.id !== id)
    throw new Error('Formato de servicio no compatible.');
  const texto = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 300;
  for (const k of ['titulo', 'subtitulo', 'introduccion'])
    if (!texto(c[k])) throw new Error('Revisa la presentación.');
  for (const ruta of [c.imagen, c.contacto?.imagen])
    if (
      typeof ruta !== 'string' ||
      !/^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(ruta) ||
      ruta.includes('..')
    )
      throw new Error('Usa imágenes WebP dentro de /assets/.');
  for (const [grupo, lista] of [
    ['evaluacion', 'areas'],
    ['proceso', 'pasos'],
  ]) {
    if (!texto(c[grupo]?.titulo) || !Array.isArray(c[grupo][lista]) || c[grupo][lista].length !== 3)
      throw new Error('Revisa las secciones del servicio.');
    for (const item of c[grupo][lista])
      if (!texto(item.titulo) || !texto(item.descripcion))
        throw new Error('Revisa los títulos y las descripciones.');
  }
  for (const a of c.evaluacion.areas)
    if (
      !['rayo', 'engranaje', 'cubo', 'archivo', 'herramienta', 'circuito', 'lupa'].includes(a.icono)
    )
      throw new Error('Icono no compatible.');
  for (const k of ['titulo', 'texto', 'mensaje'])
    if (!texto(c.contacto?.[k])) throw new Error('Revisa el contacto.');
  return c;
}
