import { validarCatalogo } from '/src/servicios/catalogo/modelo.js';
const estado = document.getElementById('estado'),
  boton = document.getElementById('recuperar');
let catalogo, ventana;
try {
  const s = localStorage.getItem('roser:catalogo:borrador:es:v1');
  if (!s)
    estado.textContent = 'No hay una edición anterior guardada en este navegador y dirección.';
  else {
    catalogo = validarCatalogo(JSON.parse(s));
    estado.textContent = `Edición anterior encontrada: ${catalogo.productos.length} productos.`;
    boton.disabled = false;
  }
} catch (e) {
  estado.textContent = 'No se pudo recuperar la edición: ' + e.message;
}
boton.addEventListener('click', () => {
  ventana = window.open('http://127.0.0.1:8088/admin/catalogo.html', 'roser-editor-proyecto');
  if (!ventana)
    estado.textContent = 'Permite abrir la ventana del editor y vuelve a pulsar el botón.';
});
window.addEventListener('message', (e) => {
  if (
    !catalogo ||
    e.source !== ventana ||
    e.origin !== 'http://127.0.0.1:8088' ||
    e.data?.tipo !== 'roser-editor-listo'
  )
    return;
  ventana.postMessage({ tipo: 'roser-edicion-anterior', catalogo }, e.origin);
  estado.textContent = 'Edición enviada al nuevo panel. Revisa y guarda allí los cambios.';
});
