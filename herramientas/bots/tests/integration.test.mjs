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
import {ADMIN_UID,businessDefaults,blankProduct,validateProduct,fingerprint,exportCSV,prepareImport,deliveryDefaults,paymentsDefaults,validatePromotion,validatePayments} from '../../../admin/bots/model.mjs';
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
      for(const path of ['businesses/ferreteria-johns','businesses/ferreteria-johns/products/'+id,'businesses/ferreteria-johns/promotions/test']){
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
  await t.test('ampliaciones: validación de reglas, promociones, metadatos y conservación de mapas',async()=>{
    let current=await repository.load('ferreteria-johns');
    await repository.saveBusiness('ferreteria-johns',{delivery:deliveryDefaults('ferreteria-johns'),payments:validatePayments(paymentsDefaults())},fingerprint(current.business));
    current=await repository.load('ferreteria-johns');const old=current.business;
    await repository.saveBusiness('ferreteria-johns',{commercialName:'Ferretería de prueba'},fingerprint(old));
    current=await repository.load('ferreteria-johns');assert.deepEqual(current.business.delivery,old.delivery);assert.deepEqual(current.business.payments,old.payments);
    await assertFails(fsdk.updateDoc(ref,{'delivery.freightUpTo300KgCOP':-1}));
    await assertFails(fsdk.updateDoc(ref,{'payments.isExample':'true'}));
    await assertFails(fsdk.updateDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id),{loadingUnloadingExtraApplies:'true'}));
    const pid=repository.newPromotionId('ferreteria-johns'),data=validatePromotion({title:'Promoción de prueba',description:'Solo pruebas',imageUrl:'',sortOrder:0,active:false});
    await repository.savePromotions('ferreteria-johns',[{id:pid,data,expected:null}]);
    let promos=await repository.loadPromotions('ferreteria-johns');const found=promos.find(p=>p.id===pid);assert.equal(found.createdBy,ADMIN_UID);assert.equal(found.revision,1);
    await repository.savePromotions('ferreteria-johns',[{id:pid,data:{active:true},expected:fingerprint(found.data)}]);
    promos=await createRepository(fsdk,db,ADMIN_UID).loadPromotions('ferreteria-johns');assert.equal(promos.find(p=>p.id===pid).revision,2);
    await assert.rejects(()=>repository.savePromotions('ferreteria-johns',[{id:pid,data:{title:'Stale'},expected:fingerprint(found.data)}]),e=>e.code==='conflict');
    await assertFails(fsdk.setDoc(fsdk.doc(db,'businesses/ferreteria-johns/promotions/invalid'),{title:'Incompleta'}));
    await assertFails(fsdk.deleteDoc(fsdk.doc(db,'businesses/ferreteria-johns/promotions/'+pid)));
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
    const input=$('products-table').querySelector('[data-product-id="'+created.id+'"] input[type=text]');input.value='0';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
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
    $('tab-responses').click();$('responses-form').elements.welcome.value='Bienvenido. Respuesta editada.';
    $('responses-form').elements.welcome.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    assert.equal($('preview-text').textContent,'Bienvenido. Respuesta editada.');
    submit('responses-form');await until(()=>$('status').textContent==='Respuestas guardadas en Firestore.');
    const persisted=await createRepository(fsdk,liveDB,ADMIN_UID).load('ferreteria-johns');
    assert.equal(persisted.business.responses.welcome,'Bienvenido. Respuesta editada.');
    $('tab-products').click();
  });
  await t.test('conflicto en UI no anuncia guardado y conserva cambios pendientes',async()=>{
    const row=Array.from($('products-table').rows).find(r=>r.textContent.includes('UI-1'));
    const id=row.dataset.productId,input=row.querySelector('input[type=text]');
    input.value='88';input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    await fsdk.updateDoc(fsdk.doc(db,'businesses/ferreteria-johns/products/'+id),{priceCOP:777,description:'Actualización paralela'});
    $('save-prices').click();await until(()=>$('status').dataset.kind==='error');
    assert.ok($('status').textContent.includes('cambió'));
    assert.equal($('products-table').querySelector('[data-product-id="'+id+'"] input[type=text]').value,'88');
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
  await t.test('apartados separados: entregas, pagos, horario, cargue en lote y promociones persistentes',async()=>{
    $('tab-business').click();$('all-opens').value='08:00';$('all-closes').value='17:00';$('apply-schedule').click();submit('business-form');
    await until(()=>$('status').textContent==='Negocio y horarios guardados en Firestore.');
    const before=await repository.load('ferreteria-johns');assert.equal(before.business.schedule.sun.opensAt,'08:00');
    $('tab-delivery').click();$('delivery-form').elements.freightUpTo300KgCOP.value='18000';submit('delivery-form');
    await until(()=>$('status').textContent==='Entregas y cargue guardados en Firestore.');
    $('tab-payments').click();$('payments-form').elements.instructionsText.value='Datos de prueba. No transferir.';
    $('payments-form').elements.instructionsText.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    assert.ok($('payments-preview').textContent.includes('Datos de prueba.'));submit('payments-form');
    await until(()=>$('status').textContent==='Medios de pago guardados en Firestore.');
    let result=await repository.load('ferreteria-johns');assert.equal(result.business.delivery.freightUpTo300KgCOP,18000);assert.equal(result.business.payments.instructionsText,'Datos de prueba. No transferir.');
    assert.equal(result.business.responses.welcome,'Bienvenido. Respuesta editada.');
    $('tab-products').click();const checkbox=$('products-table').querySelector('tr[data-product-id] input[type=checkbox]');checkbox.checked=true;checkbox.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    $('bulk-loading').click();await until(()=>$('status').textContent.startsWith('Aviso de cargue guardado'));
    result=await repository.load('ferreteria-johns');assert.ok(result.products.some(p=>p.loadingUnloadingExtraApplies===true));
    $('tab-promotions').click();await until(()=>!$('new-promotion').disabled);$('new-promotion').click();
    const f=$('promotion-form').elements;f.title.value='Oferta UI';f.description.value='Promoción ilustrativa de prueba';f.imageUrl.value='';f.sortOrder.value='3';f.active.checked=false;
    f.description.dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.ok($('promotion-preview').textContent.includes('Oferta UI'));
    submit('promotion-form');await until(()=>$('status').textContent==='Promoción guardada en Firestore.');
    const promos=await repository.loadPromotions('ferreteria-johns'),promo=promos.find(p=>p.title==='Oferta UI');assert.equal(promo.active,false);assert.equal(promo.sortOrder,3);
    const row=$('promotions-list').querySelector('[data-promotion-id="'+promo.id+'"]');row.querySelector('button').click();f.title.value='Oferta UI editada';submit('promotion-form');
    await until(()=>$('status').textContent==='Promoción guardada en Firestore.'&&!$('promotion-dialog').open);
    const refreshed=await repository.loadPromotions('ferreteria-johns');assert.equal(refreshed.find(p=>p.id===promo.id).title,'Oferta UI editada');
    $('refresh-promotions').click();await until(()=>!$('refresh-promotions').disabled);assert.ok($('promotions-list').textContent.includes('Oferta UI editada'));
  });
  await t.test('borradores por apartado, compatibilidad de campos antiguos y conflictos',async()=>{
    // Campos del servidor ajenos a los formularios e interno anterior se conservan.
    await fsdk.updateDoc(ref,{internalNotificationWhatsApp:'+573000000001',serverOnly:'Conservar'});
    $('refresh').click();await until(()=>$('status').textContent==='Datos cargados desde Firestore.');
    $('tab-responses').click();const response=$('responses-form').elements.help;response.value='Ayuda nueva pendiente';response.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    $('tab-delivery').click();$('delivery-form').elements.loadingUnloadingPerTripCOP.value='16000';submit('delivery-form');
    await until(()=>$('status').textContent==='Entregas y cargue guardados en Firestore.');
    assert.equal(response.value,'Ayuda nueva pendiente');assert.ok($('responses-state').textContent.includes('sin guardar'));
    submit('responses-form');await until(()=>$('status').textContent==='Respuestas guardadas en Firestore.');
    $('tab-business').click();$('business-form').elements.address.value='Dirección de prueba';submit('business-form');
    await until(()=>$('status').textContent==='Negocio y horarios guardados en Firestore.');
    const saved=await repository.load('ferreteria-johns');assert.equal(saved.business.internalNotificationWhatsApp,'+573000000001');assert.equal(saved.business.serverOnly,'Conservar');assert.equal(saved.business.responses.help,'Ayuda nueva pendiente');assert.equal(saved.business.delivery.loadingUnloadingPerTripCOP,16000);
    const pending=$('responses-form').elements.help;pending.value='Borrador en conflicto';pending.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    await fsdk.updateDoc(ref,{'responses.help':'Cambio paralelo del servidor'});submit('responses-form');
    await until(()=>$('status').dataset.kind==='error');assert.ok($('status').textContent.includes('más recientes'));assert.equal(pending.value,'Borrador en conflicto');
    $('refresh').click();await until(()=>$('status').textContent==='Datos cargados desde Firestore.');assert.equal($('responses-form').elements.help.value,'Cambio paralelo del servidor');
  });
  await t.test('pagos: IDs estables, orden, desactivar y vista previa de imagen sin envío',async()=>{
    $('tab-payments').click();$('add-payment-method').click();const card=$('payment-methods').lastElementChild,methodId=card.dataset.methodId;
    card.querySelector('[data-field=label]').value='Método de prueba UI';card.querySelector('[data-field=detailsText]').value='No realizar pagos. Solo pruebas.';card.querySelector('[data-field=sortOrder]').value='5';card.querySelector('[data-field=active]').checked=true;
    $('payments-form').elements.imageUrl.value='https://example.test/prueba.png';$('payments-form').elements.imageUrl.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    assert.equal($('payments-image').src,'https://example.test/prueba.png');$('payments-image').dispatchEvent(new dom.window.Event('load'));assert.equal($('payments-image').hidden,false);assert.ok($('payments-preview').textContent.includes('Método de prueba UI'));
    submit('payments-form');await until(()=>$('status').textContent==='Medios de pago guardados en Firestore.');
    let result=await repository.load('ferreteria-johns');assert.ok(result.business.payments.methods.some(m=>m.id===methodId&&m.active&&m.sortOrder===5));
    const edited=$('payment-methods').querySelector('[data-method-id="'+methodId+'"]');edited.querySelector('[data-field=label]').value='Método renombrado';edited.querySelector('[data-field=active]').checked=false;submit('payments-form');
    await until(()=>$('status').textContent==='Medios de pago guardados en Firestore.'&&!$('payments-form').querySelector('button').disabled);
    result=await repository.load('ferreteria-johns');assert.ok(result.business.payments.methods.some(m=>m.id===methodId&&!m.active&&m.label==='Método renombrado'));
  });
  await t.test('negocio nuevo: formulario no crea datos hasta confirmar; horarios existentes no se reemplazan',async()=>{
    $('new-business').click();$('new-business-form').elements.businessId.value='negocio-pruebas';submit('new-business-form');
    await until(()=>$('business-select').value==='negocio-pruebas'&&!$('business-panel').hidden);
    assert.equal((await fsdk.getDoc(fsdk.doc(db,'businesses/negocio-pruebas'))).exists(),false);assert.equal($('business-form').elements.monClosed.checked,true);
    $('business-form').elements.commercialName.value='Negocio de prueba';$('business-form').elements.customerWhatsApp.value='+573000000002';submit('business-form');
    await until(()=>$('status').textContent==='Negocio y horarios guardados en Firestore.');
    const result=await repository.load('negocio-pruebas');assert.equal(result.business.commercialName,'Negocio de prueba');assert.equal(result.business.schedule.mon.closed,true);assert.equal(result.business.revision,1);
    assert.equal(result.business.payments,undefined);assert.equal(result.business.delivery,undefined);assert.equal(Object.keys(result.business.responses).length,16);
    $('business-select').value='ferreteria-johns';$('business-select').dispatchEvent(new dom.window.Event('change',{bubbles:true}));await until(()=>$('status').textContent==='Datos cargados desde Firestore.');assert.equal($('business-form').elements.address.value,'Dirección de prueba');
  });
  await authSdk.signOut(auth);await until(()=>$('workspace').hidden);
  assert.equal($('products-table').children.length,0);
});
