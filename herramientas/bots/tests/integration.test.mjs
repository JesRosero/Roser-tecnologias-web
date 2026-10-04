import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import * as fsdk from 'firebase/firestore';
import * as authSdk from 'firebase/auth';
import {initializeApp,deleteApp} from 'firebase/app';
import {initializeApp as adminInitialize,deleteApp as adminDelete} from 'firebase-admin/app';
import {getAuth as adminAuth} from 'firebase-admin/auth';
import {JSDOM} from 'jsdom';
import {createRepository} from '../../../admin/bots/repository.mjs';
import {mountPanel} from '../../../admin/bots/controller.mjs';
import {ADMIN_UID,businessDefaults,blankProduct,validateProduct,fingerprint,exportCSV,prepareImport} from '../../../admin/bots/model.mjs';
const projectId='demo-roser-bots';
const rules=await readFile(new URL('../firestore.rules',import.meta.url),'utf8');
const p=()=>validateProduct({...blankProduct(),sku:'TEST-1',name:'Producto de prueba inactivo',category:'Pruebas',priceCOP:2000});
async function until(fn,label='condición',ms=12000){
  const start=Date.now();while(Date.now()-start<ms){if(fn())return;await new Promise(r=>setTimeout(r,20));}
  throw new Error('No se cumplió: '+label);
}
test('reglas, repositorio y panel con Firestore/Auth emulados',async t=>{
  const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8188,rules}});
  t.after(()=>env.cleanup());
  await env.clearFirestore();
  const db=env.authenticatedContext(ADMIN_UID).firestore();
  const ref=fsdk.doc(db,'businesses','ferreteria-johns');
  const repository=createRepository(fsdk,db,ADMIN_UID);
  const id=repository.newProductId('ferreteria-johns');
  await t.test('administrador accede solo a negocios y productos; anónimo y otros UID rechazados',async()=>{
    await assertSucceeds(fsdk.setDoc(ref,businessDefaults()));
    await assertSucceeds(fsdk.setDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id),p()));
    for(const ctx of [env.unauthenticatedContext(),env.authenticatedContext('otro-uid')]){
      const denied=ctx.firestore();
      for(const path of ['businesses/ferreteria-johns','businesses/ferreteria-johns/products/'+id]){
        await assertFails(fsdk.getDoc(fsdk.doc(denied,path)));
        await assertFails(fsdk.setDoc(fsdk.doc(denied,path),{name:'No autorizado'}));
      }
      await assertFails(fsdk.getDocs(fsdk.collection(denied,'businesses')));
    }
    for(const path of ['orders/one','businesses/ferreteria-johns/orders/one','businesses/ferreteria-johns/products/'+id+'/private/one','users/one']){
      await assertFails(fsdk.getDoc(fsdk.doc(db,path)));
      await assertFails(fsdk.setDoc(fsdk.doc(db,path),{value:true}));
    }
  });
  await t.test('guardar, recargar, conservar ID/metadatos, precio parcial y conflicto atómico',async()=>{
    let loaded=await repository.load('ferreteria-johns');
    await repository.saveBusiness('ferreteria-johns',{...businessDefaults(),commercialName:'Ferretería de prueba'},fingerprint(loaded.business));
    loaded=await repository.load('ferreteria-johns');
    assert.equal(loaded.business.updatedBy,ADMIN_UID);assert.equal(loaded.business.revision,1);
    await repository.saveProducts('ferreteria-johns',[{id,data:{...p(),name:'Nombre editado'},expected:fingerprint(loaded.products[0].data)}]);
    const r2=createRepository(fsdk,db,ADMIN_UID);loaded=await r2.load('ferreteria-johns');
    assert.equal(loaded.products[0].id,id);assert.equal(loaded.products[0].name,'Nombre editado');
    const baseline=fingerprint(loaded.products[0].data);
    await fsdk.updateDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id),{description:'Edición de otra computadora',serverField:'Conservar'});
    await assert.rejects(()=>repository.saveProducts('ferreteria-johns',[{id,data:{priceCOP:0},expected:baseline}]),e=>e.code==='conflict');
    loaded=await r2.load('ferreteria-johns');
    await repository.saveProducts('ferreteria-johns',[{id,data:{priceCOP:0},expected:fingerprint(loaded.products[0].data)}]);
    loaded=await r2.load('ferreteria-johns');assert.equal(loaded.products[0].priceCOP,0);assert.equal(loaded.products[0].description,'Edición de otra computadora');assert.equal(loaded.products[0].serverField,'Conservar');
    const newId=repository.newProductId('ferreteria-johns');
    await assert.rejects(()=>repository.saveProducts('ferreteria-johns',[
      {id:newId,data:{...p(),sku:'TEST-NEW'},expected:null},
      {id,data:{priceCOP:99},expected:'stale'}
    ]),e=>e.code==='conflict');
    assert.equal((await fsdk.getDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+newId))).exists(),false);
    const csv=exportCSV([{...loaded.products[0],priceCOP:null},{...p(),id:'',sku:'TEST-IMPORT'}]);
    const plan=prepareImport(csv,loaded.products);assert.equal(plan.errors.length,0);
    await repository.saveProducts('ferreteria-johns',plan.changes.map(c=>({...c,id:c.id??repository.newProductId('ferreteria-johns')})));
    loaded=await r2.load('ferreteria-johns');assert.equal(loaded.products.length,2);assert.equal(loaded.products.find(p=>p.id===id).priceCOP,null);
  });
  process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9199';
  const admin=adminInitialize({projectId},'emulator-admin');
  t.after(()=>adminDelete(admin));
  await fetch('http://127.0.0.1:9199/emulator/v1/projects/'+projectId+'/accounts',{method:'DELETE'});
  await adminAuth(admin).createUser({uid:ADMIN_UID,email:'admin@example.test',password:'Testing-123456'});
  await adminAuth(admin).createUser({uid:'otro-uid',email:'other@example.test',password:'Testing-123456'});
  const app=initializeApp({projectId,apiKey:'emulator-only',authDomain:projectId+'.firebaseapp.com'},'ui-emulator');
  const auth=authSdk.getAuth(app);authSdk.connectAuthEmulator(auth,'http://127.0.0.1:9199',{disableWarnings:true});
  const liveDB=fsdk.getFirestore(app);fsdk.connectFirestoreEmulator(liveDB,'127.0.0.1',8188);
  t.after(async()=>{await fsdk.terminate(liveDB);await deleteApp(app);});
  const source=await readFile(new URL('../../../admin/bots/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(source,{url:'http://localhost/admin/bots/'});
  dom.window.confirm=()=>true;
  for(const dialog of dom.window.document.querySelectorAll('dialog')){dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};}
  const sdk={...fsdk,...authSdk,setPersistence:(a)=>authSdk.setPersistence(a,authSdk.inMemoryPersistence),browserSessionPersistence:authSdk.inMemoryPersistence};
  const controller=mountPanel({sdk,auth,db:liveDB,document:dom.window.document,window:dom.window});
  t.after(()=>{controller.dispose();dom.window.close();});
  const $=id=>dom.window.document.getElementById(id);
  const submit=id=>$(id).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));
  await t.test('pantalla de acceso, rechazo de UID, login, recuperación y logout',async()=>{
    await until(()=>!$('login-section').hidden,'login inicial');
    $('login-form').elements.email.value='other@example.test';$('login-form').elements.password.value='Testing-123456';submit('login-form');
    await until(()=>!$('denied').hidden,'usuario no autorizado');
    assert.equal($('workspace').hidden,true);assert.equal($('products-table').children.length,0);
    await until(()=>!$('logout').disabled);$('logout').click();
    await until(()=>!$('login-section').hidden);
    $('login-email').value='admin@example.test';$('reset-password').click();
    await until(()=>$('status').textContent.includes('instrucciones de recuperación'));
    const oob=await fetch('http://127.0.0.1:9199/emulator/v1/projects/'+projectId+'/oobCodes').then(r=>r.json());assert.ok(oob.oobCodes.length>0);
    $('login-form').elements.password.value='Wrong-password';submit('login-form');
    await until(()=>$('status').dataset.kind==='error');assert.equal($('workspace').hidden,true);
    $('login-form').elements.password.value='Testing-123456';submit('login-form');
    await until(()=>$('status').textContent==='Datos cargados desde Firestore.','login admin');
    assert.equal($('workspace').hidden,false);assert.equal($('login-form').elements.password.value,'');
  });
  await t.test('crear producto por formulario y editar precio desde la tabla',async()=>{
    $('new-product').click();const form=$('product-form');
    for(const [k,v] of Object.entries({...p(),sku:'UI-1',name:'Desde el panel',priceCOP:''})){
      const f=form.elements.namedItem(k);if(f.type==='checkbox')f.checked=v;else f.value=v??'';
    }
    submit('product-form');await until(()=>$('status').textContent==='Producto guardado en Firestore.');
    let result=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');
    const created=result.products.find(p=>p.sku==='UI-1');assert.equal(created.priceCOP,null);assert.equal(created.active,false);
    const input=$('products-table').querySelector('[data-product-id="'+created.id+'"] input');input.value='0';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    $('save-prices').click();await until(()=>$('status').textContent==='Precios guardados en Firestore.');
    result=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');assert.equal(result.products.find(p=>p.id===created.id).priceCOP,0);
    $('refresh').click();await until(()=>$('status').textContent==='Datos cargados desde Firestore.');
    assert.ok($('products-table').textContent.includes('Desde el panel'));
  });
  await t.test('editar producto y negocio, filtros y vista previa sin enviar mensajes',async()=>{
    const row=Array.from($('products-table').rows).find(r=>r.textContent.includes('UI-1'));
    row.querySelector('button').click();$('product-form').elements.name.value='Nombre actualizado en editor';
    submit('product-form');await until(()=>$('status').textContent==='Producto guardado en Firestore.');
    const after=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');
    assert.equal(after.products.filter(p=>p.sku==='UI-1').length,1);
    assert.equal(after.products.find(p=>p.sku==='UI-1').name,'Nombre actualizado en editor');
    $('search').value='UI-1';$('search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    assert.equal($('products-table').rows.length,1);
    $('search').value='';$('search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    $('tab-business').click();$('business-form').elements.welcome.value='Bienvenido. Respuesta editada.';
    $('business-form').elements.welcome.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    assert.equal($('preview-text').textContent,'Bienvenido. Respuesta editada.');
    submit('business-form');await until(()=>$('status').textContent==='Negocio y respuestas guardados en Firestore.');
    const persisted=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');
    assert.equal(persisted.business.responses.welcome,'Bienvenido. Respuesta editada.');
    $('tab-products').click();
  });
  await t.test('conflicto en UI no anuncia guardado y conserva cambios pendientes',async()=>{
    const row=Array.from($('products-table').rows).find(r=>r.textContent.includes('UI-1'));
    const id=row.dataset.productId,input=row.querySelector('input');
    input.value='88';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    await fsdk.updateDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id),{priceCOP:777,description:'Actualización paralela'});
    $('save-prices').click();await until(()=>$('status').dataset.kind==='error');
    assert.ok($('status').textContent.includes('cambió'));
    assert.equal($('products-table').querySelector('[data-product-id="'+id+'"] input').value,'88');
    assert.equal((await fsdk.getDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id))).data().priceCOP,777);
    $('refresh').click();await until(()=>$('status').textContent==='Datos cargados desde Firestore.');
  });
  await t.test('CSV revisión y confirmación en UI, sin borrar ausentes',async()=>{
    const source=exportCSV([{...p(),id:'',sku:'UI-CSV',name:'Importado desde revisión'}]);
    Object.defineProperty($('import-file'),'files',{configurable:true,value:[{size:source.length,text:async()=>source}]});
    $('import-file').dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    await until(()=>!$('import-review').hidden);assert.ok($('import-details').textContent.includes('Importado desde revisión'));
    await until(()=>!$('confirm-import').disabled);$('confirm-import').click();
    await until(()=>$('status').textContent.startsWith('Importación guardada:'));
    const persisted=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');
    assert.equal(persisted.products.length,4);assert.ok(persisted.products.some(p=>p.sku==='UI-1'));
  });
  await authSdk.signOut(auth);await until(()=>$('workspace').hidden);
  assert.equal($('products-table').children.length,0);
});
