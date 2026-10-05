# Entrega al chat del servidor · ampliación del panel

Implementado el contrato solicitado manteniendo schemaVersion=1 y rutas existentes. Actualización preparada en Paso 44; no confundir entrega del ZIP con publicación efectiva de esta ampliación. La versión previa ya permitía inicio de sesión real.

## Rutas

Proyecto `roser-tecnologias-bots`, Firestore `(default)`, región pendiente de comprobar.
- businesses/{businessId}
- businesses/{businessId}/products/{productId}
- NUEVA: businesses/{businessId}/promotions/{promotionId}
- Inicial: ferreteria-johns, Ferretería John's, +573168026222, America/Bogota.

Identificadores de producto/promoción autogenerados y permanentes. CSV usa productId como clave externa; no campo persistido. El único administrador web sigue siendo UNVzgzxtFFPP52WaOImlzrMRhiV2.

## Campos conservados

Negocio: schemaVersion (1), commercialName string, customerWhatsApp E.164, address string, locationUrl HTTPS|vacío, timezone America/Bogota, schedule map, responses map. internalNotificationWhatsApp se retiró de la interfaz y se CONSERVA si ya existía; no utilizarlo en este recorrido.

schedule: mon/tue/wed/thu/fri/sat/sun → {closed:boolean, opensAt:HH:mm|null, closesAt:HH:mm|null}. Propuesta John's sin guardar: 08:00–17:00 todos los días; no reemplaza horarios ya almacenados. Consultas automáticas 24h, atención personal según horario.

Producto: sku, name, description, category, unit (strings); priceCOP number|null; availability available|unavailable|check; active boolean; sortOrder entero; allowDecimalQuantity boolean; schemaVersion=1.

## Ampliaciones

Producto: loadingUnloadingExtraApplies boolean, ausencia=false. Marcar manualmente por producto o lote. No deducir de nombres, no calcular recargo. CSV añade esa columna opcional: CSV anterior conserva valor existente o usa false en altas.

Negocio.delivery:
- pickupEnabled:boolean
- deliveryEnabled:boolean
- freightUpTo300KgCOP:number
- freightOver300UpTo900KgCOP:number
- loadingUnloadingPerTripCOP:number
- conditionsText:string literal

Propuesta John's: true, true, 17000, 19000, 15000 y condiciones acordadas de entrega en puerta sin ingresar materiales, pago verificado y cargue por acuerdo. Se guarda explícitamente. Tarifas informativas: NO sumar al carrito ni calcular pesos/viajes. Si falta mapa, consultar al vendedor.

Negocio.payments:
- isExample:boolean
- instructionsText:string literal
- imageUrl:HTTPS pública|vacío
- methods:array de {id:string permanente, label:string literal, detailsText:string literal, active:boolean, sortOrder:entero}

Propuesta isExample=true, tres métodos de prueba INACTIVOS (transferencia, billetera, pago en negocio), sin números reales. No presentar ejemplos como medios autorizados. Con isExample=false mostrar solo activos; ordenar sortOrder e ID. Imagen complementaria; siempre texto disponible. No subir/comprobar/registrar comprobantes en Firebase.

Promoción:
- schemaVersion:1
- title:string literal
- description:string literal
- imageUrl:HTTPS pública|vacío
- active:boolean (alta false)
- sortOrder:entero
- metadatos comunes

Mostrar únicamente activas cuando cliente consulte; ordenar sortOrder, título e ID. No campañas ni destinatarios. No alteran precios ni subtotales: precio promocional calculable se configura explícitamente en priceCOP.

## Respuestas

Conservadas: welcome, outOfHours, help, paymentMethods, deliveryInfo, humanHandoff, orderReceived, orderPendingConfirmation.
Nuevas: customerNamePrompt, productAdded, cartHelp, receiptReasonPrompt, receiptReferencePrompt, receiptUploadPrompt, receiptReceived, noPromotions.

Todas string literal 1–2000. VARIABLES: NINGUNA. El servidor construye por separado nombre, producto, cantidad, referencia, total y horario. No son plantillas Meta. El panel no programa menús/botones/flujos. Textos iniciales exactos en model.mjs; no sustituyen automáticamente los existentes.

paymentMethods/deliveryInfo se conservan como orientación; información concreta desde payments/delivery. Sin información configurada o con ejemplos, orientar al vendedor.

## Validaciones y metadatos

priceCOP null/ausente nunca gratuito; cero explícito. Precios/tarifas 0–1e12, hasta dos decimales. Cantidad 0.01–1000000, entera salvo allowDecimalQuantity=true (hasta dos decimales). Dinero con precisión decimal o centavos enteros. Ocultar productos inactive; disponibilidad declarada sin Sicar ni existencias reales.

sortOrder 0–1000000 entero. Título/nombre/label 1–160; descripción producto hasta 500; respuestas/detalles métodos hasta 2000; condiciones/instrucciones/descripción promoción hasta 4000; URL hasta1000; methods máximo20. Validar todos los campos nuevamente en servidor.

revision entero incrementado; createdAt/updatedAt Timestamp de servidor; createdBy/updatedBy string. El panel guarda por apartado, conserva otros mapas/campos y detecta conflictos de documento completo. Mantener metadatos también en cambios del servidor. sku no es identidad única global garantizada.

## Reglas

Se entrega firestore.rules completo: mismo UID exclusivo para negocios/productos; NUEVO acceso del administrador a promotions para leer/crear/actualizar, sin borrar. Resto denegado. Validaciones adicionales para mapas, respuestas, cargue y promociones; no acceso público ni a todos los autenticados.

Límite explícito: reglas payments validan mapa, tipos principales, URL y lista máximo20. Elementos de methods, IDs duplicados y precisión decimal se validan en panel y DEBEN validarse en servidor. Admin SDK no se limita por reglas web. Publicar reglas en consola: subir archivo a Git no las publica. No se modificó la consola desde este trabajo.

## Verificación real y pendientes

Pruebas automatizadas con Firebase Auth/Firestore emulados y DOM simulado: permisos, rechazo anónimos/otro UID, campos inválidos, creación/edición de promociones, IDs/revisiones, conflictos, persistencia, precios parciales, cargue en lote, CSV antiguo/nuevo, pagos y vista previa, conservar interno/mapas ajenos, configurar nuevo negocio sin guardar automáticamente.

Pendiente después de copiar/publicar: probar ampliación y reglas en Firebase real, recarga desde otra computadora, correo de recuperación y carga real de imágenes públicas elegidas. Región/appId completo pendientes de comprobación en consola. No se realizaron escrituras en producción ni envíos WhatsApp.

## Datos temporales y alcance del servidor

Solo configuración permanente en Firebase. Sin clientes, historial de solicitudes/pedidos, comprobantes, pagos aprobados o créditos. Borrador de carrito/paso: expirar tras 2h sin mensajes del cliente, reiniciar plazo por cada mensaje y descartar al enviar/cancelar. Pausa mínima de atención humana y prevención de duplicados se implementan aparte en el servidor. Archivos/resúmenes quedan en WhatsApp.

No se implementó desde panel TTL, eliminación histórica, Meta, migración del número, conexión del bot ni envío real. No Analytics, Blaze, Storage ni secretos del servidor en navegador. La nueva decisión de conservación no modifica por sí sola textos legales anteriores: comprobar su coherencia en el trabajo correspondiente.

Contrato completo y límites: ESQUEMA.md. Publicación: PUBLICAR.md. Evidencia: VERIFICACION.md.
