# Cómo ejecutar el sitio web de Roser Tecnologías

## Opción 1: Servidor Python (Recomendado)
1. Haz doble clic en `servidor.bat`
2. Se abrirá una ventana de comandos
3. Ve a tu navegador y abre: http://localhost:8000
4. Para detener el servidor, presiona Ctrl+C en la ventana de comandos

## Opción 2: Live Server (VS Code)
1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## Opción 3: Servidor Node.js
```bash
npx http-server -p 8000
```

## ¿Por qué necesito un servidor?
Los archivos HTML con rutas relativas necesitan un servidor web para funcionar correctamente y evitar errores de CORS y rutas.

## Estructura del proyecto:
```
Roser/
├── index.html (página principal)
├── marketplace/
│   ├── marketplace.html
│   └── productos/
│       ├── producto-organizador-magnetico.html
│       ├── producto-caja-tactica.html
│       └── ...
└── servidor.bat (ejecutar este archivo)
```