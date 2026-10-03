import { montarMarco } from '../componentes/marco.js';
montarMarco();
import { leerJSON } from '/src/servicios/archivos.js';
import {
  cargarEdicionCatalogo,
  guardarCatalogo,
  validarCatalogo,
} from '/src/servicios/configuracion-catalogo.js';
import {
  c,
  t,
  sucio,
  el,
  btn,
  aviso,
  aplicar,
  iniciarEditor,
  marcarGuardado,
  dirty,
} from './catalogo/editor.js';
import { productos } from './catalogo/productos.js';
import { categorias } from './catalogo/categorias.js';
import { destacados } from './catalogo/destacados.js';
import { comercio } from './catalogo/comercio.js';
import { abrirRespaldos, prepararRespaldos } from './catalogo/respaldos.js';
let tab = 'productos',
  revision,
  guardando = false;
export function render() {
  el('guardar').disabled = false;
  el('respaldos').disabled = false;
  el('contenido').replaceChildren();
  el('pestanas').replaceChildren();
  for (const [k, n] of Object.entries(t.tabs)) {
    const b = btn(n, () => {
      if (
        el('guardar').disabled &&
        sucio &&
        !confirm('Hay cambios sin aplicar. ¿Descartarlos y cambiar de sección?')
      )
        return;
      tab = k;
      render();
    });
    if (k === tab) b.setAttribute('aria-current', 'page');
    el('pestanas').append(b);
  }
  ({ productos, categorias, destacados, comercio })[tab]();
}
try {
  const [edicion, textos] = await Promise.all([
    cargarEdicionCatalogo(),
    leerJSON('/src/idiomas/es/admin-catalogo.json'),
  ]);
  revision = edicion.revision;
  iniciarEditor(edicion.catalogo, textos, render);
  render();
  el('contenido').addEventListener('input', dirty);
  el('contenido').addEventListener('change', dirty);
  prepararRespaldos();
  el('guardar').addEventListener('click', async () => {
    if (guardando) return;
    const main = document.querySelector('main');
    guardando = true;
    main.inert = true;
    main.setAttribute('aria-busy', 'true');
    aviso(t.guardando);
    try {
      const resultado = await guardarCatalogo(structuredClone(c), revision);
      revision = resultado.revision;
      marcarGuardado();
      aviso(resultado.sinCambios ? t.sinCambios : t.guardado);
    } catch (e) {
      aviso(e.message, true);
    } finally {
      main.inert = false;
      main.removeAttribute('aria-busy');
      guardando = false;
    }
  });
  el('respaldos').addEventListener('click', async () => {
    try {
      await abrirRespaldos();
    } catch (e) {
      aviso(e.message, true);
    }
  });
  // Recuperación opcional del panel antiguo, solo desde su ventana local original.
  window.addEventListener('message', (e) => {
    if (
      guardando ||
      e.source !== window.opener ||
      !['http://127.0.0.1:5500', 'http://localhost:5500'].includes(e.origin) ||
      e.data?.tipo !== 'roser-edicion-anterior'
    )
      return;
    try {
      validarCatalogo(e.data.catalogo);
      if (confirm(t.confirmarMigracion)) {
        aplicar(e.data.catalogo);
        aviso(t.migracionPreparada);
      }
    } catch (error) {
      aviso(error.message, true);
    }
  });
  if (window.opener) window.opener.postMessage({ tipo: 'roser-editor-listo' }, '*');
  window.addEventListener('beforeunload', (e) => {
    if (sucio || guardando) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
} catch (e) {
  aviso('No se pudo abrir el editor: ' + e.message, true);
}
