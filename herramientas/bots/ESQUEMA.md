# Contrato de datos · Roser Bots Admin · esquema 1 ampliado

Proyecto `roser-tecnologias-bots`, Firestore `(default)`. Región pendiente de comprobar en consola. Este panel configura el bot; no almacena clientes, pedidos, comprobantes, conversaciones ni carritos. Meta y el servidor pertenecen al otro trabajo.

## Rutas e identidades

- `businesses/{businessId}`
- `businesses/{businessId}/products/{productId}`
- NUEVA: `businesses/{businessId}/promotions/{promotionId}`
- Primer negocio: `ferreteria-johns`, Ferretería John's, `+573168026222`.
- businessId: estable, hasta 80 caracteres, minúsculas, números y guiones (`mi-negocio`). El nombre comercial admite tildes y espacios.
- productId/promotionId: IDs autogenerados de Firestore, permanentes. No se duplican como campos dentro del documento ni cambian al renombrar.
- `schemaVersion` continúa siendo `1`. Las ampliaciones son opcionales al leer documentos antiguos. El servidor debe utilizar los valores seguros indicados y no inventar configuraciones comerciales ausentes.

## Metadatos compartidos

Negocios, productos y promociones: `revision` entero positivo incrementado por escritura; `updatedAt` Timestamp del servidor; `updatedBy` string UID. En altas: `createdAt` Timestamp del servidor, `createdBy` string UID. El panel conserva metadatos de creación al editar.

Todas las operaciones usan transacciones y comparan una huella del documento completo. Una edición de precio actualiza solo `priceCOP` y metadatos. Una edición de cargue en lote actualiza solo `loadingUnloadingExtraApplies` y metadatos. Un cambio paralelo rechaza el grupo en vez de sobrescribir silenciosamente.

El servidor también debe mantener `revision`, `updatedAt` y `updatedBy` si modifica configuración. Puede usar una identidad descriptiva de servicio en `updatedBy`; nunca exponer sus credenciales. Admin SDK no queda limitado por estas reglas de clientes.

## Negocio y horarios

| Campo | Tipo y límite |
|---|---|
| schemaVersion | entero 1 |
| commercialName | string obligatorio, 1–160 |
| customerWhatsApp | string E.164, + y 8–15 dígitos |
| internalNotificationWhatsApp | string E.164 o null, heredado; no utilizado por este recorrido |
| address | string, 0–500 |
| locationUrl | string HTTPS o vacío, máximo 1000 |
| timezone | `America/Bogota` |
| schedule | map de mon/tue/wed/thu/fri/sat/sun |
| responses | map de textos literales |
| delivery | map nuevo, opcional en documentos antiguos |
| payments | map nuevo, opcional en documentos antiguos |

El campo interno se retiró del formulario. Su valor existente se conserva exactamente al editar otros apartados. No se configura envío de alertas a otros números.

Cada día: `{closed:boolean, opensAt:string HH:mm|null, closesAt:string HH:mm|null}`. Un intervalo diario, sin cruzar medianoche; cierre posterior a apertura. Cerrado = ambas horas null.

Para John's SIN configuración: propuesta acordada de 08:00–17:00 los siete días. Otros negocios nuevos: cerrados hasta configurar. Los horarios ya guardados no se reemplazan. «Aplicar el mismo horario a todos los días» cambia solo el formulario, solicita confirmación y requiere guardar después. La atención automática recibe consultas 24 horas; la atención personal usa este horario.

## Respuestas

Strings obligatorios 1–2000 caracteres, literales con saltos de línea. No se admiten llaves ni variables. Identificadores:

| ID | Uso |
|---|---|
| welcome | Saludo, atención automática 24h y horario personal |
| outOfHours | Fuera del horario personal; vendedor revisa al abrir |
| help | Ayuda |
| paymentMethods | Texto de orientación sobre pagos |
| deliveryInfo | Texto de orientación sobre entregas |
| humanHandoff | Atención personal en el mismo chat |
| orderReceived | Acuse de recepción de solicitud |
| orderPendingConfirmation | Revisión del vendedor; no confirma una venta |
| customerNamePrompt | Nombre opcional de la consulta |
| productAdded | Producto agregado |
| cartHelp | Ayuda del carrito |
| receiptReasonPrompt | Motivo de pago |
| receiptReferencePrompt | Referencia opcional |
| receiptUploadPrompt | Adjuntar imagen o PDF en WhatsApp |
| receiptReceived | Recepción de comprobante; vendedor verifica |
| noPromotions | Sin promociones publicadas |

Textos iniciales exactos: `businessDefaults` en `admin/bots/model.mjs`. Los existentes se conservan; los faltantes se presentan como propuestas y se guardan solo al confirmar. Las claves desconocidas de responses también se conservan al editar.

Variables definitivas: NINGUNA. Nombre, producto, cantidad, total, referencia y horario se construyen aparte en el servidor. Estos textos no son plantillas aprobadas de Meta. El panel no edita botones ni flujos.

