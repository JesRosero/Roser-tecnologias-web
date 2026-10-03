export function crearTelefono({src,alternativo,eager=false}) {
 const marco=document.createElement('div');marco.className='app-telefono';
 const img=document.createElement('img');img.alt=alternativo;img.loading=eager?'eager':'lazy';img.decoding='async';img.src=src;
 marco.append(img);return marco;
}
