import { resolverLinea, resumenCarrito, personalizacionPorCotizar } from './modelo.js';
export function mensajePedido(c, lineas, t, moneda) {
  const r = resumenCarrito(c, lineas);
  if (!lineas.length || r.invalido) throw Error(t.cartNoDisponible);
  const partes = [t.pedidoTitulo, ''];
  for (const l of lineas) {
    const { p, v, precio } = resolverLinea(c, l);
    partes.push(
      `${l.cantidad} × ${p.nombre} [${p.referencia}]`,
      `${t.color}: ${v.color} · ${t.tamano}: ${v.tamano}`,
      `${precio === null ? t.porCotizar : moneda(precio * l.cantidad)}`,
    );
    for (const [k, val] of Object.entries(l.opciones)) if (val) partes.push(`${t[k] || k}: ${val}`);
    for (const a of l.archivos) partes.push(`${t.archivoPendiente}: ${a.nombre}`);
    if (personalizacionPorCotizar(p, l)) partes.push(t.personalRecargo);
    partes.push('');
  }
  partes.push(`${t.subtotal}: ${moneda(r.subtotal)}`);
  if (lineas.some(l => personalizacionPorCotizar(resolverLinea(c, l).p, l))) partes.push(t.personalPendiente);
  if (r.sinPrecio) partes.push(t.sinPrecio);
  partes.push(t.notaPedido, c.comercio.pagosNota);
  return partes.join('\n');
}
// Adaptador actual. Una futura pasarela requiere validación y confirmación en servidor.
export function enviarPedidoWhatsApp(c, lineas, t, moneda, telefono) {
  if (!/^[0-9]{7,15}$/.test(telefono)) throw Error('Número de contacto inválido.');
  const texto = mensajePedido(c, lineas, t, moneda);
  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`,
    '_blank',
    'noopener,noreferrer',
  );
}
