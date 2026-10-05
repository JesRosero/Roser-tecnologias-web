# Verificación · Paso 44 · 5 de octubre de 2026

## Ejecutado realmente

`npm test` desde herramientas/bots con proyecto demo, Auth y Firestore emulados. Pruebas del modelo, integrador existente y 12 escenarios de integración con DOM simulado (JSDOM).

- Precios null/cero, formatos numéricos, cantidades y límites decimales.
- CSV BOM/Unicode/comillas/saltos, importación anterior y nueva, errores, IDs y no eliminación de ausentes.
- Columna opcional de cargue: conserva valor existente en CSV antiguo; alta false; cambio explícito true/false.
- Categorías con espacios normalizados y reutilización.
- Entregas, ejemplos de pago inactivos, marcadores, URLs HTTPS y 16 respuestas literales.
- Reglas: administrador exclusivo permitido; anónimos y otro UID rechazados en negocios/productos/promociones; otras rutas denegadas. Tipos/precios inválidos de ampliaciones rechazados; promoción incompleta y borrado de promoción denegados.
- Repositorio: crear/editar/releer desde nueva instancia, conservar ID, revision, timestamps y autores; edición de precio parcial; grupo de transacción sin aplicación parcial por conflicto.
- Promociones: alta inactiva, editar manteniendo ID, activar, revision, recarga y conflicto.
- Authentication emulado: login correcto/incorrecto, UID no autorizado oculto, generación de solicitud de recuperación y logout limpiando contenido privado.
- Interfaz DOM: crear/editar producto, precio null/cero, filtros, CSV con revisión/confirmación, conflicto conserva borrador sin anunciar guardado.
- Guardados por apartado: horario común, entregas, pagos y respuestas persistentes; sin borrar mapas o campos heredados/interno.
- Borrador de respuesta pendiente se conserva al guardar entrega; conflicto de servidor rechaza guardado.
- Pagos: nuevo ID permanente, editar/desactivar/ordenar y persistir. Texto de vista previa y URL de imagen establecidos; evento de carga simulado.
- Cargue en lote sobre selección, persistencia del booleano.
- Nuevo negocio: preparar formulario no crea documento; guardar crea; no sobreescribe John's.
- Integrador anterior sigue siendo idempotente y conserva admin local/MIME/backup.
- Sintaxis de módulos y ausencia de IDs duplicados en HTML comprobadas.

Todos los datos de prueba se escriben SOLO en el emulador, no en el catálogo real. No es una demostración de conexión Meta.

## Límites y pendientes

- No hay credenciales ni acceso de escritura al Firebase real: esta ampliación NO se publicó ni escribió desde este entorno. Publicar reglas y archivos según PUBLICAR.md y probar producción.
- La versión anterior mostró inicio de sesión real en capturas del usuario. No convertir esa evidencia en una afirmación de que todos los nuevos apartados ya se probaron en producción.
- DOM simulado, no sesión de Chrome real ni prueba visual de tamaños de pantalla. El CSS conserva estructura responsive y añade adaptación de pestañas/formularios; verificar presentación tras publicar.
- La vista previa de imagen comprobada en DOM no verifica descargas externas reales. Validar las URLs públicas finales elegidas por el negocio.
- Recuperación se probó generando código en Auth emulado; no correo de producción.
- Reglas validan autorización y tipos/límites de ampliaciones. No validan integralmente cada método en el array de pagos ni precisión decimal: modelo y servidor deben validarlos; ESQUEMA.md declara el alcance exacto.
- Región y appId completo no comprobados en consola. Configuración web existente se conserva; no se inventa sufijo del appId.
- No se activó Analytics/Blaze/Storage/Functions ni se enviaron mensajes, migró número o modificó Meta.
- TTL de dos horas, pausa humana, pedidos y comprobantes en WhatsApp pertenecen al servidor y no se implementaron en este panel.

## Reproducir

```powershell
cd herramientas/bots
npm ci
npm test
```

Necesita Node y Java para emuladores; puertos Firestore 8188/Auth 9199. Proyecto demo-roser-bots, sin Firebase de producción. SDK del panel ya está empaquetado y no requiere npm para Netlify.
