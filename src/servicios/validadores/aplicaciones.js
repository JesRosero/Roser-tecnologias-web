const IDS = ['3dcost', 'construcost'];
export function validarContenidoAplicaciones(c) {
  if (!c || c.version !== 1 || c.idioma !== 'es')
    throw new Error('Formato de contenido no compatible.');
  const texto = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 300;
  for (const k of ['etiqueta', 'titulo', 'descripcion'])
    if (!texto(c[k])) throw new Error('Revisa la presentación.');
  if (!Array.isArray(c.aplicaciones) || c.aplicaciones.length !== IDS.length)
    throw new Error('Se necesitan las dos aplicaciones.');
  c.aplicaciones.forEach((a, i) => {
    if (a.id !== IDS[i]) throw new Error('Identificador de aplicación no compatible.');
    for (const k of ['nombre', 'categoria', 'descripcion', 'alternativo'])
      if (!texto(a[k])) throw new Error('Revisa los textos de las aplicaciones.');
    for (const k of ['fondo', 'captura'])
      if (
        typeof a[k] !== 'string' ||
        !/^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(a[k]) ||
        a[k].includes('..')
      )
        throw new Error('Las imágenes deben ser WebP dentro de /assets/.');
  });
  for (const k of ['texto', 'enlace', 'mensaje'])
    if (!texto(c.contacto?.[k])) throw new Error('Revisa el contacto.');
  return c;
}
