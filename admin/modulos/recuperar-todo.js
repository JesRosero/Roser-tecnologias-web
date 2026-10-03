import { api } from '../componentes/api.js';
const estado = document.getElementById('estado'),
  lista = document.getElementById('opciones'),
  boton = document.getElementById('recuperar');
const antigua = ['http://127.0.0.1:5500', 'http://localhost:5500'].includes(location.origin);
let hijo,
  datos = [];
if (antigua) {
  const registro = await (await fetch('/src/configuracion/recursos-admin.json')).json();
  for (const r of registro) {
    try {
      const c = JSON.parse(localStorage.getItem(r.clave));
      if (c) datos.push({ id: r.id, contenido: c });
    } catch {}
  }
  estado.textContent = datos.length
    ? `${datos.length} secciones con edición anterior.`
    : 'No se encontraron ediciones anteriores en este navegador.';
  boton.disabled = !datos.length;
  boton.onclick = () => {
    hijo = window.open('http://127.0.0.1:8088/admin/recuperar-todo.html', 'roser-recuperar');
  };
  window.addEventListener('message', (e) => {
    if (
      e.source === hijo &&
      e.origin === 'http://127.0.0.1:8088' &&
      e.data?.tipo === 'roser-recuperar-listo'
    )
      hijo.postMessage({ tipo: 'roser-recuperar-todo', datos }, e.origin);
  });
} else {
  const registro = await api('recursos');
  if (!window.opener) {
    const a = document.createElement('a');
    a.href = 'http://127.0.0.1:5500/admin/recuperar-todo.html';
    a.textContent =
      'Abrir recuperación en el navegador anterior (Live Server debe estar abierto solo para esta recuperación)';
    a.target = '_blank';
    lista.append(a);
    boton.hidden = true;
  }
  window.addEventListener('message', async (e) => {
    if (
      e.source !== window.opener ||
      !['http://127.0.0.1:5500', 'http://localhost:5500'].includes(e.origin) ||
      e.data?.tipo !== 'roser-recuperar-todo' ||
      !Array.isArray(e.data.datos)
    )
      return;
    lista.replaceChildren();
    datos = [];
    for (const item of e.data.datos) {
      const r = registro.find((x) => x.id === item.id);
      if (!r || datos.some((x) => x.id === item.id)) continue;
      const actual = await api('documentos/' + r.id);
      const label = document.createElement('label'),
        check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = true;
      const pre = document.createElement('details'),
        summary = document.createElement('summary'),
        code = document.createElement('pre');
      summary.textContent = 'Revisar contenido';
      code.textContent = JSON.stringify(item.contenido, null, 2);
      pre.append(summary, code);
      label.append(check, document.createTextNode(r.titulo), pre);
      lista.append(label);
      datos.push({ ...item, revision: actual.revision, check });
    }
    estado.textContent =
      'Selecciona las secciones que quieres recuperar. Las versiones actuales quedarán respaldadas.';
  });
  if (window.opener) window.opener.postMessage({ tipo: 'roser-recuperar-listo' }, '*');
  boton.onclick = async () => {
    if (!datos.length || !confirm('¿Guardar las secciones seleccionadas en el proyecto?')) return;
    boton.disabled = true;
    const resultados = [];
    for (const r of datos.filter((x) => x.check.checked)) {
      try {
        await api('documentos/' + r.id, {
          method: 'PUT',
          body: JSON.stringify({ contenido: r.contenido, revision: r.revision }),
        });
        resultados.push(r.id + ': recuperado');
      } catch (e) {
        resultados.push(r.id + ': ' + e.message);
      }
    }
    estado.textContent = resultados.join(' · ');
    boton.disabled = false;
  };
}
