const IDS = [
  'diseno-ingenieria',
  'prototipado-impresion-3d',
  'fabricacion-montaje',
  'mantenimiento-electromecanico',
];
export function validarContenidoServicios(c) {
  if (!c || c.version !== 1 || c.idioma !== 'es')
    throw new Error('Formato de contenido no compatible.');
  const texto = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 300;
  const imagen = (v) => {
    if (typeof v !== 'string' || !/^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(v) || v.includes('..'))
      throw new Error('La imagen debe estar dentro de /assets/ y terminar en .webp.');
  };
  for (const k of ['titulo', 'subtitulo', 'introduccion'])
    if (!texto(c[k])) throw new Error('Revisa los textos de presentación.');
  imagen(c.imagen);
  if (!Array.isArray(c.servicios) || c.servicios.length !== IDS.length)
    throw new Error('Se necesitan las cuatro áreas de servicios.');
  c.servicios.forEach((s, i) => {
    if (s.id !== IDS[i] || !texto(s.titulo) || !texto(s.descripcion))
      throw new Error('Revisa los datos de los servicios.');
    imagen(s.imagen);
  });
  for (const k of ['titulo', 'texto', 'mensaje'])
    if (!texto(c.contacto?.[k])) throw new Error('Revisa los textos de contacto.');
  return c;
}
