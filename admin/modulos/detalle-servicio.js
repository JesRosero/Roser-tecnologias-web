import { montarEditor } from '../componentes/editor-contenido.js';
import { IDS_DETALLE } from '/src/servicios/configuracion-detalle-servicio.js';
const id = new URLSearchParams(location.search).get('servicio');
if (!IDS_DETALLE.includes(id))
  document.getElementById('estado').textContent =
    'Selecciona un servicio desde el panel de Servicios.';
else {
  document.getElementById('ver-servicio').href = `/paginas/servicios/${id}/index.html`;
  await montarEditor({
    recurso: `servicio-${id}`,
    idioma: '/src/idiomas/es/admin-detalle-servicio.json',
    renderizarCampos({ contenido: c, textos: t, campo, imagen, grupo }) {
      const hero = grupo(t.secciones.hero);
      for (const k of ['titulo', 'subtitulo', 'introduccion'])
        campo(hero, k, t.campos[k], c[k], k === 'introduccion' ? 'textarea' : 'text');
      imagen(hero, 'imagen', c.imagen);
      const evaluacion = grupo(t.secciones.evaluacion);
      campo(evaluacion, 'evaluacion.titulo', t.campos.titulo, c.evaluacion.titulo);
      c.evaluacion.areas.forEach((a, i) => {
        const g = grupo(`${t.secciones.area} ${i + 1}`);
        campo(g, `evaluacion.areas.${i}.titulo`, t.campos.titulo, a.titulo);
        campo(
          g,
          `evaluacion.areas.${i}.descripcion`,
          t.campos.descripcion,
          a.descripcion,
          'textarea',
        );
      });
      const proceso = grupo(t.secciones.proceso);
      campo(proceso, 'proceso.titulo', t.campos.titulo, c.proceso.titulo);
      c.proceso.pasos.forEach((p, i) => {
        const g = grupo(`${t.secciones.paso} ${i + 1}`);
        campo(g, `proceso.pasos.${i}.titulo`, t.campos.titulo, p.titulo);
        campo(g, `proceso.pasos.${i}.descripcion`, t.campos.descripcion, p.descripcion, 'textarea');
      });
      const contacto = grupo(t.secciones.contacto);
      campo(contacto, 'contacto.titulo', t.campos.titulo, c.contacto.titulo);
      campo(contacto, 'contacto.texto', t.campos.descripcion, c.contacto.texto, 'textarea');
      campo(contacto, 'contacto.mensaje', t.campos.mensaje, c.contacto.mensaje, 'textarea');
      imagen(contacto, 'contacto.imagen', c.contacto.imagen);
    },
  });
}
