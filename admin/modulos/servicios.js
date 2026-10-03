import { montarEditor } from '../componentes/editor-contenido.js';

await montarEditor({
  recurso: 'servicios',
  idioma: '/src/idiomas/es/admin-servicios.json',
  renderizarCampos({ contenido, textos, campo, imagen, grupo }) {
    const hero = grupo(textos.secciones.hero);
    campo(hero, 'titulo', textos.campos.titulo, contenido.titulo);
    campo(hero, 'subtitulo', textos.campos.subtitulo, contenido.subtitulo);
    campo(hero, 'introduccion', textos.campos.introduccion, contenido.introduccion, 'textarea');
    imagen(hero, 'imagen', contenido.imagen);
    contenido.servicios.forEach((servicio, i) => {
      const grid = grupo(`${textos.secciones.area}: ${servicio.titulo}`);
      campo(grid, `servicios.${i}.titulo`, textos.campos.titulo, servicio.titulo);
      campo(
        grid,
        `servicios.${i}.descripcion`,
        textos.campos.descripcion,
        servicio.descripcion,
        'textarea',
      );
      imagen(grid, `servicios.${i}.imagen`, servicio.imagen);
    });
    const contacto = grupo(textos.secciones.contacto);
    campo(contacto, 'contacto.titulo', textos.campos.titulo, contenido.contacto.titulo);
    campo(
      contacto,
      'contacto.texto',
      textos.campos.descripcion,
      contenido.contacto.texto,
      'textarea',
    );
    campo(
      contacto,
      'contacto.mensaje',
      textos.campos.mensaje,
      contenido.contacto.mensaje,
      'textarea',
    );
  },
});
