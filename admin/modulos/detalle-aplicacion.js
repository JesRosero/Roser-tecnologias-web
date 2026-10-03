import { montarEditor } from '../componentes/editor-contenido.js';
import { RUTAS_APLICACIONES } from '/src/configuracion/rutas-aplicaciones.js';

const id = new URLSearchParams(location.search).get('aplicacion') || '3dcost';
if (['3dcost', 'construcost'].includes(id))
  document.querySelector('[data-texto=ver]').href = RUTAS_APLICACIONES[id];
await montarEditor({
  recurso: `aplicacion-${id}`,
  idioma:
    id === 'construcost'
      ? '/src/idiomas/es/admin-construcost.json'
      : '/src/idiomas/es/admin-detalle-aplicacion.json',
  renderizarCampos({ contenido: c, textos: t, campo, imagen, grupo }) {
    const hero = grupo(t.secciones.hero);
    campo(hero, 'nombre', t.campos.nombre, c.nombre);
    for (const k of ['titulo', 'descripcion', 'alternativo'])
      campo(hero, `hero.${k}`, t.campos[k], c.hero[k], k === 'descripcion' ? 'textarea' : 'text');
    imagen(grupo(t.secciones.fondoPrincipal), 'hero.fondo', c.hero.fondo);
    imagen(grupo(t.secciones.bienvenida), 'hero.captura', c.hero.captura);
    const tiendas = grupo(t.secciones.tiendas);
    for (const k of ['google', 'apple'])
      campo(tiendas, `tiendas.${k}`, t.campos[k], c.tiendas[k], 'url');
    for (const key of ['funciones', 'galeria', 'planes']) {
      const g = grupo(c[key].titulo);
      for (const k of ['titulo', 'descripcion'])
        campo(g, `${key}.${k}`, t.campos[k], c[key][k], k === 'descripcion' ? 'textarea' : 'text');
    }
    c.funciones.items.forEach((f, i) => {
      const g = grupo(`${t.secciones.funcion}: ${f.titulo}`);
      for (const k of ['titulo', 'descripcion'])
        campo(g, `funciones.items.${i}.${k}`, t.campos[k], f[k]);
    });
    c.galeria.items.forEach((f, i) => {
      const g = grupo(`${t.secciones.capturaDetalle}: ${f.titulo}`);
      for (const k of ['titulo', 'descripcion', 'alternativo'])
        campo(g, `galeria.items.${i}.${k}`, t.campos[k], f[k]);
      imagen(g, `galeria.items.${i}.imagen`, f.imagen);
    });
    c.planes.items.forEach((p, i) => {
      const g = grupo(`${t.secciones.plan}: ${p.nombre}`);
      for (const k of ['nombre', 'titulo']) campo(g, `planes.items.${i}.${k}`, t.campos[k], p[k]);
      p.beneficios.forEach((v, j) =>
        campo(g, `planes.items.${i}.beneficios.${j}`, `${t.campos.beneficio} ${j + 1}`, v),
      );
    });
    campo(grupo(t.secciones.notaPlanes), 'planes.nota', t.campos.nota, c.planes.nota);
    const contacto = grupo(t.secciones.contacto);
    for (const k of ['titulo', 'boton', 'mensaje'])
      campo(contacto, `contacto.${k}`, t.campos[k], c.contacto[k]);
  },
});
