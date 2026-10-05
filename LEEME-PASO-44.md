# Paso 44 · Panel Bots ampliado

Extraer este ZIP sobre la raíz de tu proyecto. Reemplazar solo archivos incluidos; conserva tu firebase-config.mjs, SDK, _redirects y administrador local.

Implementado:
- Seis apartados: negocio/horarios, productos, respuestas, entregas/cargue, pagos y promociones.
- Horario común aplicable sin sobrescribir al abrir.
- 16 respuestas y vista previa sin enviar.
- Tarifas informativas 17000/19000/15000 para John's, pendientes de guardar si faltaban.
- Pago de ejemplo con métodos inactivos, URL/imagen complementaria y copiar texto.
- Cargue individual/en lote; CSV antiguo/nuevo compatible.
- Promociones con IDs estables, activar/desactivar y ordenar.
- Guardados por apartado, metadatos, conflictos, persistencia Firestore.
- Sin enlace roto a /admin/ en el panel publicado; ayuda para configurar negocio e identificador.

ANTES de usar promociones: publicar herramientas/bots/firestore.rules en Firestore → Reglas del proyecto roser-tecnologias-bots (default). Conservar validaciones adicionales que hubiera en tus reglas actuales. Subir ese archivo a Git no lo publica en Firebase.

Instrucciones exactas: herramientas/bots/PUBLICAR.md.
Contrato: herramientas/bots/ESQUEMA.md.
Resumen para devolver al otro chat: herramientas/bots/PARA-CHAT-BOT.md.
Pruebas realizadas y pendientes: herramientas/bots/VERIFICACION.md.

No se ha publicado esta actualización desde este entorno. Pruebas completadas en Firebase emulado/DOM simulado; verificar Firebase real después de publicar. No se modificó Meta ni se conectó el bot. No hay base de clientes/pedidos ni archivos de comprobantes en este panel.
