import { subidaCampo } from '../../componentes/subida-campo.js';
import {
  c,
  t,
  sucio,
  el,
  node,
  clone,
  uid,
  aviso,
  dirty,
  btn,
  campo,
  select,
  bloque,
  confirmar,
  encabezado,
  imagen,
  descargar,
  aplicar,
} from './editor.js';
export function comercio() {
  encabezado(t?.ui?.texto093 ?? 'Configuración comercial');
  const m = clone(c.comercio),
    f = node('form');
  el('contenido').append(f);
  const campos = {};
  const base = bloque(f, t?.ui?.texto094 ?? 'Catálogo y pedidos');
  for (const [k, label] of Object.entries({
    titulo: t?.ui?.texto095 ?? 'Título del catálogo',
    descripcion: t?.ui?.texto096 ?? 'Presentación',
    envios: t?.ui?.texto097 ?? 'Texto de envíos',
    pagosNota: t?.ui?.texto098 ?? 'Nota sobre pagos',
    medidaTitulo: t?.ui?.texto099 ?? 'Título: diseño a medida',
    medidaDescripcion: t?.ui?.texto100 ?? 'Descripción: diseño a medida',
    medidaBoton: t?.ui?.texto101 ?? 'Botón: diseño a medida',
    medidaImagen: 'Imagen: diseño a medida',
    medidaMensaje: t?.ui?.texto102 ?? 'Mensaje para WhatsApp',
  }))
    campos[k] = campo(
      base,
      label,
      m[k] || (k === 'medidaImagen' ? '/assets/imagenes/marketplace/diseno-medida.webp' : ''),
      k.toLowerCase().includes('descripcion') || k === 'pagosNota' ? 'textarea' : 'text',
    );
  subidaCampo(base, campos.medidaImagen);
  const anticipo = campo(base, t?.ui?.texto103 ?? 'Anticipo habitual (%)', m.anticipo, 'number');
  anticipo.min = '0';
  anticipo.max = '100';
  const metodos = bloque(f, t?.ui?.texto104 ?? 'Métodos manuales de pago');
  metodos.append(
    node(
      'p',
      'Añade únicamente métodos que ya aceptes. Estos campos informan; no cobran ni validan pagos.',
    ),
  );
  const lista = node('div');
  lista.className = 'ancho';
  metodos.append(lista);
  const rows = [];
  function row(p) {
    const r = node('div');
    r.className = 'fila';
    const x = {
      r,
      n: campo(r, t?.ui?.texto105 ?? 'Nombre del método', p.nombre),
      i: campo(
        r,
        t?.ui?.texto106 ?? 'Instrucciones públicas (opcional)',
        p.instrucciones,
        'textarea',
      ),
      v: campo(r, t?.ui?.texto066 ?? 'Mostrar', p.visible, 'checkbox'),
    };
    rows.push(x);
    r.append(
      btn(t?.ui?.texto107 ?? 'Eliminar método', () => {
        rows.splice(rows.indexOf(x), 1);
        r.remove();
      }),
    );
    lista.append(r);
  }
  m.metodosPago.forEach(row);
  metodos.append(
    btn(t?.ui?.texto108 ?? 'Añadir método', () =>
      row({ nombre: '', instrucciones: '', visible: false }),
    ),
  );
  f.append(
    btn(t?.ui?.texto053 ?? 'Aplicar cambios', () => {
      const n = clone(c);
      for (const [k, i] of Object.entries(campos)) m[k] = i.value.trim();
      m.anticipo = Number(anticipo.value);
      m.metodosPago = rows.map((x) => ({
        nombre: x.n.value.trim(),
        instrucciones: x.i.value.trim(),
        visible: x.v.checked,
      }));
      n.comercio = m;
      aplicar(n);
    }),
  );
  f.addEventListener('input', () => {
    el('guardar').disabled = true;
    el('respaldos').disabled = true;
  });
  f.addEventListener('submit', (e) => e.preventDefault());
}
import { render } from './editor.js';
