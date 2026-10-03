import { montarFavoritos } from './favoritos.js';
import { leerJSON } from '../../servicios/archivos.js';
import { cargarCatalogo } from '../../servicios/configuracion-catalogo.js';
import { cargarContenidoInicio } from '../../servicios/configuracion-sitio.js';
import { montarPie } from '../../componentes/pie-pagina/pie-pagina.js';
import { cabecera } from '../../componentes/tienda/cabecera.js';
import { montarCarrito } from '../../componentes/tienda/carrito.js';
import { montarCatalogo } from './catalogo.js';
import { montarFicha } from './ficha.js';
import { el } from '../../componentes/tienda/utilidades.js';
let t;
try {
  const [c, textos, comun, inicio] = await Promise.all([
    cargarCatalogo(),
    leerJSON('/src/idiomas/es/marketplace.json'),
    leerJSON('/src/idiomas/es/comun.json'),
    cargarContenidoInicio(),
  ]);
  t = Object.assign(textos, await leerJSON('/src/idiomas/es/marketplace-extra.json'));
  cabecera(c, t, comun, inicio.contacto.whatsapp);
  montarPie(el('pie'), comun.pie);
  el('saltar').textContent = t.saltar;
  montarCarrito(c, t, inicio.contacto.whatsapp, document.body.dataset.pagina === 'carrito');
  if (document.body.dataset.pagina === 'favoritos') montarFavoritos(c, t);
  else if (document.body.dataset.pagina === 'carrito') {
    document.title = 'Carrito — Roser Tecnologías';
  } else if (document.body.dataset.pagina === 'ficha') montarFicha(c, t, inicio.contacto.whatsapp);
  else {
    document.title = `${c.comercio.titulo} — Roser Tecnologías`;
    document.querySelector('meta[name=description]').content = c.comercio.descripcion;
    montarCatalogo(c, t, inicio.contacto.whatsapp);
  }
} catch (e) {
  console.error(e);
  el('estado').hidden = false;
  el('estado').textContent = e.message || t?.error || 'No se pudo cargar el catálogo.';
}
