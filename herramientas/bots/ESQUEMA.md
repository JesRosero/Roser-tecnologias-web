# Contrato de datos · Roser Bots Admin · versión 1

Proyecto: `roser-tecnologias-bots`. Firestore: `(default)`.
La región **no se ha verificado**. Consultarla en la consola y registrarla antes de documentar alojamiento de datos.
No hay conexión con Meta, pedidos, conversaciones o carritos en este panel.

## Rutas

- `businesses/{businessId}`
- `businesses/{businessId}/products/{productId}`
- Primer negocio: `businesses/ferreteria-johns`.

`businessId` es estable: hasta 80 caracteres en minúsculas, números y guiones, con formato `mi-negocio`. El selector lista los documentos de `businesses` y ofrece Ferretería John's sin guardar si no existe todavía. El botón Añadir negocio prepara el formulario; no crea datos hasta guardar.

`productId` es el ID autogenerado por Firestore, permanente y ajeno al código, nombre o precio. No cambiarlo para renombrar. No hay borrado definitivo desde el panel.

## Documento del negocio

| Campo | Tipo | Contrato |
| --- | --- | --- |
| schemaVersion | number entero | `1` |
| commercialName | string | Obligatorio, 1–160 caracteres |
| customerWhatsApp | string | E.164 con +, 8–15 dígitos. Inicial: `+573168026222` |
| internalNotificationWhatsApp | string o null | Número distinto del de atención; null si no se ha definido |
| address | string | 0–500 caracteres. No se inventa dirección |
| locationUrl | string | URL https o string vacío; máximo 1000 caracteres |
| timezone | string | `America/Bogota` |
| schedule | map | Días mon, tue, wed, thu, fri, sat, sun |
| responses | map | Ocho respuestas identificadas en la tabla inferior |
| revision | number entero | Incrementado en cada escritura confirmada por el panel |
| createdAt | Firestore Timestamp | Se registra en documentos nuevos |
| createdBy | string UID | Se registra en documentos nuevos |
| updatedAt | Firestore Timestamp | Timestamp del servidor en cada escritura |
| updatedBy | string UID | UID autenticado que realiza el cambio |

Cada entrada `schedule.mon` (y los demás días) contiene:

| Campo | Tipo | Contrato |
| --- | --- | --- |
| closed | boolean | true = cerrado |
| opensAt | string o null | HH:mm de 00:00 a 23:59; null si cerrado |
| closesAt | string o null | HH:mm posterior a opensAt; null si cerrado |

Un intervalo por día, sin cruzar medianoche. Los siete días se ofrecen inicialmente como cerrados y pendientes de confirmar. Esto es una propuesta de configuración, no una afirmación de horarios reales. El servidor debe interpretar estos valores en America/Bogota y no en la zona horaria del servidor.

## Respuestas

Todos los valores son strings obligatorios, de 1–2000 caracteres. Texto literal, con saltos de línea permitidos.

| ID en responses | Uso |
| --- | --- |
| welcome | Saludo inicial |
| outOfHours | Respuesta fuera de horario |
| help | Ayuda para el flujo |
| paymentMethods | Información de pagos confirmada por el negocio |
| deliveryInfo | Información de entregas |
| humanHandoff | Texto al solicitar atención de un vendedor |
| orderReceived | Acuse de recepción de solicitud; no confirma la compra |
| orderPendingConfirmation | Aclaración de total estimado y revisión de disponibilidad, precios, pago y entrega por un vendedor |

**Variables admitidas: ninguna.** El panel rechaza llaves `{` y `}`. El servidor debe enviar los textos como literales, sin buscar placeholders. El resumen de productos, cantidades y total lo construirá el servidor por separado. Estas respuestas no son plantillas de Meta, y guardarlas no crea ni cambia plantillas aprobadas.

Los textos iniciales son propuestas editables. Pagos y entregas se dejan como consulta al vendedor, sin inventar medios de pago, cuentas bancarias, cobertura ni tarifas.

`internalNotificationWhatsApp` solo almacena una configuración. Guardarlo no implementa notificaciones y no supone que el número del bot pueda enviarse mensajes a sí mismo. La confirmación de pedidos pertenece al flujo del vendedor en WhatsApp, no a este panel.

## Documento del producto

| Campo | Tipo | Contrato |
| --- | --- | --- |
| schemaVersion | number entero | 1 |
| sku | string | Código obligatorio, 1–80 caracteres; comparación sin distinción de mayúsculas en panel |
| name | string | 1–160 caracteres |
| description | string | 0–500 caracteres |
| category | string | 1–100 caracteres |
| unit | string | Unidad comercial, 1–60 caracteres, por ejemplo unidad o metro |
| priceCOP | number o null | COP, de 0 a 1e12, máximo 2 decimales. null = precio pendiente; 0 es un valor explícito |
| availability | string enum | available, unavailable o check |
| active | boolean | Los nuevos empiezan false; se puede activar explícitamente |
| sortOrder | number entero | 0–1000000; orden ascendente |
| allowDecimalQuantity | boolean | false = cantidad entera positiva; true = positiva con hasta 2 decimales |
| revision | number entero | Incrementado en cada escritura |
| createdAt / updatedAt | Firestore Timestamp | Reloj del servidor |
| createdBy / updatedBy | string UID | Autor del cambio |

