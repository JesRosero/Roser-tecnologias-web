import http from 'node:http';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repositorio, ErrorCatalogo } from './catalogo.mjs';
export async function iniciarServidor(root, puerto = 8088) {
  if (!Number.isInteger(puerto) || puerto < 1024 || puerto > 65535)
    throw Error('Puerto no válido.');
  const registro = JSON.parse(
    await fs.readFile(path.join(root, 'src/configuracion/recursos-admin.json'), 'utf8'),
  );
  const repos = new Map();
  for (const r of registro) {
    const modulo =
      r.id === 'catalogo'
        ? 'src/servicios/catalogo/modelo.js'
        : `src/servicios/validadores/${r.modulo}.js`;
    const codigo = await fs.readFile(path.join(root, modulo), 'utf8');
    const m = await import('data:text/javascript;base64,' + Buffer.from(codigo).toString('base64'));
    repos.set(
      r.id,
      repositorio(
        root,
        (c) => {
          try {
            return m[r.validar](c, ...r.args);
          } catch (e) {
            throw new ErrorCatalogo(
              e instanceof TypeError ? 'Revisa los campos de esta sección.' : e.message,
              400,
            );
          }
        },
        r,
      ),
    );
  }
  const datos = repos.get('catalogo');
  let preparado = false;
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
  };
  function responder(res, status, obj) {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(obj));
  }
  async function cuerpo(req) {
    if (!req.headers['content-type']?.startsWith('application/json'))
      throw new ErrorCatalogo('Se requiere contenido JSON.', 415);
    let bytes = 0;
    const partes = [];
    for await (const p of req) {
      bytes += p.length;
      if (bytes > 2 * 1024 * 1024) throw new ErrorCatalogo('El catálogo supera los 2 MB.', 413);
      partes.push(p);
    }
    try {
      return JSON.parse(Buffer.concat(partes).toString('utf8'));
    } catch {
      throw new ErrorCatalogo('Contenido JSON no válido.');
    }
  }
  const server = http.createServer(async (req, res) => {
    try {
      if (!preparado)
        throw new ErrorCatalogo('El servidor local está iniciando. Recarga en un momento.', 503);
      const hosts = [`127.0.0.1:${puerto}`, `localhost:${puerto}`];
      if (!hosts.includes(req.headers.host))
        throw new ErrorCatalogo('Dirección local no permitida.', 403);
      const url = new URL(req.url, `http://${req.headers.host}`),
        ruta = decodeURIComponent(url.pathname);
      if (ruta.startsWith('/__roser/')) {
        if (
          req.headers['x-roser-local'] !== '1' ||
          (req.headers.origin && !hosts.map((h) => 'http://' + h).includes(req.headers.origin))
        )
          throw new ErrorCatalogo('Acceso permitido únicamente al editor local.', 403);
        if (req.method === 'GET' && ruta === '/__roser/recursos')
          return responder(res, 200, registro);
        const doc = ruta.match(
          /^\/__roser\/documentos\/([a-z0-9-]+)(?:\/respaldos(?:\/([a-f0-9-]{36}))?)?$/,
        );
        if (doc) {
          const repo = repos.get(doc[1]);
          if (!repo) throw new ErrorCatalogo('Sección desconocida.', 404);
          if (req.method === 'GET') {
            if (ruta.includes('/respaldos'))
              return responder(res, 200, doc[2] ? await repo.revisar(doc[2]) : await repo.listar());
            const r = await repo.cargar();
            return responder(res, 200, { contenido: r.catalogo, revision: r.revision });
          }
          if (req.method === 'PUT' && !ruta.includes('/respaldos')) {
            if (!hosts.map((h) => 'http://' + h).includes(req.headers.origin))
              throw new ErrorCatalogo('Origen local requerido.', 403);
            const c = await cuerpo(req);
            const r = await repo.guardar(c.contenido, c.revision);
            return responder(res, 200, {
              contenido: r.catalogo,
              revision: r.revision,
              sinCambios: r.sinCambios,
            });
          }
        }
        if (req.method === 'POST' && ruta === '/__roser/imagenes') {
          if (!hosts.map((h) => 'http://' + h).includes(req.headers.origin))
            throw new ErrorCatalogo('Origen local requerido.', 403);
          if (req.headers['content-type'] !== 'image/webp')
            throw new ErrorCatalogo('Se requiere una imagen WebP.', 415);
          const partes = [];
          let n = 0;
          for await (const b of req) {
            n += b.length;
            if (n > 15 * 1024 * 1024) throw new ErrorCatalogo('La imagen supera 15 MB.', 413);
            partes.push(b);
          }
          const b = Buffer.concat(partes);
          if (
            b.length < 12 ||
            b.toString('ascii', 0, 4) !== 'RIFF' ||
            b.toString('ascii', 8, 12) !== 'WEBP'
          )
            throw new ErrorCatalogo('Imagen WebP no válida.');
          const dir = path.join(root, 'assets/imagenes/admin');
          await fs.mkdir(dir, { recursive: true });
          const real = await fs.realpath(dir);
          if (
            !real.startsWith(root + path.sep) ||
            path
              .relative(root, real)
              .split(path.sep)
              .some((x) => x.startsWith('.'))
          )
            throw new ErrorCatalogo('Carpeta no permitida.', 403);
          const crypto = await import('node:crypto');
          const nombre = 'imagen-' + crypto.createHash('sha256').update(b).digest('hex') + '.webp';
          await fs.writeFile(path.join(real, nombre), b, { flag: 'wx' }).catch((e) => {
            if (e.code !== 'EEXIST') throw e;
          });
          return responder(res, 200, { ruta: '/assets/imagenes/admin/' + nombre });
        }
        if (req.method === 'GET' && ruta === '/__roser/catalogo')
          return responder(res, 200, await datos.cargar());
        if (req.method === 'PUT' && ruta === '/__roser/catalogo') {
          if (!hosts.map((h) => 'http://' + h).includes(req.headers.origin))
            throw new ErrorCatalogo('Origen local requerido.', 403);
          const c = await cuerpo(req);
          return responder(res, 200, await datos.guardar(c.catalogo, c.revision));
        }
        if (req.method === 'GET' && ruta === '/__roser/respaldos')
          return responder(res, 200, await datos.listar());
        const match = ruta.match(/^\/__roser\/respaldos\/([a-f0-9-]{36})$/);
        if (req.method === 'GET' && match)
          return responder(res, 200, await datos.revisar(match[1]));
        throw new ErrorCatalogo('Operación local no disponible.', 404);
      }
      if (!['GET', 'HEAD'].includes(req.method))
        throw new ErrorCatalogo('Método no disponible.', 405);
      const segmentos = ruta.split('/');
      if (
        segmentos.some(
          (s) =>
            s.startsWith('.') || s === 'node_modules' || s === 'herramientas' || s.includes('\\'),
        )
      )
        throw new ErrorCatalogo('Ruta privada.', 403);
      let destino = path.resolve(root, '.' + ruta);
      if (destino !== root && !destino.startsWith(root + path.sep))
        throw new ErrorCatalogo('Ruta no permitida.', 403);
      try {
        if ((await fs.stat(destino)).isDirectory()) destino = path.join(destino, 'index.html');
        const real = await fs.realpath(destino);
        if (
          path
            .relative(root, real)
            .split(path.sep)
            .some((s) => s.startsWith('.') || s === 'node_modules' || s === 'herramientas') ||
          !real.startsWith(root + path.sep)
        )
          throw new ErrorCatalogo('Ruta no permitida.', 403);
        const tipo = mime[path.extname(real).toLowerCase()];
        if (!tipo) throw new ErrorCatalogo('Archivo no disponible.', 403);
        const archivo = await fs.readFile(real);
        res.writeHead(200, {
          'Content-Type': tipo,
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(req.method === 'HEAD' ? undefined : archivo);
      } catch (e) {
        if (e.code === 'ENOENT' || e.code === 'ENOTDIR')
          throw new ErrorCatalogo('Archivo no encontrado.', 404);
        throw e;
      }
    } catch (e) {
      if (!res.headersSent)
        responder(res, e.estado || 500, {
          error: e.estado
            ? e.message
            : 'No se pudo completar la operación. El servidor local muestra el detalle.',
        });
      if (!e.estado) console.error(e);
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(puerto, '127.0.0.1', resolve);
  });
  try {
    for (const repo of repos.values()) await repo.iniciar();
    preparado = true;
  } catch (e) {
    await new Promise((resolve) => server.close(resolve));
    throw e;
  }
  return { puerto, cerrar: () => new Promise((resolve) => server.close(resolve)) };
}
const principal =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (principal) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  iniciarServidor(root, Number(process.env.ROSER_PUERTO || 8088))
    .then(() => console.log('Roser: http://127.0.0.1:8088/admin/panel.html'))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
}
