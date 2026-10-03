import { montarEditor } from '../componentes/editor-contenido.js';

await montarEditor({
  recurso: 'aplicaciones',
  idioma: '/src/idiomas/es/admin-aplicaciones.json',
  renderizarCampos({ contenido: c, textos: t, campo, imagen, grupo }) {
    const hero = grupo(t.secciones.hero);
    for (const k of ['etiqueta', 'titulo', 'descripcion'])
      campo(hero, k, t.campos[k], c[k], k === 'descripcion' ? 'textarea' : 'text');
    c.aplicaciones.forEach((a, i) => {
      const g = grupo(a.nombre);
      for (const k of ['nombre', 'categoria', 'descripcion', 'alternativo'])
        campo(
          g,
          `aplicaciones.${i}.${k}`,
          t.campos[k],
          a[k],
          k === 'descripcion' ? 'textarea' : 'text',
        );
      const f = grupo(`${a.nombre}: ${t.secciones.fondo}`);
      imagen(f, `aplicaciones.${i}.fondo`, a.fondo);
      const captura = grupo(`${a.nombre}: ${t.secciones.captura}`);
      imagen(captura, `aplicaciones.${i}.captura`, a.captura);
    });
    const contacto = grupo(t.secciones.contacto);
    campo(contacto, 'contacto.texto', t.campos.descripcion, c.contacto.texto);
    campo(contacto, 'contacto.enlace', t.campos.enlace, c.contacto.enlace);
    campo(contacto, 'contacto.mensaje', t.campos.mensaje, c.contacto.mensaje, 'textarea');
  },
});
