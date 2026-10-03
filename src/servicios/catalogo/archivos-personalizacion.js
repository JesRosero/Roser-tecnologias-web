let conexion;
async function db() {
  if (!conexion)
    conexion = new Promise((ok, no) => {
      const r = indexedDB.open('roser-personalizacion', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('archivos', { keyPath: 'id' });
      r.onsuccess = () => ok(r.result);
      r.onerror = () => {
        conexion = null;
        no(r.error);
      };
    });
  return conexion;
}
async function operar(modo, accion) {
  const d = await db();
  return new Promise((ok, no) => {
    const tr = d.transaction('archivos', modo),
      r = accion(tr.objectStore('archivos'));
    tr.oncomplete = () => ok(r.result);
    tr.onerror = () => no(tr.error);
    tr.onabort = () => no(tr.error);
  });
}
export async function guardarArchivo(file, campo) {
  if (
    !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
    file.size > 5 * 1024 * 1024 ||
    !file.size
  )
    throw Error('Usa PNG, JPG o WebP de hasta 5 MB.');
  const a = { id: crypto.randomUUID(), nombre: file.name, campo, blob: file };
  await operar('readwrite', (s) => s.put(a));
  return { id: a.id, nombre: a.nombre, campo };
}
export const recuperarArchivo = (id) => operar('readonly', (s) => s.get(id));
export const borrarArchivo = (id) => operar('readwrite', (s) => s.delete(id));
export async function descargarArchivo(id) {
  const a = await recuperarArchivo(id);
  if (!a) return false;
  const url = URL.createObjectURL(a.blob),
    e = document.createElement('a');
  e.href = url;
  e.download = a.nombre;
  e.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
