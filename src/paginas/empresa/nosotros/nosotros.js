import {leerJSON} from '/src/servicios/archivos.js';
import {cargarContenidoNosotros} from '/src/servicios/configuracion-nosotros.js';
import {cargarContenidoInicio} from '/src/servicios/configuracion-sitio.js';
import {montarNavegacion} from '/src/componentes/navegacion/navegacion.js';
import {montarPie} from '/src/componentes/pie-pagina/pie-pagina.js';
import {RUTAS} from '/src/configuracion/rutas.js';
const el=id=>document.getElementById(id);
const crear=(tag,clase,texto)=>{const n=document.createElement(tag);if(clase)n.className=clase;if(texto)n.textContent=texto;return n;};
function parrafos(destino,items){destino.replaceChildren(...items.map(p=>crear('p',null,p)));}
function perfil(p){
 const card=crear('article','nosotros-perfil');card.dataset.persona=p.id;
 const head=crear('header','nosotros-perfil-cabecera');const foto=crear('div','nosotros-retrato');
 const iniciales=crear('span','nosotros-iniciales',p.iniciales);iniciales.setAttribute('aria-hidden','true');
 const img=crear('img');img.alt=p.alternativo;img.width=112;img.height=112;img.loading='lazy';
 img.addEventListener('error',()=>{img.hidden=true;},{once:true});img.addEventListener('load',()=>{iniciales.hidden=true;});img.src=p.imagen;foto.append(iniciales,img);
 const identidad=crear('div');const h=crear('h3',null,p.nombre);h.id=`perfil-${p.id}`;card.setAttribute('aria-labelledby',h.id);identidad.append(h,crear('p','nosotros-cargo',p.cargo));head.append(foto,identidad);
 const cuerpo=crear('div','nosotros-biografia');parrafos(cuerpo,p.parrafos);card.append(head,cuerpo);return card;
}
let t;
try{
 const [comun,textos,c,inicio]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),leerJSON('/src/idiomas/es/nosotros.json'),cargarContenidoNosotros(),cargarContenidoInicio()]);t=textos;
 montarNavegacion(el('cabecera'),comun.navegacion);montarPie(el('pie'),comun.pie);
 for(const a of el('cabecera').querySelectorAll('nav a'))if(new URL(a.href).pathname===RUTAS.nosotros)a.setAttribute('aria-current','page');
 document.title=`${c.hero.etiqueta} — ${inicio.hero.marca}`;document.querySelector('meta[name=description]').content=c.hero.descripcion;el('saltar').textContent=t.saltar;
 for(const k of ['etiqueta','titulo','lema','descripcion'])el(k).textContent=c.hero[k];el('hero-nota').textContent=c.hero.nota;
 const fondo=el('hero-imagen');fondo.addEventListener('error',()=>{fondo.hidden=true;},{once:true});fondo.src=c.hero.imagen;
 el('origen-titulo').textContent=c.origen.titulo;parrafos(el('origen'),c.origen.parrafos);el('personas-titulo').textContent=c.personas.titulo;el('perfiles').replaceChildren(...c.personas.perfiles.map(perfil));
 for(const k of ['trabajo','mision','vision','contacto'])for(const f of ['titulo','descripcion'])el(`${k}-${f}`).textContent=c[k][f];
 el('pasos').replaceChildren(...c.trabajo.pasos.map((p,i)=>{const li=crear('li');li.append(crear('span',null,String(i+1)),crear('strong',null,p));return li;}));
 el('contactar').textContent=`${c.contacto.boton} →`;el('contactar').href=`https://wa.me/${inicio.contacto.whatsapp}?text=${encodeURIComponent(c.contacto.mensaje)}`;el('contactar').hidden=false;
}catch(e){console.error(e);el('estado').textContent=t?.error||'No se pudo cargar Nosotros. Recarga la página.';el('estado').hidden=false;}
