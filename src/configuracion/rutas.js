/** Rutas objetivo. Las páginas se crearán durante la migración.
 * Live Server usa index.html explícito; no depende de reglas de Netlify.
 */
export const RUTAS = Object.freeze({
  inicio: '/index.html',
  productos: '/paginas/productos/index.html',
  servicios: '/paginas/servicios/index.html',
  aplicaciones: '/paginas/aplicaciones/index.html',
  proyectos: '/paginas/proyectos/index.html',
  nosotros: '/paginas/empresa/nosotros/index.html',
  privacidad: '/paginas/empresa/privacidad/index.html',
  terminos: '/paginas/empresa/terminos/index.html',
  contacto: '/index.html#contacto'
});
