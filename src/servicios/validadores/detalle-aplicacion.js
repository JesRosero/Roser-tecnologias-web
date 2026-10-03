const IDS = ['3dcost', 'construcost'];
function comprobarId(id) {
  if (!IDS.includes(id)) throw new Error('Aplicación no compatible.');
}
export function validarDetalleAplicacion(c, id = '3dcost') {
  comprobarId(id);
  if (!c || c.id !== id || c.version !== 1 || c.idioma !== 'es')
    throw new Error('Formato de contenido no compatible.');
  const texto = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 300;
  const campos = (obj, keys) => {
    for (const k of keys) if (!texto(obj?.[k])) throw new Error('Revisa los textos del contenido.');
  };
  const imagen = (v) => {
    if (typeof v !== 'string' || !/^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(v) || v.includes('..'))
      throw new Error('Usa imágenes WebP dentro de /assets/.');
  };
  campos(c, ['nombre']);
  campos(c.hero, ['titulo', 'descripcion', 'alternativo']);
  imagen(c.hero.fondo);
  imagen(c.hero.captura);
  for (const [k, host] of [
    ['google', 'play.google.com'],
    ['apple', 'apps.apple.com'],
  ]) {
    let u;
    try {
      u = new URL(c.tiendas?.[k]);
    } catch {
      throw new Error('Revisa los enlaces de las tiendas.');
    }
    if (
      u.protocol !== 'https:' ||
      u.hostname !== host ||
      u.username ||
      u.password ||
      c.tiendas[k].length > 300
    )
      throw new Error('Usa enlaces HTTPS de la tienda correspondiente.');
  }
  for (const [key, n] of [
    ['funciones', 4],
    ['galeria', 3],
    ['planes', 2],
  ]) {
    campos(c[key], ['titulo', 'descripcion']);
    if (!Array.isArray(c[key].items) || c[key].items.length !== n)
      throw new Error('Revisa las secciones de la aplicación.');
  }
  for (const item of c.funciones.items) {
    campos(item, ['titulo', 'descripcion']);
    if (
      !['filamento', 'gota', 'historial', 'archivo', 'materiales', 'resultados', 'costos'].includes(
        item.icono,
      )
    )
      throw new Error('Icono no compatible.');
  }
  for (const item of c.galeria.items) {
    campos(item, ['titulo', 'descripcion', 'alternativo']);
    imagen(item.imagen);
  }
  for (const p of c.planes.items) {
    campos(p, ['nombre', 'titulo']);
    if (
      !Array.isArray(p.beneficios) ||
      p.beneficios.length < 1 ||
      p.beneficios.length > 8 ||
      !p.beneficios.every(texto)
    )
      throw new Error('Revisa los beneficios de cada plan.');
  }
  campos(c.planes, ['nota']);
  campos(c.contacto, ['titulo', 'boton', 'mensaje']);
  return c;
}
