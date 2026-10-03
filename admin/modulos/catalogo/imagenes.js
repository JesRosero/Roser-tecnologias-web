import { subirImagen } from '../../componentes/api.js';
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
import { normalizar } from '/src/servicios/catalogo/modelo.js';
export function galeria(destino, items) {
  const area = node('div');
  area.className = 'ancho';
  destino.append(area);
  function render() {
    area.replaceChildren();
    items.forEach((ruta, index) => {
      const f = node('div');
      f.className = 'fila';
      const input = campo(f, t?.ui?.texto002 ?? 'Ruta de la imagen WebP', ruta);
      input.addEventListener('input', () => (items[index] = input.value.trim()));
      f.append(
        imagen(ruta),
        btn('↑', () => {
          if (index) {
            [items[index - 1], items[index]] = [items[index], items[index - 1]];
            render();
          }
        }),
        btn('↓', () => {
          if (index < items.length - 1) {
            [items[index + 1], items[index]] = [items[index], items[index + 1]];
            render();
          }
        }),
        btn(t?.ui?.texto003 ?? 'Eliminar imagen', () => {
          items.splice(index, 1);
          render();
        }),
      );
      area.append(f);
    });
    area.append(
      btn(t?.ui?.texto004 ?? 'Añadir ruta de imagen', () => {
        items.push('/assets/imagenes/productos/');
        render();
      }),
    );
    const archivo = campo(area, 'Seleccionar imagen (se guarda en el proyecto)', '', 'file');
    archivo.accept = 'image/png,image/jpeg,image/webp';
    archivo.addEventListener('change', async () => {
      const main = document.querySelector('main');
      main.inert = true;
      try {
        const f = archivo.files[0];
        if (!f) return;
        items.push(await subirImagen(f));
        render();
        aviso('Imagen añadida. Aplica y guarda los cambios.');
      } catch (e) {
        aviso(e.message, true);
      } finally {
        main.inert = false;
      }
    });
    area.append(
      node(
        'small',
        'La primera imagen será la principal. Aplica y guarda los cambios para actualizar el producto.',
      ),
    );
  }
  render();
}
