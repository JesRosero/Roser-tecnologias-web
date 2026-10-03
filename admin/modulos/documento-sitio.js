import { montarEditor } from '../componentes/editor-contenido.js';
import {
  APLICACIONES_LEGALES,
  DOCUMENTOS_LEGALES,
} from '/src/servicios/configuracion-documento-legal.js';
import { RUTAS } from '/src/configuracion/rutas.js';
const params = new URLSearchParams(location.search);
const app = 'roser';
const doc = params.get('documento') || 'privacidad';
if (!APLICACIONES_LEGALES.includes(app) || !DOCUMENTOS_LEGALES.includes(doc))
  document.getElementById('estado').textContent =
    'Documento desconocido. Selecciona uno de los enlaces del panel.';
else {
  document.querySelector('[data-texto=ver]').href = RUTAS[doc];
  document.querySelectorAll('.selector-documentos a').forEach((a) => {
    const p = new URL(a.href).searchParams;
    if (p.get('documento') === doc) a.setAttribute('aria-current', 'page');
  });
  await montarEditor({
    recurso: `legal-${app}-${doc}`,
    idioma: '/src/idiomas/es/admin-documento-sitio.json',
    renderizarCampos({ contenido: c, textos: t, campo, grupo }) {
      document.getElementById('documento-actual').textContent = `${c.nombre} · ${c.titulo}`;
      const g = grupo(c.nombre);
      campo(g, 'titulo', t.campos.titulo, c.titulo);
      campo(g, 'actualizacion', t.campos.actualizacion, c.actualizacion);
      const intro = campo(g, 'introduccion', t.campos.introduccion, c.introduccion, 'textarea');
      intro.maxLength = 12000;
      intro.required = false;
      c.secciones.forEach((s, i) => {
        const grid = grupo(`${i + 1}. ${s.titulo}`);
        campo(grid, `secciones.${i}.titulo`, t.campos.titulo, s.titulo);
        s.bloques.forEach((b, j) => {
          const base = `secciones.${i}.bloques.${j}`;
          if (b.tipo === 'parrafo')
            campo(
              grid,
              `${base}.texto`,
              `${t.campos.texto} ${j + 1}`,
              b.texto,
              'textarea',
            ).maxLength = 12000;
          else
            b.items.forEach((v, k) => {
              campo(
                grid,
                `${base}.items.${k}`,
                `${t.campos.item} ${k + 1}`,
                v,
                'textarea',
              ).maxLength = 12000;
            });
        });
      });
    },
  });
}
