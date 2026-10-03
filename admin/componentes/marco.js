export function montarMarco() {
  if (document.getElementById('marco-admin')) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/admin/estilos/marco.css';
  document.head.append(css);
  const nav = document.createElement('nav');
  nav.id = 'marco-admin';
  nav.setAttribute('aria-label', 'Administrador Roser');
  for (const [nombre, ruta] of [
    ['Panel', 'panel.html'],
    ['Inicio', 'index.html'],
    ['Servicios', 'servicios.html'],
    ['Aplicaciones', 'aplicaciones.html'],
    ['Nosotros', 'nosotros.html'],
    ['Productos', 'catalogo.html'],
    ['Proyectos', 'proyectos.html'],
    ['Privacidad web', 'documento-sitio.html?documento=privacidad'],
    ['Términos web', 'documento-sitio.html?documento=terminos'],
  ]) {
    const a = document.createElement('a');
    a.textContent = nombre;
    a.href = '/admin/' + ruta;
    if (
      location.pathname === new URL(a.href).pathname &&
      location.search === new URL(a.href).search
    )
      a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
  document.body.prepend(nav);
  const nota = document.querySelector('[data-texto="aviso"]');
  if (nota)
    nota.textContent =
      'Guardar cambios actualiza los archivos del proyecto. Publicar requiere subirlos con Git.';
}
