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
import { ESTADOS, normalizar } from '/src/servicios/catalogo/modelo.js';
import { galeria } from './imagenes.js';
export function removeProduct(id) {
  if (!confirmar()) return;
  const n = clone(c);
  n.productos = n.productos.filter((p) => p.id !== id);
  n.destacados = n.destacados.filter((d) => !(d.tipoDestino === 'producto' && d.destino === id));
  aplicar(n);
}
export function productoNuevo() {
  const s = c.subcategorias[0];
  if (!s) throw Error(t?.ui?.texto009 ?? 'Crea primero una subcategoría.');
  if (!s) throw Error(t?.ui?.texto009 ?? 'Crea primero una subcategoría.');
  return {
    id: uid('producto'),
    nombre: t?.ui?.texto010 ?? 'Nuevo producto',
    referencia: uid('REF').toUpperCase(),
    grupo: s.grupo,
    subcategoria: s.id,
    descripcion: t?.ui?.texto011 ?? 'Descripción por completar.',
    precio: { modo: 'consultar', valor: null },
    imagenes: [],
    variantes: [
      {
        id: uid('var'),
        color: t?.ui?.texto012 ?? 'Por confirmar',
        tamano: t?.ui?.texto013 ?? 'Único',
        precio: null,
        existencias: null,
        disponibilidad: 'consultar',
      },
    ],
    personalizacion: {
      activa: false,
      texto: false,
      imagen: false,
      qr: false,
      observaciones: false,
    },
    especificaciones: [],
    incluye: [],
    preparacion: t?.ui?.texto012 ?? 'Por confirmar',
    notaInterna: '',
    visible: false,
    destacado: false,
  };
}
export function editarProducto(original, nuevo = false) {
  el('guardar').disabled = true;
  el('respaldos').disabled = true;
  const p = clone(original);
  const destino = el('contenido');
  destino.replaceChildren();
  destino.append(
    node(
      'h2',
      nuevo ? (t?.ui?.texto010 ?? 'Nuevo producto') : (t?.ui?.texto014 ?? 'Editar producto'),
    ),
  );
  const form = node('form');
  destino.append(form);
  const general = bloque(form, t?.ui?.texto015 ?? 'Información general');
  const nombre = campo(general, t?.ui?.texto016 ?? 'Nombre', p.nombre),
    ref = campo(general, t?.ui?.texto017 ?? 'Referencia única', p.referencia);
  const id = campo(general, t?.ui?.texto018 ?? 'Identificador estable', p.id);
  id.readOnly = true;
  const visible = campo(
      general,
      t?.ui?.texto019 ?? 'Mostrar en el catálogo',
      p.visible,
      'checkbox',
    ),
    destacado = campo(
      general,
      t?.ui?.texto020 ?? 'Priorizar entre destacados',
      p.destacado,
      'checkbox',
    );
  const descripcion = campo(general, t?.ui?.texto021 ?? 'Descripción', p.descripcion, 'textarea');
  const categoria = bloque(form, t?.ui?.texto022 ?? 'Ubicación');
  const g = select(categoria, t?.ui?.texto023 ?? 'Grupo', p.grupo, c.grupos),
    s = select(
      categoria,
      t?.ui?.texto024 ?? 'Subcategoría',
      p.subcategoria,
      c.subcategorias.filter((x) => x.grupo === p.grupo),
    );
  g.addEventListener('change', () => {
    s.replaceChildren(
      ...c.subcategorias.filter((x) => x.grupo === g.value).map((x) => new Option(x.nombre, x.id)),
    );
  });
  const precio = bloque(form, t?.ui?.texto025 ?? 'Precio y preparación');
  const modo = select(precio, t?.ui?.texto026 ?? 'Tipo de precio', p.precio.modo, [
      { id: 'fijo', nombre: t?.ui?.texto027 ?? 'Precio fijo' },
      { id: 'desde', nombre: t?.ui?.texto028 ?? 'Desde (base para variantes)' },
      { id: 'consultar', nombre: t?.ui?.texto029 ?? 'Solicitar cotización' },
    ]),
    valor = campo(
      precio,
      t?.ui?.texto030 ?? 'Precio base en COP (sin puntos)',
      p.precio.valor,
      'number',
    );
  valor.min = '0';
  valor.step = '1';
  const preparar = campo(precio, t?.ui?.texto031 ?? 'Tiempo de preparación', p.preparacion);
  const nota = campo(
    precio,
    t?.ui?.texto032 ?? 'Nota interna (no se muestra al comprador)',
    p.notaInterna,
    'textarea',
  );
  const vr = bloque(form, t?.ui?.texto033 ?? 'Variantes: colores, tamaños, precios y existencias');
  const va = node('div');
  va.className = 'ancho';
  vr.append(va);
  const variantes = [];
  function variante(v) {
    const fila = node('div');
    fila.className = 'fila';
    const r = node('div');
    r.className = 'rejilla';
    fila.append(r);
    const fields = {
      v,
      color: campo(r, t?.ui?.texto034 ?? 'Color', v.color),
      tamano: campo(r, t?.ui?.texto035 ?? 'Tamaño', v.tamano),
      precio: campo(
        r,
        t?.ui?.texto036 ?? 'Precio especial COP (vacío: usar base)',
        v.precio,
        'number',
      ),
      stock: campo(
        r,
        t?.ui?.texto037 ?? 'Existencias (vacío: por confirmar)',
        v.existencias,
        'number',
      ),
      estado: select(
        r,
        t?.ui?.texto038 ?? 'Disponibilidad',
        v.disponibilidad,
        ESTADOS.map((id) => ({ id, nombre: id })),
      ),
      fila,
    };
    for (const i of [fields.precio, fields.stock]) {
      i.min = '0';
      i.step = '1';
    }
    variantes.push(fields);
    fila.append(
      btn(t?.ui?.texto039 ?? 'Eliminar variante', () => {
        if (variantes.length === 1)
          throw Error(t?.ui?.texto040 ?? 'Conserva al menos una variante.');
        variantes.splice(variantes.indexOf(fields), 1);
        fila.remove();
      }),
    );
    va.append(fila);
  }
  p.variantes.forEach(variante);
  vr.append(
    btn(t?.ui?.texto041 ?? 'Añadir variante', () =>
      variante({
        id: uid('var'),
        color: t?.ui?.texto012 ?? 'Por confirmar',
        tamano: t?.ui?.texto013 ?? 'Único',
        precio: null,
        existencias: null,
        disponibilidad: 'consultar',
      }),
    ),
  );
  vr.append(
    node(
      'small',
      t?.ui?.texto042 ??
        'El catálogo local no reserva ni descuenta inventario al enviar una consulta. Confirma la disponibilidad antes del pago.',
    ),
  );
  const fotos = bloque(form, t?.ui?.texto043 ?? 'Galería');
  galeria(fotos, p.imagenes);
  const personal = bloque(form, t?.ui?.texto044 ?? 'Personalización permitida');
  const personalCampos = {};
  for (const [k, label] of Object.entries({
    activa: t?.ui?.texto045 ?? 'Activar personalización',
    texto: t?.ui?.texto046 ?? 'Texto o nombre',
    imagen: t?.ui?.texto047 ?? 'Imagen o logotipo',
    qr: t?.ui?.texto048 ?? 'Imagen del código QR',
    observaciones: t?.ui?.texto049 ?? 'Instrucciones adicionales',
  }))
    personalCampos[k] = campo(personal, label, p.personalizacion[k], 'checkbox');
  const modalidad = select(personal, t.ui.personalModalidad, p.personalizacion.modalidad || 'incluida', [
    { id: 'incluida', nombre: t.ui.personalIncluida },
    { id: 'cotizar', nombre: t.ui.personalCotizar },
  ]);
  personal.append(node('small', t.ui.personalAyuda));
  const detalles = bloque(form, t?.ui?.texto050 ?? 'Ficha técnica y contenido');
  const incluye = campo(
    detalles,
    t?.ui?.texto051 ?? 'Qué incluye (una entrada por línea)',
    p.incluye.join('\n'),
    'textarea',
  );
  const espec = campo(
    detalles,
    t?.ui?.texto052 ?? 'Especificaciones (una por línea: Nombre | Valor)',
    p.especificaciones.map((x) => x.nombre + ' | ' + x.valor).join('\n'),
    'textarea',
  );
  form.append(
    btn(t?.ui?.texto053 ?? 'Aplicar cambios', () => {
      const n = clone(c);
      p.nombre = nombre.value.trim();
      p.referencia = ref.value.trim();
      p.visible = visible.checked;
      p.destacado = destacado.checked;
      p.descripcion = descripcion.value.trim();
      p.grupo = g.value;
      p.subcategoria = s.value;
      p.precio = {
        modo: modo.value,
        valor: modo.value === 'consultar' ? null : Number(valor.value),
      };
      if (modo.value !== 'consultar' && !valor.value.trim())
        throw Error(t?.ui?.texto054 ?? 'Indica el precio base.');
      p.preparacion = preparar.value.trim();
      p.notaInterna = nota.value;
      p.variantes = variantes.map((x) => ({
        id: x.v.id,
        color: x.color.value.trim(),
        tamano: x.tamano.value.trim(),
        precio: x.precio.value.trim() ? Number(x.precio.value) : null,
        existencias: x.stock.value.trim() ? Number(x.stock.value) : null,
        disponibilidad: x.estado.value,
      }));
      p.personalizacion = Object.fromEntries(
        Object.entries(personalCampos).map(([k, i]) => [k, i.checked]),
      );
      p.personalizacion.modalidad = modalidad.value;
      p.incluye = incluye.value
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      p.especificaciones = espec.value
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => {
          const at = x.indexOf('|');
          if (at < 1) throw Error(t?.ui?.texto055 ?? 'Especificaciones: usa Nombre | Valor.');
          return { nombre: x.slice(0, at).trim(), valor: x.slice(at + 1).trim() };
        });
      if (nuevo) n.productos.push(p);
      else n.productos[n.productos.findIndex((x) => x.id === p.id)] = p;
      aplicar(n);
    }),
    btn(t?.ui?.texto056 ?? 'Volver sin aplicar', () => render()),
  );
  form.addEventListener('input', () => {
    dirty();
    aviso(t?.ui?.texto057 ?? 'Edición abierta: pulsa Aplicar cambios antes de guardar.');
  });
  form.addEventListener('submit', (e) => e.preventDefault());
}
export function productos() {
  encabezado(t?.ui?.texto058 ?? 'Productos', t?.ui?.texto059 ?? 'Añadir producto', () =>
    editarProducto(productoNuevo(), true),
  );
  const bus = campo(el('contenido'), t?.ui?.texto060 ?? 'Buscar por nombre o referencia');
  const lista = node('div');
  lista.className = 'lista-productos';
  el('contenido').append(lista);
  function listar() {
    lista.replaceChildren();
    for (const p of c.productos.filter((p) =>
      normalizar(p.nombre + ' ' + p.referencia).includes(normalizar(bus.value)),
    )) {
      const f = node('article');
      f.className = 'fila';
      const info = node('div');
      info.append(
        node('h3', p.nombre),
        node(
          'p',
          p.referencia +
            ' · ' +
            (p.visible ? (t?.ui?.texto061 ?? 'Visible') : (t?.ui?.texto062 ?? 'Oculto')) +
            ' · ' +
            c.grupos.find((g) => g.id === p.grupo).nombre,
        ),
      );
      const a = node('div');
      a.className = 'acciones';
      a.append(
        btn(t?.ui?.texto063 ?? 'Editar', () => editarProducto(p)),
        btn(t?.ui?.texto064 ?? 'Duplicar', () => {
          const n = clone(p);
          n.id = uid('producto');
          n.nombre += ' (copia)';
          n.referencia = uid('REF').toUpperCase();
          n.visible = false;
          editarProducto(n, true);
        }),
        btn(p.visible ? (t?.ui?.texto065 ?? 'Ocultar') : (t?.ui?.texto066 ?? 'Mostrar'), () => {
          const n = clone(c);
          n.productos.find((x) => x.id === p.id).visible = !p.visible;
          aplicar(n);
        }),
        btn(t?.ui?.texto067 ?? 'Eliminar', () => removeProduct(p.id)),
      );
      f.append(imagen(p.imagenes[0] || ''), info, a);
      lista.append(f);
    }
  }
  bus.addEventListener('input', listar);
  listar();
}
import { render } from './editor.js';
