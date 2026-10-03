const IDS = ['productos', 'servicios', 'aplicaciones', 'proyectos'];
export function validarContenido(c) {
  if (!c || c.version !== 1 || c.idioma !== 'es')
    throw new Error('Formato de contenido no compatible.');
  const texto = (v, max = 300) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  for (const k of ['marca', 'titulo', 'lema', 'boton'])
    if (!texto(c.hero?.[k])) throw new Error('Revisa los textos de presentación.');
  if (!['#areas', '#contacto'].includes(c.hero.destino))
    throw new Error('Destino del botón no permitido.');
  validarImagen(c.hero.imagen);
  if (!Array.isArray(c.areas) || c.areas.length !== IDS.length)
    throw new Error('Se necesitan las cuatro áreas.');
  c.areas.forEach((a, i) => {
    if (a.id !== IDS[i] || !texto(a.titulo) || !texto(a.descripcion))
      throw new Error('Revisa los datos de las áreas.');
    validarImagen(a.imagen);
  });
  if (!texto(c.contacto?.correo, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.contacto.correo))
    throw new Error('Correo no válido.');
  if (
    !texto(c.contacto.telefono, 40) ||
    !/^\d{7,15}$/.test(c.contacto.whatsapp) ||
    !texto(c.contacto.ubicacion)
  )
    throw new Error('Revisa los datos de contacto.');
  return c;
}
function validarImagen(v) {
  if (typeof v !== 'string' || !/^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(v) || v.includes('..'))
    throw new Error('La imagen debe tener una ruta dentro de /assets/ y terminar en .webp.');
}
