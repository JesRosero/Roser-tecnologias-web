import { validarCatalogo } from '/src/servicios/configuracion-catalogo.js';
export let c,
  t,
  sucio = false;
let refrescar;
export function iniciarEditor(catalogo, textos, render) {
  c = catalogo;
  t = textos;
  refrescar = render;
}
export function marcarGuardado() {
  sucio = false;
}
export const el = (id) => document.getElementById(id),
  node = (tag, text) => {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    return n;
  };
export const clone = (v) => structuredClone(v),
  uid = (p) => p + '-' + crypto.randomUUID().slice(0, 8);
export const aviso = (s, error = false) => {
  el('estado').textContent = s;
  el('estado').style.color = error ? '#a22530' : '#0b647c';
};
export const dirty = () => {
  sucio = true;
  aviso(t.pendiente);
};
export const btn = (s, f) => {
  const b = node('button', s);
  b.type = 'button';
  b.addEventListener('click', async () => {
    try {
      await f();
    } catch (e) {
      aviso(e.message, true);
    }
  });
  return b;
};
export function campo(destino, label, valor = '', tipo = 'text') {
  const l = node('label', label),
    i = node(tipo === 'textarea' ? 'textarea' : 'input');
  if (tipo !== 'textarea') i.type = tipo;
  if (tipo === 'checkbox') i.checked = !!valor;
  else i.value = valor ?? '';
  l.append(i);
  destino.append(l);
  return i;
}
export function select(destino, label, valor, opciones) {
  const l = node('label', label),
    s = node('select');
  for (const o of opciones) {
    const op = node('option', o.nombre);
    op.value = o.id;
    s.append(op);
  }
  s.value = valor;
  s.id = uid('campo');
  l.htmlFor = s.id;
  const grupo = node('div');
  grupo.append(l, s);
  destino.append(grupo);
  return s;
}
export function bloque(destino, titulo) {
  const f = node('fieldset');
  f.append(node('legend', titulo));
  const r = node('div');
  r.className = 'rejilla';
  f.append(r);
  destino.append(f);
  return r;
}
export function confirmar() {
  return confirm(t.eliminar);
}
export function encabezado(title, button, fn) {
  const h = node('div');
  h.className = 'cabecera-lista';
  h.append(node('h2', title));
  if (button) h.append(btn(button, fn));
  el('contenido').append(h);
}
export function imagen(src) {
  const i = node('img');
  i.alt = t?.ui?.texto001 ?? 'Vista previa';
  i.src = src;
  i.addEventListener('error', () => {
    i.hidden = true;
  });
  return i;
}
export function descargar(nombre, blob) {
  const a = node('a');
  const u = URL.createObjectURL(blob);
  a.href = u;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function aplicar(next) {
  validarCatalogo(next);
  c = next;
  dirty();
  refrescar();
  aviso(t.aplicado);
}

export function render() {
  if (el('guardar').disabled && sucio && !confirm('Hay cambios sin aplicar. ¿Descartarlos?'))
    return;
  refrescar();
}
