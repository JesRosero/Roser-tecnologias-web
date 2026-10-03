import { icono } from '../../componentes/tienda/iconos.js';
import { estadoVariante } from '../../componentes/tienda/disponibilidad.js';
import {
  productosPublicos,
  relacionados,
  precioVariante,
  puedeComprar,
} from '../../servicios/catalogo/modelo.js';
import { agregarLinea } from '../../servicios/catalogo/seleccion.js';
import {
  guardarArchivo,
  borrarArchivo,
} from '../../servicios/catalogo/archivos-personalizacion.js';
import {
  el,
  crear,
  imagen,
  boton,
  moneda,
  avisar,
  abrir,
  cerrarFuera,
} from '../../componentes/tienda/utilidades.js';
import { tarjeta } from '../../componentes/tienda/tarjeta.js';
export function montarFicha(c, t, telefono) {
  const id = new URLSearchParams(location.search).get('id');
  const p = productosPublicos(c).find((p) => p.id === id);
  if (!p) throw Error(t.noProducto);
  document.title = `${p.nombre} — Roser Tecnologías`;
  document.querySelector('meta[name=description]').content = p.descripcion;
  el('nombre').textContent = p.nombre;
  el('referencia').textContent = p.referencia;
  el('descripcion').textContent = p.descripcion;
  el('volver').textContent = `← ${t.volver}`;
  el('ilustracion').textContent = t.ilustracion;
  const fotos = p.imagenes.length ? p.imagenes : [''];
  const grande = el('foto');
  const visor = el('visor');
  cerrarFuera(visor);
  el('cerrar-visor').textContent = t.cerrar;
  el('cerrar-visor').addEventListener('click', () => visor.close());
  function foto(src) {
    grande.replaceChildren(imagen(src, p.nombre));
    grande.onclick = () => {
      el('visor-foto').replaceChildren(imagen(src, p.nombre));
      abrir(visor);
    };
  }
  foto(fotos[0]);
  for (const src of fotos) el('miniaturas').append(boton('', () => foto(src), 'tienda-miniatura'));
  [...el('miniaturas').children].forEach((b, i) => {
    b.append(imagen(fotos[i], p.nombre));
    b.setAttribute('aria-label', `${t.detalles} ${i + 1}`);
  });
  let v = p.variantes[0],
    archivos = [],
    opciones = {};
  const form = el('personalizacion');
  const selector = crear('select');
  selector.setAttribute('aria-label', `${t.color} / ${t.tamano}`);
  for (const x of p.variantes) selector.append(new Option(`${x.color} · ${x.tamano}`, x.id));
  const label = crear('label', null, `${t.color} / ${t.tamano}`);
  label.append(selector);
  form.append(label);
  const precio = el('precio'),
    disponibilidad = el('disponibilidad'),
    add = el('agregar');
  const cantidad = crear('input');
  cantidad.type = 'number';
  cantidad.min = 1;
  cantidad.max = 999;
  cantidad.step = 1;
  cantidad.value = 1;
  const ql = crear('label', null, t.cantidad);
  ql.append(cantidad);
  form.append(ql);
  const camposPersonal = crear('div', 'tienda-personal-campos');
  form.append(camposPersonal);
  function campo(k, multi = false) {
    const label = crear('label', null, t[k]);
    const input = crear(multi ? 'textarea' : 'input');
    if (!multi) input.type = 'text';
    input.maxLength = 1000;
    input.name = k;
    label.append(input);
    (k === 'observaciones' ? form : camposPersonal).append(label);
    input.addEventListener('input', () => {
      opciones[k] = input.value.trim();
    });
  }
  const vistaUrls = new Map();
  function limpiarUrl(k) {
    const u = vistaUrls.get(k);
    if (u) URL.revokeObjectURL(u);
    vistaUrls.delete(k);
  }
  async function archivo(k) {
    const label = crear('label', null, t[k]);
    const input = crear('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    const preview = crear('img', 'tienda-archivo-vista');
    preview.hidden = true;
    preview.alt = t[k];
    const estado = crear('span', 'tienda-meta tienda-archivo-estado', t.sinArchivo);
    const quitar = boton(
      t.eliminar,
      async () => {
        const anterior = archivos.find((a) => a.campo === k);
        archivos = archivos.filter((a) => a.campo !== k);
        if (anterior) await borrarArchivo(anterior.id);
        limpiarUrl(k);
        preview.hidden = true;
        input.value = '';
        estado.textContent = t.sinArchivo;
      },
      'tienda-enlace',
    );
    label.append(input, preview, estado, quitar);
    (k === 'observaciones' ? form : camposPersonal).append(label);
    input.addEventListener('change', async () => {
      const f = input.files[0];
      if (!f) return;
      input.disabled = true;
      add.disabled = true;
      try {
        const a = await guardarArchivo(f, k);
        const anterior = archivos.find((a) => a.campo === k);
        archivos = archivos.filter((a) => a.campo !== k);
        archivos.push(a);
        if (anterior) await borrarArchivo(anterior.id);
        limpiarUrl(k);
        const url = URL.createObjectURL(f);
        vistaUrls.set(k, url);
        preview.src = url;
        preview.hidden = false;
        estado.textContent = a.nombre;
      } catch (e) {
        avisar(e.message);
        input.value = '';
      } finally {
        input.disabled = false;
        actualizar();
      }
    });
  }
  if (p.personalizacion.activa) {
    form.prepend(crear('h2', null, t.personaliza));
    if (p.personalizacion.modalidad === 'cotizar') {
      const elegir = crear('input'); elegir.type = 'checkbox';
      const label = crear('label', 'tienda-personal-opcional');
      const texto = crear('span', 'tienda-personal-opcional-texto');
      texto.append(crear('strong', null, t.personalOpcional), crear('small', null, t.personalOpcionalDetalle));
      label.append(elegir, texto);
      camposPersonal.before(label);
      const aviso = crear('p', 'tienda-info', t.personalRecargo);
      camposPersonal.append(aviso);
      camposPersonal.hidden = true;
      elegir.addEventListener('change', async () => {
        camposPersonal.hidden = !elegir.checked;
        if (elegir.checked) opciones.personalizacion = t.conRecargo;
        else {
          delete opciones.personalizacion; delete opciones.texto;
          for (const a of archivos) await borrarArchivo(a.id);
          archivos = [];
          for (const i of camposPersonal.querySelectorAll('input')) i.value = '';
          for (const img of camposPersonal.querySelectorAll('img')) img.hidden = true;
          for (const e of camposPersonal.querySelectorAll('.tienda-archivo-estado')) e.textContent = t.sinArchivo;
          for (const k of vistaUrls.keys()) limpiarUrl(k);
        }
      });
    } else camposPersonal.append(crear('p', 'tienda-info', t.personalIncluida));
    if (p.personalizacion.texto) campo('texto');
    if (p.personalizacion.imagen) archivo('imagen');
    if (p.personalizacion.qr) archivo('qr');
    form.append(crear('p', 'tienda-info', t.confirmarDiseno));
  }
  if (p.personalizacion.observaciones) campo('observaciones', true);
  function actualizar() {
    v = p.variantes.find((x) => x.id === selector.value);
    const pr = precioVariante(p, v);
    precio.textContent =
      pr === null ? t.porCotizar : `${p.precio.modo === 'desde' ? t.desde + ' ' : ''}${moneda(pr)}`;
    disponibilidad.textContent = t.disponibilidad[estadoVariante(v)];
    disponibilidad.dataset.disponibilidad = estadoVariante(v);
    disponibilidad.classList.add('tienda-estado');
    cantidad.max = v.existencias === null ? 999 : Math.min(v.existencias, 999);
    add.disabled = !puedeComprar(v) || !!form.querySelector('input[type=file]:disabled');
  }
  selector.addEventListener('change', actualizar);
  actualizar();
  add.textContent = t.agregar;
  add.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    try {
      agregarLinea(c, p, v, Number(cantidad.value), opciones, archivos);
      archivos = [];
      for (const label of form.querySelectorAll('.tienda-archivo-estado'))
        label.textContent = t.sinArchivo;
      for (const input of form.querySelectorAll('input[type=file]')) input.value = '';
      for (const img of form.querySelectorAll('.tienda-archivo-vista')) img.hidden = true;
      for (const k of vistaUrls.keys()) limpiarUrl(k);
      avisar(t.agregado);
    } catch (e) {
      avisar(e.message);
    }
  });
  el('consultar').textContent = t.consultar;
  el('consultar').prepend(icono('whatsapp'));
  el('consultar').href =
    `https://wa.me/${telefono}?text=${encodeURIComponent(p.nombre + ' [' + p.referencia + ']')}`;
  for (const k of ['incluye', 'especificaciones']) {
    el(k + '-titulo').textContent = t[k];
    if (k === 'incluye') el(k).replaceChildren(...p.incluye.map((x) => crear('li', null, x)));
    else
      for (const s of p.especificaciones) {
        const fila = crear('div');
        fila.append(crear('dt', null, s.nombre), crear('dd', null, s.valor));
        el(k).append(fila);
      }
    el(k + '-seccion').hidden = !p[k].length;
  }
  el('preparacion').textContent = `${t.preparacion}: ${p.preparacion}`;
  el('relacionados-titulo').textContent = t.relacionados;
  const rr = relacionados(c, p);
  el('relacionados').replaceChildren(...rr.map((x) => tarjeta(c, x, t)));
  el('relacionados-seccion').hidden = !rr.length;
  window.addEventListener('pagehide', (e) => {
    if (e.persisted) return;
    for (const a of archivos) borrarArchivo(a.id).catch(() => {});
    for (const k of vistaUrls.keys()) limpiarUrl(k);
  });
}
