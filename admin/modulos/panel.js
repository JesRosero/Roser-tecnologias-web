import { montarMarco } from '../componentes/marco.js';
import { api } from '../componentes/api.js';
montarMarco();
try {
  const recursos = await api('recursos');
  for (const r of recursos) {
    const box = document.createElement('section');
    const h = document.createElement('h2');
    h.textContent = r.titulo;
    const a = document.createElement('a');
    a.textContent = 'Editar →';
    let ruta = r.id + '.html';
    if (r.id === 'inicio') ruta = 'index.html';
    if (r.id.startsWith('servicio-')) ruta = 'detalle-servicio.html?servicio=' + r.args[0];
    if (r.id.startsWith('aplicacion-')) ruta = 'detalle-aplicacion.html?aplicacion=' + r.args[0];
    if (r.id.startsWith('legal-'))
      ruta =
        (r.args[0] === 'roser'
          ? 'documento-sitio.html?'
          : 'documento-legal.html?aplicacion=' + r.args[0] + '&') +
        'documento=' +
        r.args[1];
    a.href = '/admin/' + ruta;
    box.append(h, a);
    document.getElementById('secciones').append(box);
  }
} catch (e) {
  document.getElementById('estado').textContent = e.message;
}
