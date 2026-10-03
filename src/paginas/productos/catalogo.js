import { icono } from '../../componentes/tienda/iconos.js';
import {
  productosPublicos,
  normalizar,
  precioVariante,
  puedeComprar,
} from '../../servicios/catalogo/modelo.js';
import { leerFavoritos } from '../../servicios/catalogo/seleccion.js';
import { el, crear, boton, imagen, rutaFicha } from '../../componentes/tienda/utilidades.js';
import { tarjeta } from '../../componentes/tienda/tarjeta.js';
export function montarCatalogo(c, t, telefono) {
  const params = new URLSearchParams(location.search);
  let grupo = params.get('grupo') || '',
    buscar = params.get('buscar') || '',
    fav = params.has('favoritos'),
    estado = '',
    sub = params.get('subcategoria') || '',
    min = '',
    max = '',
    orden = 'destacados';
  const disponibles = productosPublicos(c);
  const grid = el('productos');
  const categorias = el('categorias');
  for (const g of c.grupos.filter((g) => g.visible && disponibles.some((p) => p.grupo === g.id))) {
    const b = boton(
      '',
      () => {
        grupo = grupo === g.id ? '' : g.id;
        sub = '';
        actualizar();
      },
      'tienda-categoria',
    );
    b.dataset.grupo = g.id;
    b.append(imagen(g.imagen, g.nombre), crear('strong', null, g.nombre));
    b.append(icono('flechas'));
    categorias.append(b);
  }
  const rail = crear('div', 'tienda-categorias-rail');
  categorias.before(rail);
  rail.append(categorias);
  const atras = boton(
      '‹',
      () => categorias.scrollBy({ left: -280, behavior: 'smooth' }),
      'tienda-cat-flecha',
    ),
    adelante = boton(
      '›',
      () => categorias.scrollBy({ left: 280, behavior: 'smooth' }),
      'tienda-cat-flecha',
    );
  atras.setAttribute('aria-label', t.categoriasAnteriores);
  adelante.setAttribute('aria-label', t.categoriasSiguientes);
  rail.prepend(atras);
  rail.append(adelante);
  const banners = el('destacados');
  for (const d of c.destacados.filter((d) => d.visible)) {
    const target =
      d.tipoDestino === 'producto'
        ? disponibles.find((p) => p.id === d.destino)
        : disponibles.find((p) => p.grupo === d.destino);
    if (!target) continue;
    const a = crear('a', 'tienda-destacado');
    a.href =
      d.tipoDestino === 'producto'
        ? rutaFicha(d.destino)
        : `?grupo=${encodeURIComponent(d.destino)}#catalogo`;
    const texto = crear('div');
    texto.append(
      crear('h2', null, d.titulo),
      crear('p', null, d.descripcion),
      crear('span', 'tienda-boton', `${d.boton} →`),
    );
    a.append(texto, imagen(d.imagen, '', 'tienda-destacado-imagen'));
    banners.append(a);
  }
  el('catalogo-titulo').textContent = t.explora;
  el('titulo').textContent = c.comercio.titulo;
  el('descripcion').textContent = c.comercio.descripcion;
  const controles = el('controles');
  for (const [v, label] of [
    ['', t.todos],
    ['disponible', t.disponibles],
    ['pedido', t.pedido],
  ]) {
    const b = boton(
      label,
      () => {
        estado = v;
        actualizar();
      },
      'tienda-filtro-rapido',
    );
    b.dataset.estado = v;
    controles.append(b);
  }
  const favorito = boton(
    t.soloFavoritos,
    () => {
      fav = !fav;
      actualizar();
    },
    'tienda-filtro-rapido',
  );
  favorito.id = 'filtro-favoritos';
  controles.append(favorito);
  el('abrir-filtros').textContent = t.filtros;
  el('abrir-filtros').addEventListener('click', () => {
    el('filtros').hidden = !el('filtros').hidden;
  });
  el('orden').setAttribute('aria-label', t.orden);
  for (const [v, label] of [
    ['destacados', t.destacados],
    ['menor', t.menor],
    ['mayor', t.mayor],
    ['nombre', t.nombre],
  ]) {
    const o = crear('option', null, label);
    o.value = v;
    el('orden').append(o);
  }
  el('orden').addEventListener('change', (e) => {
    orden = e.target.value;
    actualizar();
  });
  const gs = el('grupo-filtro');
  gs.append(new Option(t.todos, ''));
  for (const g of c.grupos.filter((g) => g.visible && disponibles.some((p) => p.grupo === g.id)))
    gs.append(new Option(g.nombre, g.id));
  gs.addEventListener('change', () => {
    grupo = gs.value;
    sub = '';
    actualizar();
  });
  el('sub-filtro').addEventListener('change', (e) => {
    sub = e.target.value;
    actualizar();
  });
  el('min').placeholder = t.precioMin;
  el('min').setAttribute('aria-label', t.precioMin);
  el('max').placeholder = t.precioMax;
  el('max').setAttribute('aria-label', t.precioMax);
  for (const id of ['min', 'max'])
    el(id).addEventListener('input', () => {
      min = el('min').value;
      max = el('max').value;
      actualizar();
    });
  el('grupo-label').textContent = t.grupo;
  el('sub-label').textContent = t.subcategoria;
  const limpiar = () => {
    grupo = '';
    sub = '';
    estado = '';
    buscar = '';
    fav = false;
    min = '';
    max = '';
    el('min').value = '';
    el('max').value = '';
    document.querySelector('.tienda-busqueda input').value = '';
    actualizar();
  };
  el('limpiar').textContent = t.limpiar;
  el('limpiar').addEventListener('click', limpiar);
  const form = document.querySelector('.tienda-busqueda');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    buscar = form.querySelector('input').value;
    actualizar();
  });
  form.querySelector('input').addEventListener('input', () => {
    buscar = form.querySelector('input').value;
    actualizar();
  });
  window.addEventListener('roser-favoritos', actualizar);
  const boceto = imagen(
    c.comercio.medidaImagen || '/assets/imagenes/marketplace/diseno-medida.webp',
    '',
    'tienda-medida-imagen',
  );
  el('medida-titulo').closest('section').prepend(boceto);
  el('medida-titulo').textContent = c.comercio.medidaTitulo;
  el('medida-descripcion').textContent = c.comercio.medidaDescripcion;
  el('medida-boton').textContent = `${c.comercio.medidaBoton} →`;
  el('medida-boton').href =
    `https://wa.me/${telefono}?text=${encodeURIComponent(c.comercio.medidaMensaje)}`;
  function actualizar() {
    gs.value = grupo;
    const opciones = c.subcategorias.filter(
      (s) =>
        s.visible &&
        (!grupo || s.grupo === grupo) &&
        disponibles.some((p) => p.subcategoria === s.id),
    );
    el('sub-filtro').replaceChildren(
      new Option(t.todos, ''),
      ...opciones.map((s) => new Option(s.nombre, s.id)),
    );
    el('sub-filtro').value = sub;
    document
      .querySelectorAll('[data-grupo]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grupo === grupo)));
    document
      .querySelectorAll('[data-estado]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.estado === estado)));
    favorito.setAttribute('aria-pressed', String(fav));
    const favs = leerFavoritos();
    let productos = disponibles.filter(
      (p) =>
        (!grupo || p.grupo === grupo) &&
        (!sub || p.subcategoria === sub) &&
        (!fav || favs.includes(p.id)) &&
        (!buscar ||
          normalizar(p.nombre + ' ' + p.descripcion + ' ' + p.referencia).includes(
            normalizar(buscar),
          )) &&
        (!estado || p.variantes.some((v) => v.disponibilidad === estado && puedeComprar(v))),
    );
    const precio = (p) => {
      const ps = p.variantes.map((v) => precioVariante(p, v)).filter((v) => v !== null);
      return ps.length ? Math.min(...ps) : null;
    };
    productos = productos.filter((p) => {
      const pr = precio(p);
      return (
        (!min && !max) ||
        (pr !== null && (!min || pr >= Number(min)) && (!max || pr <= Number(max)))
      );
    });
    productos.sort((a, b) =>
      orden === 'nombre'
        ? a.nombre.localeCompare(b.nombre, 'es')
        : orden === 'menor'
          ? (precio(a) ?? Infinity) - (precio(b) ?? Infinity)
          : orden === 'mayor'
            ? (precio(b) ?? -Infinity) - (precio(a) ?? -Infinity)
            : Number(b.destacado) - Number(a.destacado),
    );
    grid.replaceChildren(...productos.map((p) => tarjeta(c, p, t)));
    el('cuenta').textContent =
      `${productos.length} ${productos.length === 1 ? t.producto : t.productos}`;
    el('sin-resultados').textContent = t.sinResultados;
    el('sin-resultados').hidden = productos.length > 0;
    const q = new URLSearchParams();
    if (grupo) q.set('grupo', grupo);
    if (buscar) q.set('buscar', buscar);
    if (sub) q.set('subcategoria', sub);
    if (fav) q.set('favoritos', '1');
    history.replaceState(null, '', location.pathname + (q.size ? '?' + q : '') + location.hash);
  }
  actualizar();
}
