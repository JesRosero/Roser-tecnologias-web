import { leerFavoritos } from '../../servicios/catalogo/seleccion.js';
import { productosPublicos } from '../../servicios/catalogo/modelo.js';
import { tarjeta } from '../../componentes/tienda/tarjeta.js';
export function montarFavoritos(c, t) {
  document.title = t.favoritosTitulo + ' — Roser Tecnologías';
  document.querySelector('main h1').textContent = t.favoritosTitulo;
  document.querySelector('main>p').textContent = t.favoritosNota;
  document.querySelector('#vacio-favoritos p').textContent = t.favoritosVacio;
  function render() {
    const ids = leerFavoritos();
    const productos = productosPublicos(c).filter((p) => ids.includes(p.id));
    document.getElementById('productos').replaceChildren(...productos.map((p) => tarjeta(c, p, t)));
    document.getElementById('vacio-favoritos').hidden = productos.length > 0;
    document.getElementById('cuenta').textContent =
      productos.length + ' ' + (productos.length === 1 ? t.producto : t.productos);
  }
  window.addEventListener('roser-favoritos', render);
  window.addEventListener('storage', render);
  render();
}
