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
export function destacados() {
  encabezado(t?.ui?.texto081 ?? 'Espacios destacados', t?.ui?.texto082 ?? 'Añadir espacio', () =>
    editarDestacado(
      {
        id: uid('banner'),
        titulo: t?.ui?.texto083 ?? 'Nuevo destacado',
        descripcion: t?.ui?.texto011 ?? 'Descripción por completar.',
        boton: t?.ui?.texto084 ?? 'Explorar',
        imagen: '',
        tipoDestino: 'grupo',
        destino: c.grupos[0].id,
        visible: false,
      },
      true,
    ),
  );
  c.destacados.forEach((d, i) => {
    const f = node('article');
    f.className = 'fila';
    f.append(
      node('h3', d.titulo + (d.visible ? '' : ' · Oculto')),
      btn(t?.ui?.texto063 ?? 'Editar', () => editarDestacado(d)),
      btn('↑', () => mover(i, -1)),
      btn('↓', () => mover(i, 1)),
      btn(t?.ui?.texto067 ?? 'Eliminar', () => {
        if (!confirmar()) return;
        const n = clone(c);
        n.destacados.splice(i, 1);
        aplicar(n);
      }),
    );
    el('contenido').append(f);
  });
  function mover(i, delta) {
    const j = i + delta;
    if (j < 0 || j >= c.destacados.length) return;
    const n = clone(c);
    [n.destacados[i], n.destacados[j]] = [n.destacados[j], n.destacados[i]];
    aplicar(n);
  }
}
export function editarDestacado(d, nuevo = false) {
  el('guardar').disabled = true;
  el('respaldos').disabled = true;
  el('contenido').replaceChildren(node('h2', t?.ui?.texto085 ?? 'Editar espacio destacado'));
  const area = bloque(el('contenido'), t?.ui?.texto086 ?? 'Contenido');
  const titulo = campo(area, t?.ui?.texto087 ?? 'Título', d.titulo),
    desc = campo(area, t?.ui?.texto021 ?? 'Descripción', d.descripcion, 'textarea'),
    boton = campo(area, t?.ui?.texto088 ?? 'Texto del botón', d.boton),
    im = campo(area, t?.ui?.texto089 ?? 'Imagen WebP', d.imagen),
    v = campo(area, t?.ui?.texto061 ?? 'Visible', d.visible, 'checkbox'),
    tipo = select(area, t?.ui?.texto090 ?? 'Destino', d.tipoDestino, [
      { id: 'grupo', nombre: t?.ui?.texto023 ?? 'Grupo' },
      { id: 'producto', nombre: t?.ui?.texto091 ?? 'Producto' },
    ]),
    dest = select(
      area,
      t?.ui?.texto092 ?? 'Abrir',
      d.destino,
      d.tipoDestino === 'grupo' ? c.grupos : c.productos,
    );
  subidaCampo(area, im);
  tipo.addEventListener('change', () =>
    dest.replaceChildren(
      ...(tipo.value === 'grupo' ? c.grupos : c.productos).map((x) => new Option(x.nombre, x.id)),
    ),
  );
  el('contenido').append(
    btn(t?.ui?.texto053 ?? 'Aplicar cambios', () => {
      const n = clone(c),
        item = {
          ...d,
          titulo: titulo.value.trim(),
          descripcion: desc.value.trim(),
          boton: boton.value.trim(),
          imagen: im.value.trim(),
          visible: v.checked,
          tipoDestino: tipo.value,
          destino: dest.value,
        };
      if (nuevo) n.destacados.push(item);
      else n.destacados[n.destacados.findIndex((x) => x.id === d.id)] = item;
      aplicar(n);
    }),
    btn(t?.ui?.texto079 ?? 'Volver', render),
  );
}
import { render } from './editor.js';
