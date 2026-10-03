export function validarContenidoNosotros(c) {
  const texto = (v, max = 1800) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  const imagen = (v) =>
    texto(v, 300) && /^\/assets\/[a-zA-Z0-9/_ .-]+\.webp$/.test(v) && !v.includes('..');
  const bloque = (b, keys) => b && keys.every((k) => texto(b[k]));
  const parrafos = (p) =>
    Array.isArray(p) && p.length >= 1 && p.length <= 10 && p.every((v) => texto(v));
  if (
    !c ||
    c.version !== 1 ||
    c.idioma !== 'es' ||
    !bloque(c.hero, ['etiqueta', 'titulo', 'lema', 'descripcion', 'nota']) ||
    !imagen(c.hero.imagen) ||
    !bloque(c.origen, ['titulo']) ||
    !parrafos(c.origen.parrafos) ||
    !bloque(c.personas, ['titulo']) ||
    !Array.isArray(c.personas.perfiles) ||
    c.personas.perfiles.length !== 2
  )
    throw Error('Revisa la presentación y los perfiles.');
  c.personas.perfiles.forEach((p, i) => {
    if (
      p.id !== ['jesus', 'jhon'][i] ||
      !bloque(p, ['nombre', 'cargo', 'alternativo', 'iniciales']) ||
      !imagen(p.imagen) ||
      !parrafos(p.parrafos)
    )
      throw Error('Perfil no válido.');
  });
  if (
    !bloque(c.trabajo, ['titulo', 'descripcion']) ||
    !Array.isArray(c.trabajo.pasos) ||
    c.trabajo.pasos.length !== 3 ||
    !c.trabajo.pasos.every((v) => texto(v, 100)) ||
    !bloque(c.mision, ['titulo', 'descripcion']) ||
    !bloque(c.vision, ['titulo', 'descripcion']) ||
    !bloque(c.contacto, ['titulo', 'descripcion', 'boton', 'mensaje'])
  )
    throw Error('Revisa el trabajo, la visión y el contacto.');
  return c;
}
