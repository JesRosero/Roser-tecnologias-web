import { montarEditor } from '../componentes/editor-contenido.js';

await montarEditor({
  recurso: 'inicio',
  idioma: '/src/idiomas/es/admin.json',
  renderizarCampos({ contenido, textos, campo, imagen, grupo, registrar }) {
    const hero = grupo(textos.secciones.hero);
    for (const k of ['marca', 'titulo', 'lema', 'boton'])
      campo(hero, `hero.${k}`, textos.campos[k], contenido.hero[k]);
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = textos.campos.destino;
    const select = document.createElement('select');
    select.name = 'hero.destino';
    for (const [value, text] of [
      ['#areas', textos.destinos.areas],
      ['#contacto', textos.destinos.contacto],
    ]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    select.value = contenido.hero.destino;
    label.append(span, select);
    hero.append(label);
    registrar('hero.destino', select);
    imagen(hero, 'hero.imagen', contenido.hero.imagen);
    contenido.areas.forEach((area, i) => {
      const grid = grupo(`${textos.secciones.area}: ${textos.areas[area.id]}`);
      campo(grid, `areas.${i}.titulo`, textos.campos.titulo, area.titulo);
      campo(
        grid,
        `areas.${i}.descripcion`,
        textos.campos.descripcion,
        area.descripcion,
        'textarea',
      );
      imagen(grid, `areas.${i}.imagen`, area.imagen);
    });
    const contacto = grupo(textos.secciones.contacto);
    for (const k of ['correo', 'telefono', 'whatsapp', 'ubicacion'])
      campo(
        contacto,
        `contacto.${k}`,
        textos.campos[k],
        contenido.contacto[k],
        k === 'correo' ? 'email' : 'text',
      );
    const nota = document.createElement('p');
    nota.className = 'ayuda';
    nota.textContent = textos.notaMapa;
    contacto.append(nota);
  },
});
