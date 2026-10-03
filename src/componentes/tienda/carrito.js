import { icono } from './iconos.js';
import { tarjeta } from './tarjeta.js';
import { relacionados, productosPublicos, personalizacionPorCotizar } from '../../servicios/catalogo/modelo.js';
import {
  el,
  crear,
  boton,
  imagen,
  moneda,
  avisar,
  abrir,
  cerrarFuera,
  rutaFicha,
} from './utilidades.js';
import {
  leerCarrito,
  cambiarCantidad,
  quitarLinea,
  guardarCarrito,
} from '../../servicios/catalogo/seleccion.js';
import { resolverLinea, resumenCarrito } from '../../servicios/catalogo/modelo.js';
import {
  descargarArchivo,
  borrarArchivo,
} from '../../servicios/catalogo/archivos-personalizacion.js';
import { enviarPedidoWhatsApp } from '../../servicios/catalogo/pedido.js';
export function montarCarrito(c, t, telefono, pagina = false) {
  const dialog = pagina ? el('carrito-pagina') : el('carrito-dialog');
  if (!pagina) cerrarFuera(dialog);
  const continuar = () => {
    if (pagina) location.href = '/paginas/productos/index.html';
    else dialog.close();
  };
  const cierre = boton('×', continuar, 'tienda-cerrar');
  cierre.setAttribute('aria-label', t.cerrar);
  const head = crear('header', 'tienda-dialog-cabecera');
  const titulo = crear('h2', null, t.carrito);
  titulo.id = 'carrito-titulo';
  head.append(titulo);
  if (!pagina) head.append(cierre);
  const lista = crear('div', 'tienda-carrito-lista'),
    resumen = crear('div', 'tienda-carrito-resumen');
  dialog.append(head, lista, resumen);
  async function quitar(id) {
    try {
      const a = quitarLinea(id);
      for (const f of a?.archivos || []) await borrarArchivo(f.id);
    } catch (e) {
      avisar(e.message);
    }
  }
  function render() {
    const lineas = leerCarrito();
    el('carrito-cuenta').textContent = String(lineas.reduce((n, l) => n + l.cantidad, 0));
    lista.replaceChildren();
    resumen.replaceChildren();
    if (!lineas.length) {
      lista.append(crear('p', null, t.vacio));
      const a = crear('a', 'tienda-boton', t.seguir);
      a.href = '/paginas/productos/index.html';
      lista.append(a);
      return;
    }
    for (const l of lineas) {
      const r = resolverLinea(c, l);
      const row = crear('article', 'tienda-carrito-linea');
      if (r.p) {
        row.append(imagen(r.p.imagenes[0], r.p.nombre, 'tienda-carrito-imagen'));
      }
      const info = crear('div');
      const nombre = crear('a', null, r.p?.nombre || l.producto);
      nombre.href = rutaFicha(l.producto);
      info.append(
        nombre,
        crear('p', 'tienda-meta', r.v ? `${r.v.color} · ${r.v.tamano}` : t.cartNoDisponible),
      );
      for (const [k, v] of Object.entries(l.opciones))
        if (v) info.append(crear('p', 'tienda-meta', `${t[k] || k}: ${v}`));
      for (const a of l.archivos) {
        const b = boton(
          `${t.descargar}: ${a.nombre}`,
          async () => {
            try {
              if (!(await descargarArchivo(a.id))) avisar(t.archivoNoDisponible);
            } catch {
              avisar(t.archivoNoDisponible);
            }
          },
          'tienda-enlace',
        );
        info.append(b);
      }
      if (personalizacionPorCotizar(r.p, l)) info.append(crear('p', 'tienda-info', t.personalRecargo));
      const q = crear('div', 'tienda-cantidad');
      const menos = boton(
        '−',
        () => {
          try {
            if (l.cantidad === 1) quitar(l.id);
            else cambiarCantidad(c, l.id, -1);
          } catch (e) {
            avisar(e.message);
          }
        },
        'tienda-mini',
      );
      menos.setAttribute('aria-label', `${t.cantidad} −`);
      const mas = boton(
        '+',
        () => {
          try {
            cambiarCantidad(c, l.id, 1);
          } catch (e) {
            avisar(e.message);
          }
        },
        'tienda-mini',
      );
      mas.setAttribute('aria-label', `${t.cantidad} +`);
      q.append(menos, crear('span', null, String(l.cantidad)), mas);
      info.append(
        q,
        crear('strong', null, r.precio === null ? t.porCotizar : moneda(r.precio * l.cantidad)),
        boton(t.eliminar, () => quitar(l.id), 'tienda-enlace'),
      );
      if (!r.valida) info.append(crear('p', 'tienda-error', t.cartNoDisponible));
      row.append(info);
      lista.append(row);
    }
    const r = resumenCarrito(c, lineas);
    for (const [a, b] of [
      [t.subtotal, moneda(r.subtotal)],
      [t.envio, t.porConfirmar],
    ]) {
      const fila = crear('p', 'tienda-resumen-fila');
      fila.append(crear('span', null, a), crear('strong', null, b));
      resumen.append(fila);
    }
    if (r.sinPrecio) resumen.append(crear('p', 'tienda-meta', t.sinPrecio));
    resumen.append(crear('p', 'tienda-info', c.comercio.pagosNota));
    if (lineas.some(l => personalizacionPorCotizar(resolverLinea(c, l).p, l)))
      resumen.append(crear('p', 'tienda-info', t.personalPendiente));
    for (const m of c.comercio.metodosPago.filter((m) => m.visible))
      resumen.append(
        crear('p', 'tienda-meta', `${m.nombre}${m.instrucciones ? ': ' + m.instrucciones : ''}`),
      );
    if (lineas.some((l) => l.archivos.length))
      resumen.append(crear('p', 'tienda-info', t.archivosNota));
    const enviar = boton(
      t.enviar,
      () => {
        try {
          enviarPedidoWhatsApp(c, leerCarrito(), t, moneda, telefono);
        } catch (e) {
          avisar(e.message);
        }
      },
      'tienda-boton tienda-whatsapp',
    );
    enviar.prepend(icono('whatsapp'));
    enviar.disabled = r.invalido;
    const completo = crear('a', 'tienda-carrito-completo', t.carritoCompleto);
    completo.href = '/paginas/productos/carrito/index.html';
    if (!pagina) resumen.append(completo);
    resumen.append(
      enviar,
      boton(t.seguir, continuar, 'tienda-enlace'),
      crear('p', 'tienda-meta', t.noReserva),
      boton(
        t.vaciar,
        async () => {
          if (!confirm(t.confirmarVaciar)) return;
          try {
            const viejas = leerCarrito();
            guardarCarrito([]);
            for (const a of viejas.flatMap((l) => l.archivos)) await borrarArchivo(a.id);
          } catch (e) {
            avisar(e.message);
          }
        },
        'tienda-enlace',
      ),
    );
    if (!pagina) {
      const ids = new Set(lineas.map(l => l.producto));
      const candidatos = lineas.flatMap(l => { const p = resolverLinea(c, l).p; return p ? relacionados(c, p, 8) : []; });
      candidatos.push(...productosPublicos(c));
      const vistos = new Set(ids);
      const sugerencias = candidatos.filter(p => { if (vistos.has(p.id)) return false; vistos.add(p.id); return true; }).slice(0, 2);
      if (sugerencias.length) {
        const bloque = crear('section', 'tienda-carrito-sugerencias');
        bloque.append(crear('h3', null, t.tambienInteresa));
        const grid = crear('div', 'tienda-sugerencias-grid');
        grid.append(...sugerencias.map(p => tarjeta(c, p, t)));
        bloque.append(grid); resumen.append(bloque);
      }
    }
  }
  window.addEventListener('roser-carrito', render);
  render();
  el('abrir-carrito').addEventListener('click', () => {
    if (pagina) {
      dialog.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    render();
    abrir(dialog);
  });
  return {
    abrir: () => {
      render();
      abrir(dialog);
    },
  };
}
