# Roser Tecnologías — web actual

Web estática: Inicio, Servicios, Proyectos, Aplicaciones, Productos y Contacto.

- `index.html`: portada actual.
- `paginas/`: páginas públicas.
- `src/`: estilos, componentes, textos y módulos.
- `datos/contenido-inicial/`: contenido que guarda el administrador.
- `assets/`: imágenes, logos e iconos.
- `Imagenes/`: se conserva porque index.html usa el favicon Rosero.png. No se limpian imágenes que no se incluyeron en la copia revisada.
- `Productos-Roser/Apps/3dcost/config/` y `construcost/config/`: configuración consultada por las apps. Conservar estas rutas.
- Las cuatro carpetas antiguas de privacidad y términos dentro de Productos-Roser contienen páginas de compatibilidad que ya usan el módulo legal nuevo. Se conservan para los enlaces existentes.
- `admin/`, `herramientas/administrador/`, `herramientas/servidor-local/`: administrador local.
- `.roser-local/`: runtime, perfil y respaldos privados del administrador. No publicar ni borrar.
- `app-ads.txt`: se conserva en la raíz.
- `_redirects`: rutas anteriores y configuración para Netlify. Revisado con la documentación oficial: https://docs.netlify.com/manage/routing/redirects/overview/ y https://docs.netlify.com/manage/routing/redirects/redirect-options/

## Editar

Abre Administrador-Roser.vbs o abrir-administrador.bat. Edita, aplica y guarda. Revisa la web con Live Server o con el servidor del administrador. Los cambios de contenido se guardan en el proyecto.

## Limpieza

Los restos de la versión anterior se trasladan a una carpeta hermana `NOMBRE-respaldo-limpieza-FECHA`. `manifest.json` registra los traslados y los archivos actualizados. No se borra la carpeta .git de tu proyecto completo y no se eliminan recursos ausentes de la copia enviada.

## Publicación

La limpieza no publica. Revisa localmente y publica después mediante tu Git/Netlify habitual. La portada publicada debe proceder de index.html en la raíz. Los redireccionamientos de Netlify se comprobarán en el despliegue; Live Server no interpreta _redirects.

Los archivos de configuración y app-ads.txt mantienen exactamente el contenido existente. El administrador es local; sus rutas quedan excluidas de acceso público por las reglas de Netlify. No se cambian credenciales ni se realizan acciones en la base de datos antigua.
