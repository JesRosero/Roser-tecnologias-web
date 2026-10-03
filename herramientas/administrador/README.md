# Administrador Roser

La ventana de Electron carga el mismo panel web existente. `main.cjs` inicia el servidor dentro de su propio proceso; no deja una consola paralela. Al cerrar la última ventana se cierra el servidor. El guardado requiere el servidor integrado y nunca publica en Netlify.

La primera apertura de `Administrador-Roser.vbs` ejecuta `instalar.ps1`, descarga Electron 44.5.1 y crea el acceso del escritorio. Requiere Node.js 18+ ya instalado y conexión a Internet esa primera vez. El runtime y el perfil se guardan en `.roser-local/administrador/`, ignorado por Git. Si mueves el proyecto, vuelve a crear el acceso ejecutando `instalar.ps1`; el archivo VBS dentro de la carpeta continúa usando rutas relativas.

La ventana mantiene sandbox, aislamiento y Node deshabilitado en las páginas. Los enlaces públicos abren el navegador habitual. La edición se restringe al servidor local, con validación, origen y revisión de archivo en cada escritura. El puerto 8088 debe estar libre.

Recursos: `src/configuracion/recursos-admin.json`. Validadores compartidos: `src/servicios/validadores/` y `src/servicios/catalogo/modelo.js`. Backups: cinco versiones anteriores por recurso, journal recuperable ante interrupción y bloqueo de cambios obsoletos. El catálogo conserva el directorio de respaldos de la entrega anterior.

Las imágenes nuevas se convierten a WebP en el navegador y se escriben con nombre de contenido inmutable. Esto evita que cambiar una imagen destruya la imagen referenciada por un respaldo. Los archivos antiguos no se eliminan automáticamente.

Documentación oficial de la ventana y sus restricciones: https://www.electronjs.org/docs/latest/api/browser-window y https://www.electronjs.org/docs/latest/tutorial/security .