En la UI, `available` significa “Disponible según el negocio”; `unavailable`, “No disponible”; `check`, “Consultar disponibilidad”. No representan existencias numéricas, reservas ni sincronización con Sicar.

El ID es la clave del documento, **no un campo que deba almacenarse dentro**. Se exporta como `productId` para relacionar filas del CSV.

Para el servidor del bot:

- Ocultar productos con active=false.
- Nunca convertir priceCOP=null, ausente o inválido en cero.
- Un precio pendiente necesita confirmación de vendedor y no puede sumarse como gratuito a un total.
- Validar cantidad: mayor que cero; enteros si allowDecimalQuantity=false; hasta 2 decimales si true. El validador compartido del panel acepta 0.01–1000000; adoptar esta validación o acordar otro límite antes de implementar el servidor.
- Calcular montos con precisión monetaria (centavos enteros o decimal), evitando errores de punto flotante.
- Ordenar por sortOrder y, en empate, nombre/ID de forma estable.
- No interpretar disponibilidad declarada como garantía de existencia o de entrega.
- Validar nuevamente los datos y cantidades del cliente en el servidor. Los tipos se validan en la UI; las reglas entregadas controlan acceso, no el esquema.
- El panel detecta códigos duplicados al editar y al revisar CSV sobre el catálogo cargado. No se promete unicidad global de sku frente a creaciones simultáneas. La identidad y referencias del bot deben depender de productId; si se requiere unicidad fuerte, acordar una estrategia adicional sin abrir permisos.

## Escrituras, concurrencia y seguridad

Las escrituras utilizan transacciones. Cada edición compara una huella del documento leído con el actual; si cambió, se rechaza y se pide recargar. La actualización rápida de precios modifica únicamente priceCOP y metadatos. Los campos ajenos al formulario se conservan con update; los mapas schedule y responses se reemplazan por su contrato completo.

El servidor debe actualizar updatedAt/updatedBy y revision cuando cambie estas rutas. Para cambios de servidor se puede usar una identidad de servicio descriptiva en updatedBy, sin exponer credenciales. No utilizar el navegador para escribir órdenes ni añadir órdenes a los documentos de configuración.

Único UID web autorizado: `UNVzgzxtFFPP52WaOImlzrMRhiV2`. Todos los negocios comparten inicialmente este administrador. No hay acceso de propietarios o vendedores al panel. El contenido visible de /admin/bots/ es la pantalla de acceso; los datos están protegidos por Authentication y reglas.

**No se necesita cambiar ni ampliar rutas de reglas.** `firestore.rules` reproduce el alcance solicitado: UID exclusivo en negocios y productos; resto denegado. No se ha leído ni modificado la versión publicada en la consola. Si sus reglas ya tienen ese alcance, conservarlas. El panel no utiliza otras colecciones.

El Admin SDK del futuro servidor utiliza permisos de servidor y no depende de estas reglas de clientes. En ese servidor también deberán validarse el negocio, las cantidades, el catálogo y las autorizaciones.

## CSV

Columnas exactas (pueden reordenarse, pero deben estar todas y no repetirse):

`productId;sku;name;description;category;unit;priceCOP;availability;active;sortOrder;allowDecimalQuantity`

- UTF-8 con BOM en exportación, separador ; y comillas dobles; soporta comillas y saltos de línea dentro de celdas. Acepta también CSV separado por coma.
- Crear: productId vacío; se genera un ID nuevo.
- Editar: productId existente. Un ID desconocido genera error; no crea silenciosamente una copia.
- En Excel, configurar sku y productId como texto para conservar códigos con ceros iniciales.
- Booleanos: `true` y `false` en minúsculas.
- priceCOP vacío = null; `0` = cero. Números sin separadores de miles, con punto o coma decimal de hasta 2 posiciones.
- Importación con cualquier error: no se habilita el guardado hasta corregir y volver a cargar.
- Se muestra campo por campo antes → después. No se eliminan productos ausentes.
- Guardado en grupos de hasta 100; cada grupo es atómico. Si un grupo posterior falla, los anteriores permanecen guardados y la UI indica cuántos se confirmaron. Esto no limita el tamaño del catálogo.
- Límite de archivo: 5 MB; dividir archivos más grandes. El catálogo no tiene límite de 40 productos.
- Exporta todo el catálogo almacenado, independientemente de filtros visuales. No exporta precios que aún no se guardaron.
- Los textos con prefijos de fórmula se exportan con apóstrofo protector para Excel. El importador deshace este escape. Para textos cuyo apóstrofo inicial sea parte del dato, revisar el valor en la vista previa antes de guardar.
- Los CSV exportados contienen información del negocio. Descargar un archivo es una copia manual, no un sistema de respaldo automático.

## Dependencias

SDK Firebase web 12.19.0 empaquetado localmente en firebase-sdk.mjs; no requiere npm ni compilación en Netlify para funcionar. No importa ni inicializa Analytics.
Authentication utiliza persistencia de sesión; el catálogo se consulta desde Firestore, sin almacenamiento persistente local.

Fuentes técnicas: [Firebase web](https://firebase.google.com/docs/web/setup), [transacciones](https://firebase.google.com/docs/firestore/manage-data/transactions), [emuladores y reglas](https://firebase.google.com/docs/rules/unit-tests), [persistencia de Auth](https://firebase.google.com/docs/auth/web/auth-state-persistence).
