import { subirImagen } from './api.js';
export function subidaCampo(destino, input) {
  const label = document.createElement('label');
  label.textContent = 'Seleccionar imagen (WebP automático)';
  const f = document.createElement('input');
  f.type = 'file';
  f.accept = 'image/png,image/jpeg,image/webp';
  label.append(f);
  destino.append(label);
  f.onchange = async () => {
    if (!f.files[0]) return;
    f.disabled = true;
    const main = document.querySelector('main');
    main.inert = true;
    try {
      input.value = await subirImagen(f.files[0]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const estado = document.getElementById('estado');
      if (estado) estado.textContent = 'Imagen preparada. Aplica y guarda los cambios.';
    } catch (e) {
      alert(e.message);
    } finally {
      f.disabled = false;
      main.inert = false;
    }
  };
}
