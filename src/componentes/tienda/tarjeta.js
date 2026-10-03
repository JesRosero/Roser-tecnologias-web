import { estadoVariante } from './disponibilidad.js';
import { crear, imagen, boton, rutaFicha, moneda, avisar } from './utilidades.js';
import {
  alternarFavorito,
  leerFavoritos,
  agregarLinea,
} from '../../servicios/catalogo/seleccion.js';
import { puedeComprar, precioVariante } from '../../servicios/catalogo/modelo.js';
export function tarjeta(c, p, t) {
  const card = crear('article', 'tienda-tarjeta');
  const a = crear('a', 'tienda-foto');
  a.href = rutaFicha(p.id);
  a.append(imagen(p.imagenes[0], p.nombre));
  const fav = boton(
    '♡',
    () => {
      try {
        alternarFavorito(p.id);
        actualizar();
      } catch {
        avisar(t.guardarError);
      }
    },
    'tienda-corazon',
  );
  function actualizar() {
    const activo = leerFavoritos().includes(p.id);
    fav.textContent = activo ? '♥' : '♡';
    fav.setAttribute('aria-pressed', String(activo));
    fav.setAttribute('aria-label', activo ? t.favoritoQuitar : t.favoritoAgregar);
  }
  actualizar();
  const cuerpo = crear('div', 'tienda-tarjeta-texto');
  const h = crear('h3');
  const link = crear('a', null, p.nombre);
  link.href = a.href;
  h.append(link);
  const precios = p.variantes.map((v) => precioVariante(p, v)).filter((v) => v !== null),
    precio = precios.length ? Math.min(...precios) : null;
  const variable = new Set(precios).size > 1 || p.precio.modo === 'desde';
  const valor = crear(
    'p',
    'tienda-precio',
    precio === null ? t.porCotizar : `${variable ? t.desde + ' ' : ''}${moneda(precio)}`,
  );
  const estado = crear(
    'p',
    'tienda-estado',
    t.disponibilidad[estadoVariante(p.variantes.find((v) => puedeComprar(v)) || p.variantes[0])],
  );
  estado.dataset.disponibilidad = estadoVariante(
    p.variantes.find((v) => puedeComprar(v)) || p.variantes[0],
  );
  if (p.personalizacion.activa) cuerpo.append(crear('p', 'tienda-personalizable', t.personaliza));
  const requiere = p.variantes.length > 1 || p.personalizacion.activa;
  const b = boton(
    requiere ? t.opciones : puedeComprar(p.variantes[0]) ? t.agregar : t.detalles,
    () => {
      if (requiere || !puedeComprar(p.variantes[0])) {
        location.href = a.href;
        return;
      }
      try {
        agregarLinea(c, p, p.variantes[0], 1);
        avisar(t.agregado);
      } catch (e) {
        avisar(e.message);
      }
    },
  );
  cuerpo.append(h, valor, estado, b);
  card.append(a, fav, cuerpo);
  return card;
}
