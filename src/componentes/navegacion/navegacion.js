import { RUTAS } from '../../configuracion/rutas.js';
export function crearMarca() {
  const enlace = document.createElement('a');
  enlace.className = 'identidad';
  enlace.href = RUTAS.inicio;
  enlace.setAttribute('aria-label', 'Roser Tecnologías — Inicio');

  const simbolo = document.createElement('img');
  simbolo.src = '/assets/marca/simbolo-roser.webp';
  simbolo.alt = '';
  simbolo.className = 'marca-simbolo';

  const letras = document.createElement('img');
  letras.src = '/assets/marca/letras-roser.webp';
  letras.alt = '';
  letras.className = 'marca-letras';

  enlace.append(simbolo, letras);
  return enlace;
}
export function montarNavegacion(contenedor, textos) {
  const fila = document.createElement('div'); fila.className = 'contenedor nav-fila';
  const nav = document.createElement('nav'); nav.id = 'menu-principal'; nav.setAttribute('aria-label', 'Principal');
  for (const clave of ['inicio','servicios','proyectos','aplicaciones','productos','contacto']) {
    const a = document.createElement('a'); a.href = RUTAS[clave]; a.textContent = textos[clave]; nav.append(a);
  }
  const boton = document.createElement('button'); boton.className = 'menu-boton'; boton.type = 'button';
  boton.setAttribute('aria-controls', nav.id); boton.setAttribute('aria-expanded','false'); boton.textContent = textos.abrirMenu;
  function cerrar() { fila.classList.remove('menu-abierto'); boton.setAttribute('aria-expanded','false'); boton.textContent = textos.abrirMenu; }
  boton.addEventListener('click', () => {
    const abierto = fila.classList.toggle('menu-abierto');
    boton.setAttribute('aria-expanded', String(abierto)); boton.textContent = abierto ? textos.cerrarMenu : textos.abrirMenu;
  });
  nav.addEventListener('click', cerrar);
  fila.addEventListener('keydown', e => { if (e.key === 'Escape') { cerrar(); boton.focus(); } });
  fila.append(crearMarca(), boton, nav); contenedor.replaceChildren(fila);
}
