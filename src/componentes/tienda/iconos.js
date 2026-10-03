const trazos = {
  carrito: 'M2 3h3l3 13h11l3-9H6M10 21h.01M19 21h.01',
  corazon:
    'M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 20.5l8.8-8.8a5 5 0 0 0 0-7.1Z',
  camion:
    'M1 4h14v12H1ZM15 9h4l4 5v2h-8M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  engranaje:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1Z',
  whatsapp: 'M20 12a8 8 0 0 1-12 7l-5 2 2-5a8 8 0 1 1 15-4ZM8 8c0 4 4 8 8 8',
  categorias: 'M3 5h18M3 12h18M3 19h18',
  flechas: 'm6 5 7 7-7 7m6-14 7 7-7 7',
};
export function icono(nombre) {
  if (['whatsapp', 'camion', 'engranaje', 'carrito'].includes(nombre)) {
    if (nombre === 'whatsapp') {
      const marca = document.createElement('span');
      marca.className = 'tienda-svg tienda-logo-whatsapp';
      marca.setAttribute('aria-hidden', 'true');
      return marca;
    }
    const img = document.createElement('img');
    img.src = '/assets/iconos/' + nombre + '.svg';
    img.alt = ''; img.className = 'tienda-svg';
    return img;
  }
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.8');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  s.classList.add('tienda-svg');
  const p = document.createElementNS(s.namespaceURI, 'path');
  p.setAttribute('d', trazos[nombre] || trazos.categorias);
  s.append(p);
  return s;
}
