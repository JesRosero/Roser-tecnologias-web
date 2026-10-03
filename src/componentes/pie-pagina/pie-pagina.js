import { crearMarca } from '../navegacion/navegacion.js';
import { RUTAS } from '../../configuracion/rutas.js';
export function montarPie(contenedor, textos) {
  const fila = document.createElement('div'); fila.className = 'contenedor pie-fila';
  const derechos = document.createElement('p'); derechos.textContent = `© ${new Date().getFullYear()} Roser Tecnologías. ${textos.derechos}`;
  const enlaces = document.createElement('div'); enlaces.className = 'pie-enlaces';
  for (const clave of ['nosotros','privacidad','terminos']) {
    const a = document.createElement('a'); a.href = RUTAS[clave]; a.textContent = textos[clave]; enlaces.append(a);
  }
  fila.append(crearMarca(), derechos, enlaces); contenedor.replaceChildren(fila);
}
