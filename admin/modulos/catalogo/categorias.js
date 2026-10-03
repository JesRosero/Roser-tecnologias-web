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
export function categorias() {
  encabezado(t?.ui?.texto068 ?? 'Grupos y subcategorías', t?.ui?.texto069 ?? 'Añadir grupo', () =>
    editarGrupo(
      { id: uid('grupo'), nombre: t?.ui?.texto070 ?? 'Nuevo grupo', imagen: '', visible: true },
      true,
    ),
  );
  el('contenido').append(
    node(
      'p',
      t?.ui?.texto071 ??
        'Los grupos sin productos visibles se ocultan automáticamente. Para mover productos, edita su ubicación antes de eliminar una categoría.',
    ),
  );
  for (const g of c.grupos) {
    const f = node('article');
    f.className = 'fila';
    f.append(
      node('h3', g.nombre + (g.visible ? '' : ' · Oculto')),
      btn('↑', () => moverGrupo(g.id, -1)),
      btn('↓', () => moverGrupo(g.id, 1)),
      btn(t?.ui?.texto072 ?? 'Editar grupo', () => editarGrupo(g)),
      btn(t?.ui?.texto073 ?? 'Añadir subcategoría', () =>
        editarSub(
          {
            id: uid('sub'),
            nombre: t?.ui?.texto074 ?? 'Nueva subcategoría',
            grupo: g.id,
            visible: true,
          },
          true,
        ),
      ),
      btn(t?.ui?.texto075 ?? 'Eliminar grupo', () => {
        if (c.productos.some((p) => p.grupo === g.id))
          throw Error('Este grupo tiene productos; muévelos o elimínalos primero.');
        if (c.grupos.length === 1) throw Error(t?.ui?.texto076 ?? 'Conserva al menos un grupo.');
        if (!confirmar()) return;
        const n = clone(c);
        n.grupos = n.grupos.filter((x) => x.id !== g.id);
        n.subcategorias = n.subcategorias.filter((x) => x.grupo !== g.id);
        n.destacados = n.destacados.filter(
          (x) => !(x.tipoDestino === 'grupo' && x.destino === g.id),
        );
        aplicar(n);
      }),
    );
    for (const s of c.subcategorias.filter((s) => s.grupo === g.id)) {
      const r = node('p');
      r.append(
        node('span', s.nombre + (s.visible ? '' : ' · Oculta') + ' '),
        btn(t?.ui?.texto063 ?? 'Editar', () => editarSub(s)),
        btn(t?.ui?.texto067 ?? 'Eliminar', () => {
          if (c.productos.some((p) => p.subcategoria === s.id))
            throw Error(t?.ui?.texto077 ?? 'Esta subcategoría tiene productos.');
          if (!confirmar()) return;
          const n = clone(c);
          n.subcategorias = n.subcategorias.filter((x) => x.id !== s.id);
          aplicar(n);
        }),
      );
      f.append(r);
    }
    el('contenido').append(f);
  }
}
export function moverGrupo(id, delta) {
  const n = clone(c),
    i = n.grupos.findIndex((g) => g.id === id),
    j = i + delta;
  if (j < 0 || j >= n.grupos.length) return;
  [n.grupos[i], n.grupos[j]] = [n.grupos[j], n.grupos[i]];
  aplicar(n);
}
export function editarGrupo(g, nuevo = false) {
  el('guardar').disabled = true;
  el('respaldos').disabled = true;
  el('contenido').replaceChildren(node('h2', t?.ui?.texto072 ?? 'Editar grupo'));
  const n = campo(el('contenido'), t?.ui?.texto016 ?? 'Nombre', g.nombre),
    im = campo(el('contenido'), t?.ui?.texto078 ?? 'Ruta de imagen WebP', g.imagen),
    v = campo(el('contenido'), t?.ui?.texto061 ?? 'Visible', g.visible, 'checkbox');
  subidaCampo(el('contenido'), im);
  el('contenido').append(
    btn(t?.ui?.texto053 ?? 'Aplicar cambios', () => {
      const next = clone(c),
        item = { ...g, nombre: n.value.trim(), imagen: im.value.trim(), visible: v.checked };
      if (nuevo) next.grupos.push(item);
      else next.grupos[next.grupos.findIndex((x) => x.id === g.id)] = item;
      aplicar(next);
    }),
    btn(t?.ui?.texto079 ?? 'Volver', render),
  );
}
export function editarSub(s, nuevo = false) {
  el('guardar').disabled = true;
  el('respaldos').disabled = true;
  el('contenido').replaceChildren(node('h2', t?.ui?.texto080 ?? 'Editar subcategoría'));
  const n = campo(el('contenido'), t?.ui?.texto016 ?? 'Nombre', s.nombre),
    v = campo(el('contenido'), t?.ui?.texto061 ?? 'Visible', s.visible, 'checkbox');
  el('contenido').append(
    btn(t?.ui?.texto053 ?? 'Aplicar cambios', () => {
      const next = clone(c),
        item = { ...s, nombre: n.value.trim(), visible: v.checked };
      if (nuevo) next.subcategorias.push(item);
      else next.subcategorias[next.subcategorias.findIndex((x) => x.id === s.id)] = item;
      aplicar(next);
    }),
    btn(t?.ui?.texto079 ?? 'Volver', render),
  );
}
import { render } from './editor.js';
