import { leerJSON } from '../../../servicios/archivos.js';
import { cargarDetalleAplicacion } from '../../../servicios/configuracion-detalle-aplicacion.js';
import { cargarContenidoInicio } from '../../../servicios/configuracion-sitio.js';
import { montarNavegacion } from '../../../componentes/navegacion/navegacion.js';
import { montarPie } from '../../../componentes/pie-pagina/pie-pagina.js';
import { crearTelefono } from '../../../componentes/telefono/telefono.js';
import { ENLACES_LEGALES_APLICACIONES } from '../../../configuracion/rutas-aplicaciones.js';
const el=id=>document.getElementById(id);
const crear=(tag,clase,texto)=>{const e=document.createElement(tag);if(clase)e.className=clase;if(texto)e.textContent=texto;return e;};
const paths={filamento:'M12 3c-4 0-7 4-7 9s3 9 7 9 7-4 7-9-3-9-7-9Zm0 4c-2 0-3 2-3 5s1 5 3 5 3-2 3-5-1-5-3-5Z',gota:'M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12Z',historial:'M4 9a8 8 0 1 1-1 7M4 3v6h6m2-2v5l3 2',archivo:'M6 3h8l4 4v14H6Zm8 0v5h4M9 12h6m-6 4h6',google:'M5 3v18l16-9Z',apple:'M9 4h6M6 7h12v14H6Zm5 11h2',materiales:'M3 4h18v16H3ZM3 12h18M12 4v8M8 12v8m8-8v8',resultados:'M9 5h11M9 12h11M9 19h11M3 5h1m-1 7h1m-1 7h1',costos:'M5 3h14v18H5ZM8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1'};
function icono(id){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.6');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',paths[id]);s.append(p);return s;}
let textos;
try {
 const id=document.body.dataset.aplicacion;
 const [comun,t,c,inicio]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/detalle-aplicacion.json'),cargarDetalleAplicacion(id),cargarContenidoInicio()]);textos=t;
 montarNavegacion(el('cabecera'),comun.navegacion);montarPie(el('pie'),comun.pie);
 for(const a of el('cabecera').querySelectorAll('nav a'))if(new URL(a.href).pathname==='/paginas/aplicaciones/index.html')a.setAttribute('aria-current','page');
 document.title=`${c.nombre} — ${inicio.hero.marca}`;document.querySelector('meta[name="description"]').content=c.hero.descripcion;
 el('saltar').textContent = t.saltar;
el('volver').textContent = t.volver;
el('miga-actual').textContent = c.nombre;
el('nombre').textContent = c.nombre;
if (id === '3dcost' && c.nombre.startsWith('3D')) {
  el('nombre').replaceChildren(
    crear('span', null, '3D'),
    document.createTextNode(c.nombre.slice(2))
  );
}

if (id === 'construcost' && c.nombre.endsWith('Cost')) {
  el('nombre').replaceChildren(
    document.createTextNode(c.nombre.slice(0, -4)),
    crear('span', null, 'Cost')
  );
}

if (id === '3dcost' && c.nombre.startsWith('3D')) {
  el('nombre').replaceChildren(
    crear('span', null, '3D'),
    document.createTextNode(c.nombre.slice(2))
  );
}

el('lema').textContent = c.hero.titulo;
el('descripcion').textContent = c.hero.descripcion;
 el('fondo').src=c.hero.fondo;el('fondo').addEventListener('error',()=>el('fondo').hidden=true,{once:true});
 el('hero-telefono').append(crearTelefono({src:c.hero.captura,alternativo:c.hero.alternativo,eager:true}));
 const insignias={google:'/assets/imagenes/aplicaciones/tiendas/googleplay.webp',apple:'/assets/imagenes/aplicaciones/tiendas/appstore.webp'};
 for(const k of ['google','apple']){const a=crear('a','ficha-tienda');a.href=c.tiendas[k];a.target='_blank';a.rel='noopener noreferrer';const img=document.createElement('img');img.src=insignias[k];img.alt=t[k];a.append(img);el('tiendas').append(a);} 
 for(const key of ['funciones','galeria','planes']){el(`${key}-titulo`).textContent=c[key].titulo;el(`${key}-descripcion`).textContent=c[key].descripcion;}
 for(const f of c.funciones.items){const card=crear('article','ficha-funcion');card.append(icono(f.icono),crear('h3',null,f.titulo),crear('p',null,f.descripcion));el('funciones').append(card);}
 const visor=el('visor');el('cerrar-visor').textContent=t.cerrar;el('cerrar-visor').addEventListener('click',()=>visor.close());visor.addEventListener('click',e=>{if(e.target===visor){const b=visor.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)visor.close();}});
 for(const item of c.galeria.items){const fig=crear('figure');const btn=crear('button','ficha-captura');btn.type='button';btn.setAttribute('aria-label',`${t.verCaptura} ${item.titulo}`);btn.append(crearTelefono({src:item.imagen,alternativo:item.alternativo}));btn.addEventListener('click',()=>{el('visor-imagen').src=item.imagen;el('visor-imagen').alt=item.alternativo;visor.showModal();});const cap=crear('figcaption');cap.append(crear('h3',null,item.titulo),crear('p',null,item.descripcion));fig.append(btn,cap);el('galeria').append(fig);}
 for(const plan of c.planes.items){const card=crear('article','ficha-plan');const ul=crear('ul');for(const b of plan.beneficios)ul.append(crear('li',null,b));card.append(crear('h3',null,plan.nombre),crear('p',null,plan.titulo),ul);el('planes').append(card);}
 el('planes-nota').textContent=c.planes.nota;el('contacto-titulo').textContent=c.contacto.titulo;el('contactar').textContent=`${c.contacto.boton} →`;el('contactar').href=`https://wa.me/${inicio.contacto.whatsapp}?text=${encodeURIComponent(c.contacto.mensaje)}`;el('contactar').hidden=false;
 for(const k of ['privacidad','terminos']){const a=crear('a',null,t[k]);a.href=ENLACES_LEGALES_APLICACIONES[id][k];el('legales').append(a);}
}catch(e){console.error(e);el('estado').hidden=false;el('estado').textContent=textos?.error??'No se pudo cargar la aplicación. Recarga la página.';}
