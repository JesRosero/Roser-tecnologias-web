// Organiza los mismos campos sin duplicar el formulario ni descartar borradores.
export function organizarFicha(form) {
 const campos=[...form.querySelectorAll(':scope > fieldset')];
 if(campos.length!==7) return; // Mantener operable el editor si su estructura cambia.
 const grupos=[{titulo:'Información',indices:[0,1,5,6]}, {titulo:'Precio y variantes',indices:[2,3]}, {titulo:'Fotografías',indices:[4]}];
 const nav=document.createElement('nav');nav.className='admin-ficha-pestanas';nav.setAttribute('aria-label','Apartados del producto');
 const ayuda=document.createElement('p');ayuda.className='ayuda admin-ficha-ayuda';ayuda.textContent='Puedes cambiar de apartado sin perder lo escrito. Al terminar, aplica y guarda los cambios.';
 const botones=[];
 function abrir(i){
  grupos.forEach((g,j)=>{botones[j].setAttribute('aria-pressed',String(i===j));g.indices.forEach(k=>campos[k].hidden=i!==j);});
 }
 grupos.forEach((g,i)=>{const b=document.createElement('button');b.type='button';b.textContent=g.titulo;b.onclick=()=>abrir(i);botones.push(b);nav.append(b);});
 form.prepend(nav,ayuda);abrir(0);
}
