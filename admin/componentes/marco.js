import { areas, areaActual } from './secciones.js';
export function montarMarco() {
 if(document.getElementById('marco-admin')) return;
 document.body.classList.add('roser-admin');
 document.getElementById('roser-bots-admin-access')?.remove();
 const css=document.createElement('link'); css.rel='stylesheet'; css.href='/admin/estilos/marco.css?v=45'; if(!document.querySelector('link[href*="/admin/estilos/marco.css"]')) document.head.append(css);
 const lateral=document.createElement('aside'); lateral.id='marco-admin';
 const marca=document.createElement('a'); marca.className='admin-marca'; marca.href='/admin/panel.html';
 marca.append(Object.assign(document.createElement('strong'),{textContent:'ROSER'}),Object.assign(document.createElement('span'),{textContent:'TECNOLOGÍAS'}));
 const nav=document.createElement('nav'); nav.setAttribute('aria-label','Administrador Roser');
 const actual=areaActual();
 for(const area of areas){
  const a=document.createElement('a'); a.href='/admin/'+area.ruta;
  const icono=document.createElement('span'); icono.className='admin-icono'; icono.textContent=area.icono; icono.setAttribute('aria-hidden','true');
  a.append(icono,document.createTextNode(area.titulo)); if(area.id===actual) a.setAttribute('aria-current','page'); nav.append(a);
 }
 const pie=document.createElement('div'); pie.className='admin-lateral-pie';
 pie.append(Object.assign(document.createElement('small'),{textContent:'Administrador de la página web'}),Object.assign(document.createElement('small'),{textContent:'Administrador 2 · Proyecto local'}));
 lateral.append(marca,nav,pie);
 const barra=document.createElement('div'); barra.className='admin-barra-superior';
 const abrir=document.createElement('button'); abrir.type='button'; abrir.className='admin-menu-toggle'; abrir.textContent='☰ Menú'; abrir.setAttribute('aria-controls','marco-admin'); abrir.setAttribute('aria-expanded','false');
 abrir.onclick=()=>{const abierto=document.body.classList.toggle('admin-menu-abierto'); abrir.setAttribute('aria-expanded',String(abierto));};
 const titulo=document.createElement('span'); titulo.textContent='Administrador Roser';
 const ver=document.createElement('a'); ver.href='/index.html'; ver.target='_blank'; ver.rel='noopener'; ver.textContent='Ver sitio local ↗';
 barra.append(abrir,titulo,ver); document.body.prepend(lateral,barra);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('admin-menu-abierto');abrir.setAttribute('aria-expanded','false');}});
 const main=document.querySelector('main');
 if(main){ main.id ||= 'contenido-admin'; const salto=document.createElement('a');salto.className='admin-saltar';salto.href='#'+main.id;salto.textContent='Ir al contenido';document.body.prepend(salto); }
 if(actual==='proyectos' && location.pathname.endsWith('/proyectos.html')) {
  const a=document.createElement('a');a.className='admin-caso-bot';a.href='/admin/visual.html?pagina=proyecto-bot-ferreteria';a.textContent='Editar página del proyecto · Bot de Ferretería John’s →';main?.prepend(a);
 }
 // Accesos contextuales sin repetir todas las páginas en el resumen.
 if(['servicios','aplicaciones','documentos','proyectos'].includes(actual) && !location.pathname.endsWith('/secciones.html')){
  const enlace=document.createElement('a'); enlace.className='admin-volver-grupo';enlace.href=actual==='proyectos'?'/admin/proyectos.html':'/admin/secciones.html?grupo='+actual;enlace.textContent='← '+areas.find(a=>a.id===actual).titulo;if(!location.pathname.endsWith('/proyectos.html'))main?.prepend(enlace);
 }
}
