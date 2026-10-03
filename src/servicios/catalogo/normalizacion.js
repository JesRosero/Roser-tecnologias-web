const originales = {
  '/assets/imagenes/productos/bb08.webp': '/assets/imagenes/marketplace/cctv-destacado.webp',
  '/assets/imagenes/productos/soporte-qr.webp': '/assets/imagenes/marketplace/qr-destacado.webp',
};
export function normalizarCatalogo(c) {
  c.comercio.medidaImagen ??= '/assets/imagenes/marketplace/diseno-medida.webp';
  for (const d of c.destacados) if (originales[d.imagen]) d.imagen = originales[d.imagen];
  return c;
}
