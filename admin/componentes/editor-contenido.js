import { api, subirImagen } from './api.js';
import { montarMarco } from './marco.js';
import { leerJSON } from '/src/servicios/archivos.js';
export async function montarEditor({ recurso, idioma, renderizarCampos }) {
  montarMarco();
  const form = document.getElementById('editor');
  const estado = document.getElementById('estado');
  let contenido,
    textos,
    revision,
    editado = false,
    guardando = false;
  const entradas = new Map();
  function aviso(mensaje) {
    estado.textContent = mensaje;
  }
  function campo(grid, clave, etiqueta, valor, tipo = 'text') {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = etiqueta;
    const input = document.createElement(tipo === 'textarea' ? 'textarea' : 'input');
    if (tipo !== 'textarea') input.type = tipo;
    input.name = clave;
    input.value = valor;
    input.required = true;
    input.maxLength = clave.endsWith('correo') ? 254 : clave.endsWith('telefono') ? 40 : 300;
    if (tipo === 'textarea') input.rows = 3;
    if (clave.endsWith('whatsapp')) {
      input.pattern = '[0-9]{7,15}';
      input.inputMode = 'numeric';
    }
    label.append(span, input);
    grid.append(label);
    entradas.set(clave, input);
    return input;
  }
  function imagen(grid, clave, valor) {
    const caja = document.createElement('div');
    caja.className = 'imagen-editor';
    const input = campo(caja, clave, textos.campos.imagen, valor);
    const ayuda = document.createElement('p');
    ayuda.className = 'ayuda';
    ayuda.textContent = textos.ayudaImagen;
    const vista = document.createElement('img');
    vista.alt = textos.vistaImagen;
    const falta = document.createElement('p');
    falta.className = 'ayuda';
    falta.textContent = textos.imagenNoEncontrada;
    falta.hidden = true;
    vista.addEventListener('load', () => {
      vista.hidden = false;
      falta.hidden = true;
    });
    vista.addEventListener('error', () => {
      vista.hidden = true;
      falta.hidden = false;
    });
    function actualizar() {
      const ruta = input.value.trim();
      if (ruta.startsWith('/assets/') && ruta.endsWith('.webp') && !ruta.includes('..'))
        vista.src = ruta;
      else {
        vista.hidden = true;
        falta.hidden = false;
      }
    }
    input.addEventListener('change', actualizar);
    actualizar();
    const subir = document.createElement('label');
    subir.className = 'admin-subir';
    subir.textContent = 'Seleccionar imagen (se convierte a WebP)';
    const archivo = document.createElement('input');
    archivo.type = 'file';
    archivo.accept = 'image/png,image/jpeg,image/webp';
    archivo.addEventListener('change', async () => {
      if (!archivo.files[0]) return;
      archivo.disabled = true;
      form.inert = true;
      guardando = true;
      try {
        input.value = await subirImagen(archivo.files[0]);
        actualizar();
        editado = true;
        aviso('Imagen preparada. Guarda los cambios para usarla en la página.');
      } catch (e) {
        aviso(e.message);
      } finally {
        archivo.disabled = false;
        form.inert = false;
        guardando = false;
      }
    });
    subir.append(archivo);
    caja.append(subir, ayuda, vista, falta);
    grid.append(caja);
  }
  function grupo(titulo) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = titulo;
    const grid = document.createElement('div');
    grid.className = 'campos-grid';
    fieldset.append(legend, grid);
    document.getElementById('campos').append(fieldset);
    return grid;
  }
  function renderizar() {
    entradas.clear();
    document.getElementById('campos').replaceChildren();
    renderizarCampos({
      contenido,
      textos,
      campo,
      imagen,
      grupo,
      registrar: (clave, input) => entradas.set(clave, input),
    });
  }
  function recopilar() {
    const copia = structuredClone(contenido);
    for (const [ruta, input] of entradas) {
      const partes = ruta.split('.');
      const clave = partes.pop();
      let destino = copia;
      for (const p of partes) destino = destino[p];
      destino[clave] = input.value.trim();
    }
    return copia;
  }
  form.addEventListener('input', () => {
    editado = true;
    aviso(textos.sinGuardar);
  });
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    guardando = true;
    form.inert = true;
    try {
      const nuevo = recopilar();
      const r = await api('documentos/' + recurso, {
        method: 'PUT',
        body: JSON.stringify({ contenido: nuevo, revision }),
      });
      contenido = r.contenido;
      revision = r.revision;
      editado = false;
      aviso(r.sinCambios ? 'No hay cambios nuevos.' : 'Cambios guardados en el proyecto.');
    } catch (e) {
      aviso(e.message);
    } finally {
      guardando = false;
      form.inert = false;
    }
  });
  async function respaldos() {
    try {
      const versiones = await api('documentos/' + recurso + '/respaldos');
      const d = document.createElement('dialog');
      d.className = 'admin-respaldos';
      const titulo = document.createElement('h2');
      titulo.textContent = 'Últimos cinco respaldos';
      const cerrar = document.createElement('button');
      cerrar.textContent = 'Cerrar';
      cerrar.onclick = () => d.close();
      d.append(titulo, cerrar);
      if (!versiones.length) {
        const p = document.createElement('p');
        p.textContent = 'Todavía no hay versiones anteriores guardadas.';
        d.append(p);
      }
      for (const v of versiones) {
        const b = document.createElement('button');
        b.textContent = new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'medium',
          timeZone: 'America/Bogota',
        }).format(new Date(v.fecha));
        b.onclick = async () => {
          try {
            const r = await api('documentos/' + recurso + '/respaldos/' + v.id);
            let pre = d.querySelector('pre');
            if (pre) pre.remove();
            pre = document.createElement('pre');
            pre.className = 'respaldo-json';
            pre.textContent = JSON.stringify(r.catalogo, null, 2);
            d.append(pre);
            let usar = d.querySelector('[data-usar]');
            if (usar) usar.remove();
            usar = document.createElement('button');
            usar.dataset.usar = '';
            usar.textContent = 'Usar esta versión en el editor';
            usar.onclick = () => {
              if (editado && !confirm('¿Reemplazar los cambios sin guardar del editor?')) return;
              contenido = structuredClone(r.catalogo);
              renderizar();
              editado = true;
              aviso('Respaldo aplicado al editor. Guarda los cambios para actualizar el proyecto.');
              d.close();
            };
            d.append(usar);
          } catch (e) {
            aviso(e.message);
          }
        };
        d.append(b);
      }
      d.addEventListener('close', () => d.remove(), { once: true });
      document.body.append(d);
      d.showModal();
    } catch (e) {
      aviso(e.message);
    }
  }
  window.addEventListener('beforeunload', (e) => {
    if (editado || guardando) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  try {
    const [t, r] = await Promise.all([leerJSON(idioma), api('documentos/' + recurso)]);
    textos = t;
    contenido = r.contenido;
    revision = r.revision;
    document.querySelectorAll('[data-texto]').forEach((el) => {
      el.textContent = textos[el.dataset.texto];
    });
    document.getElementById('guardar').textContent = 'Guardar cambios';
    const respaldosBoton = document.getElementById('respaldos');
    respaldosBoton.textContent = 'Revisar respaldos';
    respaldosBoton.disabled = false;
    respaldosBoton.addEventListener('click', respaldos);
    const modo = document.querySelector('[data-texto=modo]');
    if (modo) modo.textContent = 'Edición del proyecto';
    const nota = document.querySelector('[data-texto="aviso"]');
    if (nota)
      nota.textContent =
        'Guardar cambios actualiza el proyecto. Publicar requiere subir los cambios con Git.';
    renderizar();
    document.getElementById('guardar').disabled = false;
  } catch (error) {
    aviso(`No se pudo abrir el editor. ${error.message}`);
  }
}
