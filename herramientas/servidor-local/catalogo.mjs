import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export class ErrorCatalogo extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}
export function repositorio(root, validar, opciones = {}) {
  const archivo = path.join(root, opciones.archivo || 'datos/contenido-inicial/catalogo.es.json');
  const dir = path.join(root, '.roser-local', opciones.id || 'catalogo');
  const historial = path.join(dir, 'historial.json'),
    pendiente = path.join(dir, 'pendiente.json');
  const revision = (texto) => crypto.createHash('sha256').update(texto).digest('hex');
  const json = (c) => JSON.stringify(c, null, 2) + '\n';
  let cola = Promise.resolve();
  const exclusivo = (fn) => {
    const tarea = cola.then(fn);
    cola = tarea.catch(() => {});
    return tarea;
  };
  async function atomico(destino, contenido) {
    const temporal = destino + '.' + crypto.randomUUID() + '.tmp';
    try {
      await fs.writeFile(temporal, contenido, { flag: 'wx' });
      await fs.rename(temporal, destino);
    } finally {
      await fs.rm(temporal, { force: true }).catch(() => {});
    }
  }
  async function recuperar() {
    let operacion;
    try {
      operacion = JSON.parse(await fs.readFile(pendiente, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') return;
      throw e;
    }
    validar(operacion.catalogo);
    if (!Array.isArray(operacion.historial) || operacion.historial.length > 5)
      throw Error('El historial pendiente no es válido.');
    await atomico(archivo, json(operacion.catalogo));
    await atomico(historial, json(operacion.historial));
    await fs.rm(pendiente);
  }
  async function leer() {
    const texto = await fs.readFile(archivo, 'utf8');
    return { catalogo: validar(JSON.parse(texto)), revision: revision(texto) };
  }
  async function versiones() {
    try {
      const v = JSON.parse(await fs.readFile(historial, 'utf8'));
      if (!Array.isArray(v) || v.length > 5) throw Error('El historial no es válido.');
      return v;
    } catch (e) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }
  function describir(a, b) {
    if (opciones.id && opciones.id !== 'catalogo') return 'Contenido actualizado';
    const partes = [];
    for (const [k, singular, plural, femenino] of [
      ['productos', 'producto', 'productos', false],
      ['grupos', 'grupo', 'grupos', false],
      ['subcategorias', 'subcategoría', 'subcategorías', true],
      ['destacados', 'destacado', 'destacados', false],
    ]) {
      const antes = new Map(a[k].map((x) => [x.id, x])),
        despues = new Map(b[k].map((x) => [x.id, x]));
      const tipos = [
        [b[k].filter((x) => !antes.has(x.id)), 'añadid'],
        [a[k].filter((x) => !despues.has(x.id)), 'eliminad'],
        [
          b[k].filter(
            (x) => antes.has(x.id) && JSON.stringify(x) !== JSON.stringify(antes.get(x.id)),
          ),
          'modificad',
        ],
      ];
      for (const [items, accion] of tipos) {
        if (!items.length) continue;
        const detalle =
          k === 'productos'
            ? ' (' +
              items
                .slice(0, 3)
                .map((p) => p.referencia)
                .join(', ') +
              (items.length > 3 ? ', …' : '') +
              ')'
            : '';
        partes.push(
          `${items.length} ${items.length === 1 ? singular : plural} ${accion}${femenino ? 'a' : 'o'}${items.length === 1 ? '' : 's'}${detalle}`,
        );
      }
    }
    if (JSON.stringify(a.comercio) !== JSON.stringify(b.comercio))
      partes.push('Configuración comercial modificada');
    return partes.join(' · ') || 'Catálogo actualizado';
  }

  return {
    iniciar: () =>
      exclusivo(async () => {
        await fs.mkdir(dir, { recursive: true });
        const ignore = path.join(root, '.gitignore');
        let texto = '';
        try {
          texto = await fs.readFile(ignore, 'utf8');
        } catch (e) {
          if (e.code !== 'ENOENT') throw e;
        }
        if (!texto.split(/\r?\n/).some((s) => s.trim() === '.roser-local/'))
          await fs.appendFile(
            ignore,
            (texto && !texto.endsWith('\n') ? '\n' : '') +
              '\n# Respaldos privados del editor local\n.roser-local/\n',
          );
        await recuperar();
        await leer();
      }),
    cargar: () =>
      exclusivo(async () => {
        await recuperar();
        return leer();
      }),
    listar: () =>
      exclusivo(async () => {
        await recuperar();
        return (await versiones()).map(({ catalogo, ...meta }) => ({
          ...meta,
          productos: catalogo.productos?.length,
        }));
      }),
    revisar: (id) =>
      exclusivo(async () => {
        await recuperar();
        const v = (await versiones()).find((x) => x.id === id);
        if (!v) throw new ErrorCatalogo('Ese respaldo ya no está disponible.', 404);
        return { ...v, catalogo: validar(v.catalogo) };
      }),
    guardar: (nuevo, esperada) =>
      exclusivo(async () => {
        await recuperar();
        validar(nuevo);
        const actual = await leer();
        if (esperada !== actual.revision)
          throw new ErrorCatalogo(
            'El catálogo cambió en otra ventana o en VS Code. Recarga el administrador antes de guardar.',
            409,
          );
        if (JSON.stringify(actual.catalogo) === JSON.stringify(nuevo))
          return { ...actual, sinCambios: true };
        const previos = await versiones();
        const copia = {
          id: crypto.randomUUID(),
          fecha: new Date().toISOString(),
          resumen: 'Antes de: ' + describir(actual.catalogo, nuevo),
          catalogo: actual.catalogo,
        };
        const operacion = { catalogo: nuevo, historial: [copia, ...previos].slice(0, 5) };
        await atomico(pendiente, json(operacion));
        await recuperar();
        return { ...(await leer()), sinCambios: false };
      }),
  };
}