Los textos antiguos `paymentMethods` y `deliveryInfo` se conservan como introducción/orientación. Los datos concretos están en `payments` y `delivery`; el servidor debe implementar su presentación y evitar usar respuestas antiguas como fuente de tarifas o cuentas.

## Productos

| Campo | Tipo y límite |
|---|---|
| schemaVersion | entero 1 |
| sku | string obligatorio, 1–80 |
| name | string obligatorio, 1–160 |
| description | string 0–500 |
| category | string obligatorio 1–100; espacios exteriores eliminados y espacios internos repetidos normalizados |
| unit | string obligatorio 1–60 |
| priceCOP | number 0–1e12, hasta 2 decimales; null = por consultar |
| availability | `available`, `unavailable` o `check` |
| active | boolean; nuevos false |
| sortOrder | entero 0–1000000 |
| allowDecimalQuantity | boolean |
| loadingUnloadingExtraApplies | NUEVO boolean, ausencia = false |

`active=false` se oculta al cliente. Precio null/ausente/inválido nunca es gratuito; cero es un valor explícito. La disponibilidad es declarada, sin existencias numéricas ni Sicar.

Cantidad del servidor: 0.01–1000000 positiva; entera si allowDecimalQuantity=false, hasta 2 decimales si true. Montos con centavos enteros o precisión decimal, sin errores de punto flotante. Orden: sortOrder, nombre y luego ID.

El aviso de cargue no calcula cargos. Para ladrillo, farol, arena y mixto, el administrador identifica y marca manualmente los productos; NO hay detección por nombre ni pesos/viajes. Edición individual y en lote. Lotes de hasta 100 por transacción; fallo posterior informa los grupos ya confirmados. No limita el tamaño del catálogo.

Categorías se reutilizan por comparación sin distinguir mayúsculas y con espacios normalizados, tanto en formulario como CSV. No existe colección nueva de categorías. No se migran automáticamente nombres antiguos al cargar.

sku no tiene unicidad global garantizada en creaciones concurrentes: el panel detecta duplicados en la instantánea; el servidor referencia por productId.

## delivery

| Campo | Tipo | Propuesta John's si falta |
|---|---|---|
| pickupEnabled | boolean | true |
| deliveryEnabled | boolean | true |
| freightUpTo300KgCOP | number | 17000 |
| freightOver300UpTo900KgCOP | number | 19000 |
| loadingUnloadingPerTripCOP | number | 15000 |
| conditionsText | string literal obligatorio, hasta 4000 | condiciones acordadas |

Números finitos 0–1e12, hasta dos decimales. Para otros negocios: opciones false y tarifas 0 como propuesta pendiente de configurar, no tarifa autorizada.

Condiciones iniciales John's:

> 🚚 El flete cuesta $17.000 por viaje hasta 300 kg y $19.000 por viaje para cargas de más de 300 y hasta 900 kg. Para cargas mayores, el vendedor determina los viajes necesarios y confirma el costo total.
>
> 🧱 El precio de ladrillo, farol, arena y mixto no incluye cargue ni descargue. Si solicitas ese servicio, tiene un costo adicional de $15.000 por viaje, sujeto a coordinación con el vendedor.
>
> 📍 La entrega se realiza en la puerta de la casa; no incluye ingresar los materiales al domicilio.
>
> El domicilio se realiza después de acordar el pedido con el vendedor y de que este verifique el pago.

Tarifas INFORMATIVAS, no se suman al subtotal. El bot no conoce pesos ni calcula viajes. Resumen: total artículos; flete por confirmar; cargue y descargue por confirmar cuando corresponda. El vendedor determina el costo final y verifica el pago. Cambiar tarifa no reescribe automáticamente conditionsText; el panel pide revisar el texto.

Si delivery falta, el servidor no debe asumir que el negocio ofrece entrega: pedir información al vendedor.

## payments

| Campo | Tipo |
|---|---|
| isExample | boolean |
| instructionsText | string literal obligatorio, 1–4000 |
| imageUrl | URL HTTPS pública o string vacío, máximo 1000 |
| methods | array de 0–20 mapas |

Cada método: `id` string permanente 1–100 (`A-Za-z0-9_-`), `label` string literal 1–160, `detailsText` string literal 1–2000, `active` boolean, `sortOrder` entero 0–1000000. IDs nuevos autogenerados; no editables. Editar, ordenar por número y desactivar, sin borrado definitivo. IDs repetidos se rechazan en el panel.

Propuesta: isExample=true; tres métodos INACTIVOS con IDs `example-bank-transfer`, `example-digital-wallet`, `example-in-store`. Son transferencia, billetera y pago en negocio, con marcadores [BANCO], [TIPO], [NÚMERO DE CUENTA], [TITULAR], etc.; no contienen cuentas reales. Instrucción inicial: «💳 Información de pago de ejemplo. No realices transferencias con estos datos. Consulta al vendedor los medios autorizados.»

