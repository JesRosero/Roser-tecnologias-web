# Verificación realizada

Se utilizaron Firebase Auth y Firestore locales con el proyecto demo-roser-bots, nunca el Firebase real del negocio. El esquema y la interfaz se probaron con SDK Firebase 12.19.0, reglas cargadas desde firestore.rules y DOM simulado mediante jsdom.

Pasaron los casos:

1. Precio pendiente, cero, decimales, formatos inválidos y cantidad entera/fraccionaria.
2. Validación de números de WhatsApp, ubicación HTTPS, horarios y rechazo de variables no implementadas.
3. CSV UTF-8/BOM, Unicode, comillas, separadores, saltos de línea, IDs desconocidos, duplicados, null/cero y protección de fórmulas de Excel.
4. Huella de concurrencia independiente del orden de claves, sensible a cambios.
5. Integrador: conserva el administrador anterior, no duplica el enlace y añade MIME .mjs al servidor local.
6. Reglas: administrador permitido en negocios/productos; anónimos y otros UID rechazados en lectura, escritura y listado.
7. Reglas: el administrador también es rechazado en orders, users, pedidos anidados y subcolecciones fuera del alcance.
8. Repositorio: creación/edición, persistencia tras volver a consultar, ID permanente, metadatos, actualización parcial de precio, preservación de campos ajenos y conflicto que aborta todo un grupo.
9. UI con Auth emulado: login correcto e incorrecto, otro UID denegado, logout que limpia datos privados y generación de solicitud de recuperación en el emulador.
10. UI: creación desde formulario, precio pendiente/cero desde tabla, edición de producto y negocio, filtros y vista previa textual.
11. UI: conflicto concurrente muestra error, no anuncia guardado, conserva la edición pendiente y no reemplaza el precio guardado desde otra sesión.
12. UI: importación revisada, confirmación y persistencia, conservando productos ausentes del CSV.

Además se revisaron sintaxis de módulos, referencias locales del HTML e IDs únicos.

Limitaciones:

- jsdom verifica DOM, formularios y eventos; no es una prueba visual real de Chrome/Safari ni de dimensiones móviles.
- El correo de recuperación se generó en el emulador; no se comprobó su llegada a un buzón real.
- La prueba de persistencia volvió a consultar Firestore con otra instancia del repositorio; no se inició sesión desde dos computadoras físicas.
- No se comprobó la consola real, la región, el appId completo ni las reglas realmente publicadas.
- No se realizaron envíos de WhatsApp, migración del número, despliegue del bot ni aprobación de Meta.
- El guardado de importaciones de más de 100 cambios es por grupos; el límite y comportamiento parcial están informados en la UI. No se realizó una prueba masiva de catálogo.

Pruebas reproducibles en tests/ y comandos en PUBLICAR.md. Solo emuladores, sin credenciales reales.
