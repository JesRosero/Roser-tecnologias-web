import { RUTAS } from '../../configuracion/rutas.js';

export function crearTarjetaArea(area, explorar) {
  const articulo = document.createElement('article');
  articulo.className = 'tarjeta-area';

  const imagen = document.createElement('img');
  imagen.alt = '';
  imagen.loading = 'lazy';
  imagen.decoding = 'async';

  imagen.addEventListener('load', () => {
    imagen.hidden = false;
  });

  imagen.addEventListener('error', () => {
    imagen.hidden = true;
  });

  imagen.src = area.imagen;

  const visual = document.createElement('div');
  visual.className = `area-visual visual-${area.id}`;
  visual.append(imagen);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'area-cuerpo';

  const titulo = document.createElement('h2');
  titulo.textContent = area.titulo;

  const descripcion = document.createElement('p');
  descripcion.textContent = area.descripcion;

  const enlace = document.createElement('a');
  enlace.href = RUTAS[area.id];
  enlace.textContent = `${explorar} →`;
  enlace.setAttribute('aria-label', `${explorar}: ${area.titulo}`);

  cuerpo.append(titulo, descripcion, enlace);
  articulo.append(visual, cuerpo);

  return articulo;
}