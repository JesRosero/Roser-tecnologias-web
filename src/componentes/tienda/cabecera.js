import { icono } from './iconos.js';
import { crearMarca } from '../navegacion/navegacion.js';
import { RUTAS, ORDEN_NAVEGACION } from '../../configuracion/rutas.js';
import { crear, boton } from './utilidades.js';
export function cabecera(c, t, comun, telefono) {
  const destino = document.getElementById('cabecera');
  const arriba = crear('div', 'contenedor tienda-cabecera-fila');
  const form = crear('form', 'tienda-busqueda');
  form.role = 'search';
  const input = crear('input');
  input.type = 'search';
  input.name = 'buscar';
  input.placeholder = t.buscar;
  input.setAttribute('aria-label', t.buscar);
  input.value = new URLSearchParams(location.search).get('buscar') || '';
  const buscar = crear('button', null, '⌕');
  buscar.type = 'submit';
  buscar.setAttribute('aria-label', t.buscar);
  form.append(input, buscar);
  form.action = RUTAS.productos;
  const fav = crear('a', 'tienda-icono');
  fav.append(icono('corazon'));
  fav.href = '/paginas/productos/favoritos/index.html';
  fav.setAttribute('aria-label', t.favoritos);
  const cart = boton('', () => {}, 'tienda-icono');
  cart.append(icono('carrito'));
  cart.id = 'abrir-carrito';
  cart.setAttribute('aria-label', t.carrito);
  const cuenta = crear('span', 'tienda-contador', '0');
  cuenta.id = 'carrito-cuenta';
  cart.append(cuenta);
  arriba.append(crearMarca(), form, fav, cart);
  const nav = crear('nav', 'contenedor tienda-nav');
  nav.setAttribute('aria-label', t.categorias);
  const desplegar = boton(t.categorias, () => {}, 'tienda-categorias-boton');
  desplegar.prepend(icono('categorias'));
  desplegar.setAttribute('aria-expanded', 'false');
  desplegar.setAttribute('aria-controls', 'categorias-menu');
  const menu = crear('div', 'tienda-menu-categorias');
  menu.id = 'categorias-menu';
  menu.hidden = true;
  const grupos = c.grupos.filter(
    (g) => g.visible && c.productos.some((p) => p.visible && p.grupo === g.id),
  );
  for (const g of grupos) {
    const box = crear('section');
    const a = crear('a', null, g.nombre);
    a.href = RUTAS.productos + '?grupo=' + encodeURIComponent(g.id) + '#catalogo';
    box.append(a);
    for (const sub of c.subcategorias.filter(
      (s) =>
        s.visible &&
        s.grupo === g.id &&
        c.productos.some((p) => p.visible && p.subcategoria === s.id),
    )) {
      const b = crear('a', 'tienda-subcategoria-menu', sub.nombre);
      b.href =
        RUTAS.productos +
        '?grupo=' +
        encodeURIComponent(g.id) +
        '&subcategoria=' +
        encodeURIComponent(sub.id) +
        '#catalogo';
      box.append(b);
    }
    menu.append(box);
  }
  function ocultar() {
    menu.hidden = true;
    desplegar.setAttribute('aria-expanded', 'false');
  }
  desplegar.onclick = () => {
    menu.hidden = !menu.hidden;
    desplegar.setAttribute('aria-expanded', String(!menu.hidden));
  };
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !desplegar.contains(e.target)) ocultar();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      ocultar();
      desplegar.focus();
    }
  });
  nav.append(desplegar);
  for (const k of ORDEN_NAVEGACION) {
    const a = crear('a', null, k === 'inicio' ? t.inicio : comun.navegacion[k]);
    a.href = RUTAS[k];
    if (k === 'productos') a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
  const banda = crear('div', 'tienda-confianza');
  function doble(nodo, titulo, detalle) {
    const textos = crear('span', 'tienda-confianza-textos');
    textos.append(crear('strong', null, titulo), crear('small', null, detalle));
    nodo.replaceChildren(textos);
  }
  const envio = crear('div');
  doble(envio, t.enviosTitulo, c.comercio.envios);
  envio.prepend(icono('camion'));
  const wa = crear('a', null, t.atencion);
  wa.href = 'https://wa.me/' + telefono;
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  doble(wa, t.atencion, t.atencionDetalle);
  wa.prepend(icono('whatsapp'));
  const servicio = crear('a', null, t.diseno);
  servicio.href = RUTAS.servicios;
  doble(servicio, t.diseno, t.disenoDetalle);
  servicio.prepend(icono('engranaje'));
  const carrito = crear('a', null, t.carrito);
  carrito.href = '/paginas/productos/carrito/index.html';
  doble(carrito, t.carrito, t.carritoDetalle);
  carrito.prepend(icono('carrito'));
  banda.append(envio, wa, servicio, carrito);
  destino.replaceChildren(arriba, nav, menu, banda);
}
