export function validarProyectos(c) {
  const txt = (s, n = 5000, optional = false) => typeof s === 'string' && s.length <= n && (optional || !!s.trim());
  const id = s => typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(s);
  const img = s => txt(s, 300) && /^\/assets\/[a-zA-Z0-9/_. -]+\.webp$/.test(s) && !s.includes('..');
  const unique = a => a.every(x => id(x.id)) && new Set(a.map(x => x.id)).size === a.length;
  const fail = s => { throw Error(s); };
  if (!c || c.version !== 1 || c.idioma !== 'es' || !Array.isArray(c.categorias) || !c.categorias.length || c.categorias.length > 40 || !unique(c.categorias) || !c.categorias.every(x => txt(x.nombre, 100)) || !Array.isArray(c.proyectos) || c.proyectos.length > 500 || !unique(c.proyectos)) fail('Revisa las categorías y los identificadores de proyectos.');
  if (!c.presentacion || !['etiqueta','titulo','descripcion','galeriaTitulo','nota'].every(k => txt(c.presentacion[k], 1000, k === 'nota')) || typeof c.presentacion.mostrarNota !== 'boolean' || !c.contacto || !['titulo','descripcion','boton','mensaje'].every(k => txt(c.contacto[k], 1000))) fail('Revisa la presentación y el contacto.');
  for (const p of c.proyectos) {
    if (!['nombre','resumen','alternativo','alcance','enfoque','materiales','mensaje'].every(k => txt(p[k])) || !txt(p.nota, 2000, true) || !c.categorias.some(x => x.id === p.categoria) || !['concepto','desarrollo','terminado'].includes(p.estado) || !['visible','destacado','mostrarEtapas','mostrarDetalles','mostrarGaleria'].every(k => typeof p[k] === 'boolean') || !Number.isInteger(p.orden) || p.orden < 0 || p.orden > 100000 || !['normal','grande','ancho'].includes(p.formato) || !img(p.imagen) || !txt(p.producto, 100, true) || (p.producto && !id(p.producto))) fail('Revisa los datos del proyecto: ' + (p.nombre || p.id));
    if (!(p.ruta === '/paginas/proyectos/'+p.id+'/index.html' || p.ruta === '/paginas/proyectos/detalle/index.html?id='+p.id)) fail('La ruta no corresponde al proyecto.');
    if (!Array.isArray(p.etapas) || p.etapas.length > 10 || !p.etapas.every(e => txt(e.titulo, 200) && txt(e.texto) && (e.imagen === '' || img(e.imagen)) && typeof e.visible === 'boolean') || !Array.isArray(p.detalles) || p.detalles.length > 30 || !p.detalles.every(d => txt(d.titulo, 200) && txt(d.texto)) || !Array.isArray(p.galeria) || p.galeria.length > 50 || !p.galeria.every(g => img(g.imagen) && txt(g.pie, 1000, true) && txt(g.alternativo, 500))) fail('Revisa las etapas y la galería: ' + p.nombre);
    if (!Array.isArray(p.videos) || p.videos.length > 15 || !p.videos.every(v => { try { const u = new URL(v.url); return u.protocol === 'https:' && !u.username && !u.password && txt(v.titulo, 200); } catch { return false; } })) fail('Los videos requieren título y enlace HTTPS.');
  }
  return c;
}
