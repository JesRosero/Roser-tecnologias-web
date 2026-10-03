export const el = (id) => document.getElementById(id);
export const crear = (tag, clase, texto) => {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
};
export const moneda = (v) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v) + ' COP';
export function boton(texto, accion, clase = 'tienda-boton') {
  const b = crear('button', clase, texto);
  b.type = 'button';
  b.addEventListener('click', accion);
  return b;
}
export function imagen(src, alt, clase = '') {
  const marco = crear('div', clase);
  const img = crear('img');
  img.alt = alt;
  img.loading = 'lazy';
  img.width = 600;
  img.height = 600;
  const fallback = crear('span', 'tienda-imagen-falta', '◇');
  fallback.hidden = true;
  img.addEventListener(
    'error',
    () => {
      img.hidden = true;
      fallback.hidden = false;
    },
    { once: true },
  );
  img.src = src || '';
  marco.append(img, fallback);
  return marco;
}
export const rutaFicha = (id) => `/paginas/productos/ficha/index.html?id=${encodeURIComponent(id)}`;
let reloj;
export function avisar(texto) {
  const n = el('aviso');
  n.textContent = texto;
  n.hidden = false;
  clearTimeout(reloj);
  reloj = setTimeout(() => {
    n.hidden = true;
  }, 4500);
}
export function abrir(dialog) {
  if (!dialog.open) dialog.showModal();
}
export function cerrarFuera(dialog) {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        dialog.close();
    }
  });
}
