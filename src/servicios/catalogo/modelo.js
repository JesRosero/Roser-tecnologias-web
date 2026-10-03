export const ESTADOS = ['disponible', 'pedido', 'agotado', 'consultar', 'desarrollo'];
const texto = (v, max = 4000, vacio = false) =>
  typeof v === 'string' && v.length <= max && (vacio || v.trim().length > 0);
const id = (v) => typeof v === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(v);
const ruta = (v) =>
  texto(v, 300, true) &&
  (!v || (/^\/assets\/[a-zA-Z0-9/_. -]+\.webp$/.test(v) && !v.includes('..')));
const monto = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 1000000000;
const fallo = (m) => {
  throw Error(m);
};
function unicos(a) {
  const ids = a.map((x) => x.id);
  return ids.every(id) && new Set(ids).size === ids.length;
}
export function validarCatalogo(c) {
  if (
    !c ||
    c.version !== 1 ||
    c.idioma !== 'es' ||
    !Array.isArray(c.grupos) ||
    !c.grupos.length ||
    !Array.isArray(c.subcategorias) ||
    !Array.isArray(c.productos) ||
    !Array.isArray(c.destacados)
  )
    fallo('Formato del catálogo no compatible.');
  for (const a of [c.grupos, c.subcategorias, c.productos, c.destacados])
    if (a.length > 1000 || !unicos(a)) fallo('Identificadores repetidos o inválidos.');
  for (const g of c.grupos)
    if (!texto(g.nombre, 200) || !ruta(g.imagen) || typeof g.visible !== 'boolean')
      fallo('Grupo inválido.');
  for (const s of c.subcategorias)
    if (
      !c.grupos.some((g) => g.id === s.grupo) ||
      !texto(s.nombre, 200) ||
      typeof s.visible !== 'boolean'
    )
      fallo('Subcategoría inválida.');
  const refs = new Set();
  for (const p of c.productos) {
    if (
      !texto(p.nombre, 300) ||
      !texto(p.referencia, 100) ||
      refs.has(p.referencia.toLowerCase()) ||
      !texto(p.descripcion) ||
      !texto(p.preparacion, 300) ||
      !texto(p.notaInterna, 4000, true) ||
      typeof p.visible !== 'boolean' ||
      typeof p.destacado !== 'boolean' ||
      !c.subcategorias.some((s) => s.id === p.subcategoria && s.grupo === p.grupo)
    )
      fallo('Revisa el producto, referencia o categoría.');
    refs.add(p.referencia.toLowerCase());
    if (
      !p.precio ||
      !['fijo', 'desde', 'consultar'].includes(p.precio.modo) ||
      (p.precio.modo === 'consultar' ? p.precio.valor !== null : !monto(p.precio.valor))
    )
      fallo('Precio inválido.');
    if (
      !Array.isArray(p.imagenes) ||
      p.imagenes.length > 30 ||
      !p.imagenes.every((v) => v && ruta(v))
    )
      fallo('Imágenes no válidas; usa rutas WebP de assets.');
    if (
      !Array.isArray(p.variantes) ||
      !p.variantes.length ||
      p.variantes.length > 100 ||
      !unicos(p.variantes)
    )
      fallo('Variantes inválidas.');
    for (const v of p.variantes)
      if (
        !texto(v.color, 100) ||
        !texto(v.tamano, 100) ||
        (v.precio !== null && !monto(v.precio)) ||
        (v.existencias !== null &&
          (!Number.isSafeInteger(v.existencias) || v.existencias < 0 || v.existencias > 1000000)) ||
        !ESTADOS.includes(v.disponibilidad)
      )
        fallo('Revisa colores, tamaños, precio y existencias.');
    if (
      !Array.isArray(p.incluye) ||
      p.incluye.length > 100 ||
      !p.incluye.every((v) => texto(v)) ||
      !Array.isArray(p.especificaciones) ||
      p.especificaciones.length > 100 ||
      !p.especificaciones.every((s) => texto(s.nombre, 200) && texto(s.valor, 1000)) ||
      !p.personalizacion ||
      !['activa', 'texto', 'imagen', 'qr', 'observaciones'].every(
        (k) => typeof p.personalizacion[k] === 'boolean',
      )
    )
      fallo('Revisa los detalles y la personalización.');
  }
  for (const p of c.productos)
    if (p.personalizacion.modalidad !== undefined && !['incluida', 'cotizar'].includes(p.personalizacion.modalidad))
      fallo('Modalidad de personalización inválida.');
  for (const d of c.destacados)
    if (
      !texto(d.titulo, 300) ||
      !texto(d.descripcion, 1000) ||
      !texto(d.boton, 200) ||
      !ruta(d.imagen) ||
      typeof d.visible !== 'boolean' ||
      !['grupo', 'producto'].includes(d.tipoDestino) ||
      !(d.tipoDestino === 'grupo' ? c.grupos : c.productos).some((x) => x.id === d.destino)
    )
      fallo('Destacado inválido.');
  const m = c.comercio;
  if (m?.medidaImagen !== undefined && (!m.medidaImagen || !ruta(m.medidaImagen)))
    fallo('Usa una imagen WebP dentro de assets para diseño a medida.');
  if (
    !m ||
    ![
      'titulo',
      'descripcion',
      'envios',
      'pagosNota',
      'medidaTitulo',
      'medidaDescripcion',
      'medidaBoton',
      'medidaMensaje',
    ].every((k) => texto(m[k])) ||
    !Number.isFinite(m.anticipo) ||
    m.anticipo < 0 ||
    m.anticipo > 100 ||
    !Array.isArray(m.metodosPago) ||
    m.metodosPago.length > 30 ||
    !m.metodosPago.every(
      (p) =>
        texto(p.nombre, 200) &&
        texto(p.instrucciones, 2000, true) &&
        typeof p.visible === 'boolean',
    )
  )
    fallo('Configuración comercial inválida.');
  return c;
}
export const productosPublicos = (c) =>
  c.productos.filter(
    (p) =>
      p.visible &&
      c.grupos.some((g) => g.id === p.grupo && g.visible) &&
      c.subcategorias.some((s) => s.id === p.subcategoria && s.visible),
  );
