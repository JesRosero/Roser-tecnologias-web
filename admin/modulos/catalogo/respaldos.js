import { listarRespaldos, cargarRespaldo } from '/src/servicios/configuracion-catalogo.js';
import { c, t, el, node, btn, aviso, aplicar } from './editor.js';
export async function abrirRespaldos() {
  const dialogo = el('dialogo-respaldos'),
    lista = el('lista-respaldos'),
    vista = el('vista-respaldo');
  vista.hidden = true;
  vista.replaceChildren();
  lista.replaceChildren();
  el('nota-respaldos').textContent = t.respaldosNota;
  const entradas = await listarRespaldos();
  if (!entradas.length) lista.append(node('p', t.sinRespaldos));
  for (const r of entradas) {
    const fila = node('article');
    fila.className = 'fila';
    const fecha = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'America/Bogota',
    }).format(new Date(r.fecha));
    fila.append(
      node('h3', fecha),
      node('p', r.resumen),
      node('p', `${r.productos} ${t.tabs.productos.toLowerCase()}`),
      btn(t.revisarVersion, async () => {
        const copia = await cargarRespaldo(r.id);
        vista.replaceChildren(node('h3', t.contenidoVersion));
        const tabla = node('table'),
          cabeza = node('tr');
        for (const titulo of [t.ui.texto017, t.ui.texto016, t.ui.texto030])
          cabeza.append(node('th', titulo));
        const thead = node('thead');
        thead.append(cabeza);
        const tbody = node('tbody');
        for (const p of copia.catalogo.productos) {
          const tr = node('tr');
          const precio =
            p.precio.valor === null
              ? t.ui.texto029
              : new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(p.precio.valor);
          tr.append(node('td', p.referencia), node('td', p.nombre), node('td', precio));
          tbody.append(tr);
        }
        tabla.append(thead, tbody);
        vista.append(
          node(
            'p',
            `${copia.catalogo.grupos.length} ${t.gruposResumen} · ${copia.catalogo.destacados.length} ${t.destacadosResumen}`,
          ),
          tabla,
          btn(t.usarVersion, () => {
            if (
              !confirm(
                t.confirmarVersion
                  .replace('{actuales}', String(c.productos.length))
                  .replace('{anteriores}', String(copia.catalogo.productos.length)),
              )
            )
              return;
            dialogo.close();
            aplicar(structuredClone(copia.catalogo));
            aviso(t.versionPreparada);
          }),
        );
        vista.hidden = false;
        vista.scrollIntoView({ block: 'nearest' });
      }),
    );
    lista.append(fila);
  }
  if (!dialogo.open) dialogo.showModal();
}
export function prepararRespaldos() {
  el('cerrar-respaldos').addEventListener('click', () => el('dialogo-respaldos').close());
}
