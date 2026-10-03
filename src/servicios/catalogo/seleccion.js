import { resolverLinea, puedeComprar, resumenCarrito } from './modelo.js';
const CART = 'roser:carrito:v1',
  FAV = 'roser:favoritos:v1';
const leer = (k, f) => {
  try {
    const s = JSON.parse(localStorage.getItem(k) || '[]');
    return Array.isArray(s) ? s.filter(f) : [];
  } catch {
    return [];
  }
};
export function leerCarrito() {
  return leer(
    CART,
    (l) =>
      l &&
      typeof l.id === 'string' &&
      typeof l.producto === 'string' &&
      typeof l.variante === 'string' &&
      Number.isSafeInteger(l.cantidad) &&
      l.cantidad > 0 &&
      l.cantidad <= 999 &&
      l.opciones &&
      typeof l.opciones === 'object' &&
      Object.values(l.opciones).every((v) => typeof v === 'string' && v.length <= 2000) &&
      Array.isArray(l.archivos) &&
      l.archivos.length <= 2 &&
      l.archivos.every(
        (a) =>
          a &&
          typeof a.id === 'string' &&
          typeof a.nombre === 'string' &&
          ['imagen', 'qr'].includes(a.campo),
      ),
  );
}
export function guardarCarrito(l) {
  localStorage.setItem(CART, JSON.stringify(l));
  window.dispatchEvent(new Event('roser-carrito'));
}
export function agregarLinea(c, p, v, cantidad, opciones = {}, archivos = []) {
  if (!puedeComprar(v) || !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 999)
    throw Error('Cantidad o variante no disponible.');
  const l = leerCarrito();
  const clave = JSON.stringify([p.id, v.id, opciones, archivos.map((a) => a.id)]);
  const igual = l.find(
    (a) =>
      JSON.stringify([a.producto, a.variante, a.opciones, a.archivos.map((a) => a.id)]) === clave,
  );
  const total = cantidad + (igual?.cantidad || 0);
  if (v.existencias !== null && total > v.existencias)
    throw Error('La cantidad supera las existencias indicadas.');
  if (igual) igual.cantidad = total;
  else
    l.push({
      id: crypto.randomUUID(),
      producto: p.id,
      variante: v.id,
      cantidad,
      opciones,
      archivos,
    });
  if (resumenCarrito(c, l).invalido) throw Error('Revisa los artículos existentes del carrito.');
  guardarCarrito(l);
}
export function cambiarCantidad(c, id, delta) {
  const l = leerCarrito();
  const a = l.find((a) => a.id === id);
  if (!a) return;
  a.cantidad += delta;
  if (!resolverLinea(c, a).valida || resumenCarrito(c, l).invalido)
    throw Error('La cantidad no está disponible.');
  guardarCarrito(l);
}
export function quitarLinea(id) {
  const l = leerCarrito();
  const a = l.find((a) => a.id === id);
  guardarCarrito(l.filter((a) => a.id !== id));
  return a;
}
export function leerFavoritos() {
  return [...new Set(leer(FAV, (v) => typeof v === 'string' && v.length < 100))];
}
export function alternarFavorito(id) {
  const l = leerFavoritos();
  const nuevo = l.includes(id) ? l.filter((x) => x !== id) : [...l, id];
  localStorage.setItem(FAV, JSON.stringify(nuevo));
  window.dispatchEvent(new Event('roser-favoritos'));
  return nuevo.includes(id);
}

window.addEventListener('storage', (e) => {
  if (e.key === CART) window.dispatchEvent(new Event('roser-carrito'));
  if (e.key === FAV) window.dispatchEvent(new Event('roser-favoritos'));
});
