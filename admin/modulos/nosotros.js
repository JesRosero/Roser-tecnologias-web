import { montarEditor } from '../componentes/editor-contenido.js';

await montarEditor({
  recurso: 'nosotros',
  idioma: '/src/idiomas/es/admin-nosotros.json',
  renderizarCampos({ contenido: c, textos: t, campo, imagen, grupo }) {
    const largo = (g, k, label, v) => {
      const input = campo(g, k, label, v, 'textarea');
      input.maxLength = 1800;
    };
    let g = grupo(t.secciones.hero);
    for (const k of ['etiqueta', 'titulo', 'lema', 'descripcion', 'nota'])
      largo(g, `hero.${k}`, t.campos[k], c.hero[k]);
    imagen(g, 'hero.imagen', c.hero.imagen);
    g = grupo(c.origen.titulo);
    campo(g, 'origen.titulo', t.campos.titulo, c.origen.titulo);
    c.origen.parrafos.forEach((p, i) =>
      largo(g, `origen.parrafos.${i}`, `${t.campos.texto} ${i + 1}`, p),
    );
    g = grupo(c.personas.titulo);
    campo(g, 'personas.titulo', t.campos.titulo, c.personas.titulo);
    c.personas.perfiles.forEach((p, i) => {
      const grid = grupo(p.nombre);
      const base = `personas.perfiles.${i}`;
      for (const k of ['nombre', 'cargo', 'alternativo', 'iniciales'])
        campo(grid, `${base}.${k}`, t.campos[k], p[k]);
      imagen(grid, `${base}.imagen`, p.imagen);
      p.parrafos.forEach((v, j) =>
        largo(grid, `${base}.parrafos.${j}`, `${t.campos.texto} ${j + 1}`, v),
      );
    });
    for (const k of ['trabajo', 'mision', 'vision', 'contacto']) {
      const grid = grupo(c[k].titulo);
      for (const f of ['titulo', 'descripcion']) largo(grid, `${k}.${f}`, t.campos[f], c[k][f]);
      if (k === 'trabajo')
        c.trabajo.pasos.forEach((p, i) =>
          campo(grid, `trabajo.pasos.${i}`, `${t.campos.paso} ${i + 1}`, p),
        );
      if (k === 'contacto')
        for (const f of ['boton', 'mensaje']) largo(grid, `${k}.${f}`, t.campos[f], c[k][f]);
    }
  },
});
