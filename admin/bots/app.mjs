import {firebaseConfig} from './firebase-config.mjs';
import {mountPanel} from './controller.mjs';
try {
  const sdk=await import('./firebase-sdk.mjs');
  const app=sdk.initializeApp(firebaseConfig,'roser-bots-admin');
  const auth=sdk.getAuth(app),db=sdk.getFirestore(app);
  auth.languageCode='es';
  // Sin Analytics, sin persistencia del catálogo en el navegador y sin credenciales del servidor.
  mountPanel({sdk,auth,db});
} catch(e) {
  const status=document.getElementById('status');status.dataset.kind='error';
  status.textContent='No se pudo iniciar el panel. Comprueba que se publicaron todos los archivos de /admin/bots/ y tu conexión. '+(e.code??'');
}
