export async function api(ruta, op = {}) {
  const res = await fetch('/__roser/' + ruta, {
    ...op,
    headers: {
      'X-Roser-Local': '1',
      ...(op.body ? { 'Content-Type': 'application/json' } : {}),
      ...op.headers,
    },
    signal: AbortSignal.timeout(20000),
  });
  let c;
  try {
    c = await res.json();
  } catch {
    throw Error('Abre Administrador Roser para editar.');
  }
  if (!res.ok) throw Error(c.error || 'No se pudo completar la operación.');
  return c;
}
export async function subirImagen(archivo) {
  if (!archivo || archivo.size > 15 * 1024 * 1024)
    throw Error('Selecciona una imagen de hasta 15 MB.');
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.9));
  if (!blob) throw Error('No se pudo convertir la imagen.');
  return (
    await api('imagenes', { method: 'POST', headers: { 'Content-Type': 'image/webp' }, body: blob })
  ).ruta;
}
