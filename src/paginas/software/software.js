import {leerJSON} from '/src/servicios/archivos.js';
import {cargarContenidoInicio} from '/src/servicios/configuracion-sitio.js';
import {montarNavegacion} from '/src/componentes/navegacion/navegacion.js';
import {montarPie} from '/src/componentes/pie-pagina/pie-pagina.js';
try{const [c,inicio]=await Promise.all([leerJSON('/src/idiomas/es/comun.json'),cargarContenidoInicio()]);montarNavegacion(document.getElementById('cabecera'),c.navegacion);montarPie(document.getElementById('pie'),c.pie);if(document.getElementById('pie').dataset.servicioBots){const a=document.createElement('a');a.className='sw-footer-bots';a.href='/paginas/servicios/desarrollo-software/bots/index.html';a.textContent='Conocer Roser Tecnologías Bots';const fila=document.querySelector('#pie .pie-fila');if(fila)fila.insertBefore(a,fila.lastElementChild);}for(const a of document.querySelectorAll('[data-contacto]')){a.href='https://wa.me/'+inicio.contacto.whatsapp+'?text='+encodeURIComponent('Hola, quisiera consultar sobre '+document.title.split(' — ')[0]+'.');a.target='_blank';a.rel='noopener noreferrer';}for(const a of document.querySelectorAll('#cabecera nav a'))if(new URL(a.href).pathname===(location.pathname.includes('/proyectos/')?'/paginas/proyectos/index.html':'/paginas/servicios/index.html'))a.setAttribute('aria-current','page');}catch(e){console.error('No se pudo cargar la navegación y el contacto.',e);}
if (document.getElementById('demo-productos')) {
  const productos = [
    {nombre: 'Tornillo genérico', precio: 500, imagen: 'tornillos'},
    {nombre: 'Cinta aislante', precio: 4000, imagen: 'cinta'},
    {nombre: 'Brocha de 2 pulgadas', precio: 8000, imagen: 'brocha'}
  ];
  const cantidades = [0, 0, 0];
  let revisado = false;
  const el = id => document.getElementById(id);
  const cop = n => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  const total = () => productos.reduce((s,p,i) => s+p.precio*cantidades[i],0);
  function foto(p) {
    const im = document.createElement('img');
    im.className = 'sw-product-photo';
    im.src = '/assets/imagenes/software/actualizacion-34/'+p.imagen+'.webp';
    im.alt = ''; im.width = 48; im.height = 48;
    return im;
  }
  function render() {
    const list = document.createElement('ul');list.className='sw-summary-products';
    productos.forEach((p,i) => {
      if (!cantidades[i]) return;
      const li = document.createElement('li');
      const texto = document.createElement('span');
      texto.textContent = `${cantidades[i]} × ${p.nombre}: ${cop(p.precio*cantidades[i])}`;
      li.append(foto(p),texto);list.append(li);
    });
    if (!total()) list.textContent='Selecciona productos para comenzar.';
    const t=document.createElement('p');t.className='sw-total';t.textContent='Total ilustrativo: '+cop(total());
    el('demo-resumen').replaceChildren(list,t);
    el('demo-confirmar').disabled=!revisado||!total();
  }
  productos.forEach((p,i) => {
    const row=document.createElement('div');row.className='sw-product';
    const label=document.createElement('div');label.className='sw-product-label';
    const texto=document.createElement('div');texto.textContent=p.nombre;
    const price=document.createElement('small');price.textContent=cop(p.precio)+' / unidad';texto.append(price);
    label.append(foto(p),texto);
    const controls=document.createElement('div');controls.className='sw-quantity';
    const out=document.createElement('output');out.textContent='0';out.setAttribute('aria-label','Cantidad de '+p.nombre);
    for(const [symbol,delta] of [['−',-1],['+',1]]) {
      const b=document.createElement('button');b.type='button';b.textContent=symbol;
      b.setAttribute('aria-label',(delta>0?'Agregar ':'Retirar ')+p.nombre);
      b.onclick=()=>{
        cantidades[i]=Math.max(0,Math.min(99,cantidades[i]+delta));out.textContent=cantidades[i];
        revisado=false;el('demo-estado').textContent='';render();
      };
      if(delta<0) controls.append(b,out);else controls.append(b);
    }
    row.append(label,controls);el('demo-productos').append(row);
  });
  el('demo-revisar').onclick=()=>{
    revisado=true;render();
    el('demo-estado').textContent=total()?'Resumen preparado. Puedes simular la solicitud.':'Agrega al menos un producto.';
  };
  el('demo-confirmar').onclick=()=>{
    el('demo-estado').textContent='Simulación completada. La solicitud quedaría pendiente de revisión del vendedor. No se ha enviado ningún pedido.';
    el('demo-confirmar').disabled=true;
  };
  el('demo-reiniciar').onclick=()=>{
    cantidades.fill(0);document.querySelectorAll('.sw-quantity output').forEach(x=>x.textContent='0');
    revisado=false;el('demo-estado').textContent='Demostración reiniciada.';render();
  };
  el('demo-humano').onclick=()=>{
    el('demo-atencion').textContent='Demostración: aquí se solicitaría atención humana dentro de WhatsApp. No se ha contactado a un vendedor.';
  };
  render();
}
