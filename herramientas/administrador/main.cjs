const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const perfil = path.join(root, '.roser-local/administrador/perfil');
require('node:fs').mkdirSync(perfil, { recursive: true });
app.setPath('userData', perfil);
if (process.platform === 'win32') app.setAppUserModelId('com.rosertecnologias.administrador');
const origin = 'http://127.0.0.1:8088';
let win,
  servidor,
  terminando = false;
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
  function externo(url) {
    try {
      const u = new URL(url);
      if (
        ['https:', 'mailto:', 'tel:'].includes(u.protocol) ||
        (u.origin === origin && !u.pathname.startsWith('/admin/'))
      )
        shell.openExternal(url);
    } catch {}
  }
  app.whenReady().then(async () => {
    try {
      const { iniciarServidor } = await import(
        pathToFileURL(path.join(root, 'herramientas/servidor-local/iniciar.mjs')).href
      );
      servidor = await iniciarServidor(root, 8088);
      win = new BrowserWindow({
        width: 1320,
        height: 900,
        minWidth: 760,
        minHeight: 580,
        title: 'Administrador Roser',
        icon: path.join(__dirname, 'roser-administrador-transparente.ico'),
        backgroundColor: '#101e32',
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
      });
      win.webContents.setWindowOpenHandler(({ url }) => {
        externo(url);
        return { action: 'deny' };
      });
      win.webContents.on('will-navigate', (event, url) => {
        try {
          const u = new URL(url);
          if (u.origin !== origin || !u.pathname.startsWith('/admin/')) {
            event.preventDefault();
            externo(url);
          }
        } catch {
          event.preventDefault();
        }
      });
      win.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) =>
        callback(false),
      );
      win.webContents.on('will-prevent-unload', (event) => {
        const r = dialog.showMessageBoxSync(win, {
          type: 'question',
          buttons: ['Seguir editando', 'Descartar y salir'],
          defaultId: 0,
          cancelId: 0,
          title: 'Cambios sin guardar',
          message: 'Hay cambios sin guardar. ¿Quieres descartarlos?',
        });
        if (r === 1) event.preventDefault();
      });
      await win.loadURL(origin + '/admin/panel.html');
    } catch (e) {
      dialog.showErrorBox(
        'No se pudo abrir Administrador Roser',
        e.code === 'EADDRINUSE'
          ? 'El servidor anterior usa el puerto 8088. Cierra esa consola una vez y vuelve a abrir Administrador Roser.'
          : String(e.message),
      );
      if (servidor) await servidor.cerrar();
      app.quit();
    }
  });
  app.on('window-all-closed', async () => {
    if (terminando) return;
    terminando = true;
    if (servidor) await servidor.cerrar();
    app.quit();
  });
}
