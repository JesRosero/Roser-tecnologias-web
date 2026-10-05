# Publicar actualización del panel · Paso 44

## Copiar y publicar reglas

1. Extraer el ZIP en la raíz del proyecto actual `Roser-web-nueva`, conservando las rutas `admin/bots/` y `herramientas/bots/`. Reemplazar los archivos incluidos. No borrar otras carpetas.
2. El ZIP no reemplaza `firebase-config.mjs`, SDK, `admin/index.html` ni `_redirects`: conserva tu configuración y la corrección de acceso ya publicada.
3. Abrir Firebase Console → seleccionar `roser-tecnologias-bots` → Firestore Database → base `(default)` → Reglas.
4. Guardar una copia del texto actual. El archivo `herramientas/bots/firestore.rules` contiene las reglas completas para el alcance informado: UID exclusivo, negocios/productos y nueva subcolección promotions, con validaciones de ampliaciones. Copiar y publicar su contenido. Si tus reglas actuales tienen validaciones adicionales, conservarlas y fusionar las funciones y el bloque promotions; no reemplazarlas por reglas menos estrictas.
5. No crear colecciones manualmente ni abrir acceso a todos los autenticados. La nueva ruta se crea al guardar la primera promoción.

Las reglas son un archivo de referencia hasta que las publiques en consola. Subirlas a Git NO las publica en Firebase. No hace falta Blaze, Functions, Storage, Analytics ni instalar dependencias para alojar el panel.

## Git / Netlify

Desde la raíz del proyecto, en PowerShell:

```powershell
git add admin/bots/index.html admin/bots/panel.css admin/bots/model.mjs admin/bots/controller.mjs admin/bots/repository.mjs herramientas/bots LEEME-PASO-44.md
git commit -m "Ampliar panel de bots con entregas pagos y promociones"
git push
```

Esperar que Netlify muestre el nuevo commit como Published. Abrir https://rosertecnologias.com/admin/bots/ y recargar con Ctrl+F5. No cambiar carpeta de publicación ni comando de build: es HTML/CSS/JS estático con SDK existente.

La excepción ya corregida de `_redirects` debe mantenerse antes del bloqueo general:

```text
/admin/bots /admin/bots/index.html 200!
/admin/bots/* /admin/bots/:splat 200!
/admin /404.html 404!
/admin/* /404.html 404!
```

No añadir redirección 301 entre /admin/bots y /admin/bots/: Netlify normaliza la barra y puede generar un bucle. El editor anterior continúa siendo local. El panel publicado ya no enlaza a /admin/.

## Configurar John's y verificar producción

1. Iniciar sesión con tu cuenta autorizada; no crear usuarios públicos.
2. Elegir Ferretería John's. En «Negocio y horarios» revisar 08:00–17:00 todos los días. Si ya hay horario guardado distinto, utilizar la acción de aplicar horario común y guardar explícitamente. Pulsar «Guardar negocio y horarios», visible arriba y abajo.
3. «Respuestas»: revisar nuevas propuestas y guardar. Las respuestas previamente almacenadas se conservan; modificar welcome/outOfHours si se necesita el nuevo mensaje de atención automática 24h.
4. «Entregas y cargue»: revisar 17000/19000/15000 COP y condiciones, guardar. No suman cargos automáticamente.
5. «Medios de pago»: revisar ejemplos. Mantener isExample hasta reemplazar y verificar con el negocio los datos activos. Puedes dejar ejemplos inactivos; no inventar cuentas.
6. Productos: marcar MANUALMENTE cargue para ladrillo, farol, arena y mixto tras identificar los artículos. Seleccionar filas para aplicar en lote; guardar precios pendientes antes de actuar sobre esas filas.
7. Promociones: abrir pestaña, crear una oferta real o una prueba INACTIVA, guardar y editar. Si indica regla pendiente, completar pasos de Firebase.
8. Recargar y comprobar que se mantienen los datos. Cerrar sesión y entrar desde otro navegador/computadora para confirmar lectura compartida.
9. Probar importación de CSV antiguo y nuevo con revisión antes de guardar, sin eliminar productos ausentes. Pruebas del catálogo real: mantener ejemplos inactivos e identificados.
10. Comprobar rechazo de otra cuenta y que no se muestran datos al cerrar sesión. Recuperación de contraseña en producción requiere probar el correo real; no pedir ni compartir contraseña en el chat.

La URL HTTPS de una imagen debe ser pública y devolver una imagen accesible. Sin subida de archivos ni copia en Firebase Storage. No usar secretos o URL privadas en esos campos.

Región y appId completo se comprueban en consola; no se asumen ni se reemplazan en este ZIP. Configurar el panel no despliega ni conecta el bot.

## Pruebas locales opcionales

En `herramientas/bots`, con Node y Java 17 o compatible:

```powershell
npm ci
npm test
```

Solo usa el proyecto demo y emuladores locales. Netlify no requiere ejecutar esto. Detalle: VERIFICACION.md.