Para pasar a datos reales, reemplazar marcadores en métodos activos, desmarcar isExample y confirmar verificación con el negocio. No cambia automáticamente al editar. El servidor NO debe presentar métodos de ejemplo como autorizados: con isExample=true o payments ausente, orientar al vendedor sin instrucciones reales de transferencia. Con false, mostrar solo activos, ordenados por sortOrder e ID.

Vista previa de texto, copiar, URL y vista previa de imagen. La imagen es complementaria; no subir archivos a Storage ni guardar copia. HTTPS no garantiza que una imagen externa sea accesible; se muestra error si falla. No poner tokens, URL firmadas privadas ni secretos en campos del panel. No se procesan ni se aprueban pagos aquí.

## Promociones

Documento `businesses/{businessId}/promotions/{promotionId}`:

| Campo | Tipo |
|---|---|
| schemaVersion | entero 1 |
| title | string literal 1–160 |
| description | string literal 1–4000 |
| imageUrl | HTTPS pública o vacío, máximo 1000 |
| active | boolean; nueva false |
| sortOrder | entero 0–1000000 |
| revision, createdAt, createdBy, updatedAt, updatedBy | metadatos compartidos |

Crear, editar, activar, desactivar, ordenar y previsualizar. Sin borrado definitivo. Solo se muestran activas a petición del cliente; sortOrder, título e ID como desempate. No campañas ni listas de destinatarios. No alteran precios ni subtotal del carrito: cualquier precio promocional se actualiza explícitamente en priceCOP.

El panel carga promociones únicamente al abrir su pestaña. Si faltan permisos publicados, explica que falta la regla y permite trabajar con los otros apartados.

## CSV compatible con Excel

Columnas exportadas exactas:

`productId;sku;name;description;category;unit;priceCOP;availability;active;sortOrder;allowDecimalQuantity;loadingUnloadingExtraApplies`

UTF-8 BOM, separador ; (también acepta coma), comillas/saltos de línea soportados. Todas las columnas antiguas son obligatorias. La NUEVA columna es opcional al importar: ausente conserva el valor actual en actualización y usa false en alta. Si se incluye, debe ser true/false explícito. Columnas pueden reordenarse, sin duplicadas ni desconocidas.

productId vacío crea; ID existente actualiza; ID desconocido se rechaza. Precio vacío=null; 0=cero. Números sin símbolos ni separadores de miles, decimal punto/coma hasta dos posiciones; booleanos true/false. Excel: sku/productId como texto para conservar ceros.

Errores bloquean guardado; revisión antes/después obligatoria. Ausentes nunca se eliminan. Grupos de 100 atómicos con advertencia de guardado parcial. Archivo máximo 5 MB; no límite de 40 productos. Exporta guardados, no borradores ni solo filtros. Textos con prefijos de fórmulas se escapan con apóstrofo y se deshace al importar; revisar apóstrofos literales.

## Seguridad y límites reales de reglas

Único UID `UNVzgzxtFFPP52WaOImlzrMRhiV2`. Sin propietarios/vendedores añadidos. Authentication de sesión; datos consultados desde servidor, sin localStorage como catálogo. Pantalla noindex y sin Analytics.

La NUEVA regla permite exclusivamente al administrador leer/crear/actualizar promotions y deniega borrado. Continúa la denegación global del resto. El archivo entregado conserva el acceso previo de negocios/productos y añade validaciones de:
- delivery: tipos, límites numéricos y texto;
- responses: textos conocidos presentes, longitud y rechazo de llaves;
- products: tipo del aviso de cargue cuando existe;
- payments: tipos del mapa, texto, URL HTTPS y lista de máximo 20;
- promotions: todos los campos y tipos, límites, metadatos y updatedBy del administrador.

Por el límite de evaluación de reglas, la validación completa de cada elemento de methods, IDs duplicados y precisión de dos decimales se realiza en el panel y DEBE repetirse en el servidor. No afirmar que las reglas validan integralmente ese array o todo el esquema antiguo. El UID exclusivo se verifica en reglas, no solo en JavaScript.

No se publicaron reglas ni se escribieron datos reales desde este entorno. Si las reglas actuales en consola tienen validaciones adicionales, conservarlas al incorporar las ampliaciones de este archivo.

## Datos temporales (solo servidor)

Decisión compartida: Firebase permanente conserva únicamente configuración comercial. Sin base de clientes ni historial de pedidos/comprobantes. Carrito/paso temporal expiran tras dos horas de inactividad del cliente; cada mensaje reinicia plazo. Enviar/cancelar descarta borrador. El servidor implementará aparte pausa durante atención humana y prevención de duplicados. Los archivos y resúmenes quedan en WhatsApp. Nada de esto se implementa desde el panel ni cambia automáticamente la política legal publicada.
