import {rutaPublica} from './mapa-visual.js';
// Navegación común. Los editores se obtienen del registro real del servidor local.
export const areas = [
  {id:'resumen', titulo:'Resumen', icono:'▦', ruta:'panel.html', descripcion:'Contenido y acceso al sitio local.'},
  {id:'inicio', titulo:'Inicio', icono:'⌂', ruta:'visual.html?pagina=inicio'},
  {id:'servicios', titulo:'Servicios', icono:'◇', ruta:'secciones.html?grupo=servicios'},
  {id:'aplicaciones', titulo:'Aplicaciones', icono:'▤', ruta:'secciones.html?grupo=aplicaciones'},
  {id:'nosotros', titulo:'Nosotros', icono:'◎', ruta:'visual.html?pagina=nosotros'},
  {id:'catalogo', titulo:'Productos', icono:'□', ruta:'visual.html?pagina=catalogo'},
  {id:'proyectos', titulo:'Proyectos', icono:'▱', ruta:'visual.html?pagina=proyectos'},
  {id:'documentos', titulo:'Documentos', icono:'≡', ruta:'secciones.html?grupo=documentos'}
];
const titulos = {
 'inicio':'Página principal', 'servicios':'Presentación de servicios', 'aplicaciones':'Presentación de aplicaciones',
 'servicio-diseno-ingenieria':'Diseño e ingeniería', 'servicio-prototipado-impresion-3d':'Prototipado e impresión 3D',
 'servicio-fabricacion-montaje':'Fabricación y montaje', 'servicio-mantenimiento-electromecanico':'Mantenimiento electromecánico',
 'aplicacion-3dcost':'3DCost', 'aplicacion-construcost':'ConstruCost'
};
export function grupoRecurso(r) {
 if(r.grupo) return r.grupo;
 if(r.id.startsWith('legal-')) return 'documentos';
 if(r.id.startsWith('servicio-') || r.id==='servicios') return 'servicios';
 if(r.id.startsWith('aplicacion-') || r.id==='aplicaciones') return 'aplicaciones';
 return r.id;
}
export function tituloRecurso(r) {
 if(r.editor==='software') return r.titulo;
 if(titulos[r.id]) return titulos[r.id];
 if(r.id.startsWith('legal-')) return `${({roser:'Roser Tecnologías','3dcost':'3DCost',construcost:'ConstruCost'})[r.args[0]] || r.args[0]} · ${r.args[1]==='privacidad'?'Privacidad':'Términos y condiciones'}`;
 return r.titulo;
}
export function rutaRecurso(r) {
 if(r.editor!=='software'&&!rutaPublica(r))return null;
 return '/admin/visual.html?pagina='+encodeURIComponent(r.editor==='software'?r.pagina:r.id);
}
export function areaActual(url = new URL(location.href)) {
 const p=url.pathname.split('/').pop();
 if(p==='software.html'||p==='visual.html'){const id=url.searchParams.get('pagina')||'';return id.startsWith('bots-')||id.startsWith('legal-')?'documentos':id==='proyecto-bot-ferreteria'||id==='proyectos'||id==='tarjeta-bot-ferreteria'?'proyectos':id==='inicio'?'inicio':id==='nosotros'?'nosotros':id==='catalogo'?'catalogo':id.startsWith('aplicacion-')||id==='aplicaciones'?'aplicaciones':'servicios';}
 if(p==='secciones.html') return url.searchParams.get('grupo');
 if(p?.startsWith('documento-')) return 'documentos';
 if(p==='detalle-servicio.html' || p==='servicios.html') return 'servicios';
 if(p==='detalle-aplicacion.html' || p==='aplicaciones.html') return 'aplicaciones';
 return ({'panel.html':'resumen','index.html':'inicio','catalogo.html':'catalogo','proyectos.html':'proyectos','nosotros.html':'nosotros'})[p] || 'resumen';
}
