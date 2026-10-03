# Paso 28 — Navegación y portada de Nosotros

1. Cierra el administrador y copia index.html y la carpeta src de este ZIP dentro de la carpeta real Roser-web-nueva. Combina las carpetas y reemplaza los archivos incluidos.
2. Revisa localmente Inicio, Nosotros y Productos. Las tarjetas quedan Servicios, Proyectos, Aplicaciones, Productos; ambos menús usan Inicio, Servicios, Proyectos, Aplicaciones, Productos, Contacto.
3. Publica desde la terminal de la carpeta del proyecto:

```bash
git add .
git commit -m "Unifica navegacion y centra imagen de Nosotros"
git push
```

4. Espera a que Netlify termine y recarga con Ctrl+F5. Prueba también una ventana de incógnito. Los enlaces Inicio, logo y Contacto llevan una versión en la URL para evitar reutilizar la portada antigua guardada en el navegador.

La imagen de Nosotros y su degradado quedan centrados con un ancho máximo de 1600 px, evitando ampliarse sin límite en pantallas muy anchas o con zoom reducido. Se mantiene la adaptación móvil.

No incluye reemplazos de imágenes, textos, datos, administrador ni configuraciones de las apps. No copia LEEME-PASO-28.md si no necesitas conservarlo en el proyecto.
