import { montarMarco } from '../componentes/marco.js';
montarMarco();
const filas=[
 ['Contenido del sitio','Inicio y presentación de Roser Tecnologías','/admin/visual.html?pagina=inicio','⌂'],
 ['Servicios','Ingeniería, fabricación y páginas de servicios','/admin/secciones.html?grupo=servicios','◇'],
 ['Aplicaciones','3DCost, ConstruCost y sus páginas','/admin/secciones.html?grupo=aplicaciones','▤'],
 ['Catálogo de productos','Productos, precios, variantes y fotografías','/admin/visual.html?pagina=catalogo','□'],
 ['Portafolio','Proyectos, galerías y enlaces de video','/admin/visual.html?pagina=proyectos','▱'],
 ['Documentos','Privacidad y condiciones de la web y las aplicaciones','/admin/secciones.html?grupo=documentos','≡']
];
for(const [titulo,descripcion,ruta,icono] of filas){
 const a=document.createElement('a');a.className='admin-resumen-fila';a.href=ruta;
 const i=document.createElement('span');i.className='admin-resumen-icono';i.textContent=icono;i.setAttribute('aria-hidden','true');
 const texto=document.createElement('div');texto.append(Object.assign(document.createElement('strong'),{textContent:titulo}),Object.assign(document.createElement('span'),{textContent:descripcion}));
 const flecha=document.createElement('span');flecha.textContent='→';flecha.setAttribute('aria-hidden','true');a.append(i,texto,flecha);document.getElementById('secciones').append(a);
}