export const precioVariante = (p, v) =>
  p.precio.modo === 'consultar' ? null : (v?.precio ?? p.precio.valor);
export const puedeComprar = (v) =>
  v && !['agotado', 'desarrollo'].includes(v.disponibilidad) && v.existencias !== 0;
export function relacionados(c, p, limite = 4) {
  return productosPublicos(c)
    .filter((x) => x.id !== p.id && x.grupo === p.grupo)
    .sort(
      (a, b) =>
        Number(b.subcategoria === p.subcategoria) - Number(a.subcategoria === p.subcategoria) ||
        Number(b.destacado) - Number(a.destacado),
    )
    .slice(0, limite);
}
export const normalizar = (v) =>
  String(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function resolverLinea(c, l) {
  const p = productosPublicos(c).find((p) => p.id === l.producto);
  const v = p?.variantes.find((v) => v.id === l.variante);
  return {
    p,
    v,
    precio: p && v ? precioVariante(p, v) : null,
    valida: !!(
      p &&
      v &&
      puedeComprar(v) &&
      Number.isSafeInteger(l.cantidad) &&
      l.cantidad > 0 &&
      l.cantidad <= 999 &&
      (v.existencias === null || l.cantidad <= v.existencias)
    ),
  };
}
export function resumenCarrito(c, lineas) {
  let subtotal = 0,
    sinPrecio = false,
    invalido = false;
  const cantidades = new Map();
  for (const l of lineas) {
    const r = resolverLinea(c, l);
    if (!r.valida) {
      invalido = true;
      continue;
    }
    const clave = r.p.id + ':' + r.v.id;
    cantidades.set(clave, (cantidades.get(clave) || 0) + l.cantidad);
    if (r.v.existencias !== null && cantidades.get(clave) > r.v.existencias) invalido = true;
    if (r.precio === null) sinPrecio = true;
    else subtotal += r.precio * l.cantidad;
  }
  return { subtotal, sinPrecio, invalido };
}

export function personalizacionPorCotizar(p, l) {
  return !!(p?.personalizacion.activa && p.personalizacion.modalidad === 'cotizar' && (l.opciones.personalizacion || l.opciones.texto || l.archivos.some(a => ['imagen', 'qr'].includes(a.campo))));
}
