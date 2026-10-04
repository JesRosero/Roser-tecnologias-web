# Resumen para el chat del servidor del bot

El panel privado de Roser Bots está programado en /admin/bots/ y se integra en el administrador con herramientas/bots/integrar-admin.mjs. Guarda en Firestore y no implementa pedidos, conversaciones ni carritos web. El vendedor continúa gestionando las solicitudes desde WhatsApp.

Proyecto Firebase: roser-tecnologias-bots; base (default). Región pendiente de comprobar en consola.
Negocio inicial: businesses/ferreteria-johns.
Número del cliente/bot: +573168026222, todavía sin conexión ni migración realizada por este trabajo.
Productos: businesses/ferreteria-johns/products/{productId}. IDs autogenerados permanentes.

Esquema definitivo v1:

- Negocio: schemaVersion:number=1, commercialName:string, customerWhatsApp:string E.164, internalNotificationWhatsApp:string E.164|null, address:string, locationUrl:string https|vacío, timezone:string=America/Bogota, schedule:map, responses:map.
- schedule: mon/tue/wed/thu/fri/sat/sun → {closed:boolean, opensAt:string HH:mm|null, closesAt:string HH:mm|null}. Un intervalo por día, no nocturno.
- responses: welcome, outOfHours, help, paymentMethods, deliveryInfo, humanHandoff, orderReceived, orderPendingConfirmation. Todos string.
- Variables definitivas: **ninguna**. Enviar estos textos como literales. Resumen, carrito y total los construye el servidor aparte. No son plantillas aprobadas de Meta.
- Producto: schemaVersion:number=1, sku:string, name:string, description:string, category:string, unit:string, priceCOP:number|null, availability:'available'|'unavailable'|'check', active:boolean, sortOrder:number entero, allowDecimalQuantity:boolean.
- Metadatos en ambos: revision:number entero, updatedAt:Timestamp del servidor, updatedBy:string; en altas createdAt:Timestamp, createdBy:string.
- ID de documento como referencia; productId se usa en CSV, no se duplica como campo persistido.

Reglas: sin cambio de rutas ni ampliación de permisos. Solo UID UNVzgzxtFFPP52WaOImlzrMRhiV2 lee/escribe businesses/{businessId} y products/{productId}; resto denegado al cliente web. Se entrega firestore.rules como referencia del alcance, no se publicaron reglas en consola.

Contrato necesario del servidor:

1. No mostrar active=false; no interpretar priceCOP=null/ausente como gratuito. Un total con productos sin precio necesita atención de vendedor.
2. Validar cantidades positivas: enteras o hasta 2 decimales según allowDecimalQuantity; validador v1 del panel: 0.01–1000000. Precios 0–1e12, hasta 2 decimales.
3. availability es una declaración simple, sin inventario de Sicar ni garantía de existencia. Pedido, pago y entrega requieren confirmación de vendedor.
4. Leer timezone y schedule en America/Bogota. Revisar configuración real antes de habilitar atención; defaults cerrados y textos propuestos no son datos comerciales confirmados.
5. Definir el envío a vendedores usando un mecanismo válido. internalNotificationWhatsApp es independiente, opcional y no habilita mensajes a sí mismo.
6. El servidor conserva autoridad sobre pedidos y carritos en WhatsApp. Este panel nunca confirma órdenes.
7. Actualizar revision/updatedAt/updatedBy al modificar configuración. Panel usa transacciones y rechaza escrituras basadas en documentos antiguos; no sobrescribe otros campos al cambiar solo precio.
8. Validar esquema y permisos también en servidor; Admin SDK no está limitado por reglas de clientes. sku no es una clave única garantizada globalmente bajo concurrencia: usar productId para referencias.
9. Configurar aviso/autorización, conservación y eliminación en el servidor. Este panel no trata conversaciones ni ejecuta borrado de ellas.

Estado de verificación: reglas y comportamiento del panel probados con Auth/Firestore emulados y DOM simulado. Falta comprobar cuenta, reglas y configuración reales tras publicar; también appId completo y región en consola. El appId recibido para el panel fue 1:98750045174:web y no se inventó su sufijo.

No se activó Analytics, Blaze, Functions ni Storage; no se copiaron tokens de Meta ni claves de servicio al cliente. No se tocó el número de WhatsApp, su cuenta Business/Web ni el registro con Meta.

Detalle completo de tipos, límites y CSV: ESQUEMA.md. Instrucciones de publicación: PUBLICAR.md. Pruebas y límites: VERIFICACION.md.
