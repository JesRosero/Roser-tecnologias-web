# Instalación · Panel Roser Bots

## Copiar e integrar

1. Descomprimir el paquete sobre la raíz del proyecto de la web. Incluye `admin/bots/` y `herramientas/bots/`. No incluye ni reemplaza tu `admin/index.html` anterior.
2. En la terminal de VS Code, desde la raíz del proyecto:

```bash
node herramientas/bots/integrar-admin.mjs
```

El integrador añade una entrada “Bots de WhatsApp” a tu administrador conservando su contenido. Si no existe /admin/index.html, crea una entrada mínima. Puede ejecutarse nuevamente sin duplicar el enlace. Guarda una copia del HTML anterior en .roser-local/bots-integracion/ y excluye .roser-local del Git.
Además añade MIME .mjs al servidor local existente si reconoce su tabla MIME, para que el administrador de escritorio pueda cargar los módulos.
El editor anterior conserva su comportamiento local; únicamente Bots guarda en Firestore.

## Configuración y permisos

- La configuración pública está en `admin/bots/firebase-config.mjs`. Se transcribieron los valores recibidos, sin Analytics ni measurementId.
- **Verificar appId en Firebase → configuración del proyecto → tus apps → Roser Bots Admin.** El valor recibido `1:98750045174:web` parece incompleto: normalmente tiene un sufijo después de `:web:`. No se inventó ese sufijo. Copiar el valor completo de la consola antes de la comprobación real; el Auth/Firestore emulado se probó por separado. No se necesitan contraseñas ni claves privadas en ese archivo.
- Mantener correo/contraseña habilitados y comprobar que la cuenta administradora tiene UID UNVzgzxtFFPP52WaOImlzrMRhiV2.
- Para publicar, el dominio autorizado ya informado es rosertecnologias.com. Si pruebas en localhost o utilizas otro dominio, autorizar ese origen concreto en Firebase Authentication cuando corresponda. No cambiar el número ni el registro de WhatsApp.
- Las rutas usadas son las que ya autorizaste. No ampliar permisos. El archivo firestore.rules es una referencia exacta del alcance esperado y no se publica automáticamente con el ZIP ni con Git en Netlify.
- Verificar la región de (default) en la consola; no se ha supuesto una ubicación.
- No activar Blaze, Storage, Functions ni Analytics. Este panel usa Auth y Firestore, dentro de las cuotas que correspondan al plan actual. Puede mostrar un error si se agota cuota; no cambia de plan automáticamente.

## Subir a Git y Netlify

No añadir node_modules, respaldos locales, contraseñas, secretos de Meta ni cuentas de servicio.

```bash
git status
git add admin/bots admin/index.html herramientas/bots .gitignore
```

Si el integrador informó que añadió MIME al servidor local y ese archivo existe:

```bash
git add herramientas/servidor-local/iniciar.mjs
```

Revisar lo preparado y publicar:

```bash
git diff --cached --stat
git commit -m "Agregar panel privado de Roser Bots con Firebase"
git push
```

Conservar la configuración de despliegue actual de Netlify. El SDK está incluido, por lo que no hace falta un build command nuevo, instalar dependencias en Netlify ni cambiar el directorio de publicación. Los nuevos archivos deben estar dentro de la misma raíz que publica hoy /paginas y /src.

Entrada final: https://rosertecnologias.com/admin/bots/
Acceso desde el administrador: https://rosertecnologias.com/admin/
También puede abrirse /admin/bots/index.html.

## Primer uso

1. Iniciar sesión con tu cuenta administradora existente; no hay registro público.
2. Seleccionar Ferretería John's, abrir Negocio y respuestas y verificar +573168026222.
3. Completar dirección, ubicación, horarios y textos. El número interno puede quedar vacío. Revisar las propuestas de pagos/entregas antes de guardar.
4. Guardar. La escritura crea businesses/ferreteria-johns, con metadatos de servidor.
5. Crear productos reales o importar la plantilla vacía con sus datos reales. Revisar cambios; los nuevos productos empiezan inactivos en el editor.
6. Recargar y comprobar la persistencia. Abrir desde otra computadora, iniciar sesión y comprobar los mismos datos.

No se incluyeron productos, precios o existencias reales inventados. El panel no hace una carga automática de ejemplos. Los ejemplos de las pruebas se crean exclusivamente en un proyecto de emuladores demo.

## Comprobación en tu proyecto real

Pendiente por no disponer aquí de tu sesión/contraseña: login y reglas actualmente publicadas, correo real de recuperación, persistencia entre equipos, comprobación visual en navegador de escritorio/móvil y región de Firestore.
No se accedió ni se escribió a tu Firebase real y no se publicaron cambios en tu Git desde este entorno.

Tras publicar, comprobar:

- La pantalla sin sesión no muestra catálogo.
- Tu UID entra; una cuenta distinta recibe Acceso denegado.
- Un producto inactivo creado con precio pendiente conserva su ID al editarlo.
- Precio 0 se distingue de pendiente.
- Cambiar un precio guarda solo ese precio y los metadatos.
- Importar CSV muestra revisión, errores y confirmación; un producto ausente permanece.
- Los cambios reaparecen al recargar y al entrar desde otro equipo.
- Cerrar sesión elimina los datos de la pantalla.

El panel no despliega ni prueba el bot, no migra el número, no confirma pedidos y no envía mensajes de WhatsApp.

## Repetir pruebas

Opcional, solo en computadora de desarrollo. No se necesita para publicar el panel ya empaquetado.

```bash
cd herramientas/bots
npm install
npm test
```

Requiere Node 22 y Java 17 para las versiones fijadas del CLI/emulador. Las pruebas usan demo-roser-bots y no requieren Firebase login ni acceso al proyecto real.
`npm run build` vuelve a empaquetar el SDK local si se necesita. No cambia Firestore, reglas en producción ni facturación.
