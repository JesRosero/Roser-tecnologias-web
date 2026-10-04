import {ADMIN_UID,RESPONSE_LABELS,DAYS,AVAILABILITY,PRODUCT_FIELDS,blankProduct,businessDefaults,validateBusiness,validateProduct,numberValue,money,fingerprint,prepareImport,exportCSV} from './model.mjs';
import {createRepository} from './repository.mjs';
export function mountPanel({sdk,auth,db,document:dom=globalThis.document,window:win=globalThis.window,repositoryFactory=createRepository}) {
  const $=id=>dom.getElementById(id), make=(tag,text,className)=>{const e=dom.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
  let user=null,repo=null,businessId='ferreteria-johns',businessData=null,products=[],editProduct=null,editExpected=null;
  let epoch=0,busy=false,loaded=false,businessDirty=false,productDirty=false,importPlan=null;
  const priceDrafts=new Map();
  const status=(message,kind='info')=>{$('status').textContent=message;$('status').dataset.kind=kind;};
  const pendingEdits=()=>businessDirty||productDirty||priceDrafts.size>0;
  const dirty=()=>pendingEdits()||!!importPlan?.changes.length;
  function confirmDiscard(){return !dirty()||win.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?');}
  const authError=e=>({
    'auth/invalid-credential':'Correo o contraseña incorrectos.',
    'auth/invalid-login-credentials':'Correo o contraseña incorrectos.',
    'auth/too-many-requests':'Demasiados intentos. Espera un momento y vuelve a intentar.',
    'auth/network-request-failed':'No se pudo conectar con Firebase. Comprueba tu conexión.',
    'permission-denied':'Firebase rechazó el acceso. Comprueba las reglas publicadas y la cuenta autorizada.',
    'unavailable':'No se pudo conectar con Firestore. No se confirmó ningún guardado.'
  }[e.code]||e.message||'No se pudo completar la operación.');
  function controls(disabled) {
    for(const e of dom.querySelectorAll('#workspace button,#workspace input,#workspace select,#workspace textarea,dialog button,dialog input,dialog textarea,dialog select,#logout'))e.disabled=disabled;
    if(!disabled){
      $('save-prices').disabled=!priceDrafts.size;
      $('confirm-import').disabled=!importPlan||importPlan.errors.length>0||!importPlan.changes.length;
      for(const day of Object.keys(DAYS)){
        const row=$('schedule').querySelector('[data-day="'+day+'"]');
        if(row)for(const e of row.querySelectorAll('input[type=time]'))e.disabled=row.querySelector('input[type=checkbox]').checked;
      }
    }
  }
  async function run(task) {
    if(busy)return;
    busy=true;controls(true);
    try{await task();}catch(e){status(authError(e),'error');if($('product-dialog').open)$('product-error').textContent=authError(e);}
    finally{busy=false;controls(false);}
  }
  function requireReady(){if(!user||user.uid!==ADMIN_UID||!loaded)throw new Error('Primero inicia sesión y carga los datos.');}
  async function afterCommit(task) {
    try{return await task();}
    catch{throw new Error('Firebase confirmó el guardado, pero no se pudieron recargar los datos. Usa Recargar datos antes de repetir la operación.');}
  }
  function clearPrivate() {
    loaded=false;repo=null;businessData=null;products=[];priceDrafts.clear();businessDirty=false;productDirty=false;importPlan=null;
    $('workspace').hidden=true;$('products-table').replaceChildren();$('business-select').replaceChildren();
    $('business-form').reset();$('responses').replaceChildren();$('schedule').replaceChildren();$('preview-text').textContent='';
    $('import-details').replaceChildren();$('import-review').hidden=true;$('import-file').value='';
    $('product-form').reset();if($('product-dialog').open)$('product-dialog').close();
    if($('business-dialog').open)$('business-dialog').close();
  }
  function options(select, entries,selected) {
    select.replaceChildren(...entries.map(([value,label])=>{const e=make('option',label);e.value=value;return e;}));
    select.value=selected;
  }
  async function businessOptions(token) {
    const businesses=await repo.listBusinesses();
    if(token!==epoch)return false;
    const entries=businesses.map(b=>[b.id,(b.data.commercialName||b.id)+' · '+b.id]);
    if(!entries.some(([id])=>id==='ferreteria-johns'))entries.unshift(['ferreteria-johns',"Ferretería John's · sin configurar"]);
    if(!entries.some(([id])=>id===businessId))entries.push([businessId,businessId+' · sin configurar']);
    options($('business-select'),entries,businessId);return true;
  }
  async function reload(token=epoch) {
    loaded=false;status('Cargando configuración y productos desde Firestore…');
    const id=businessId,result=await repo.load(id);
    if(token!==epoch||id!==businessId)return;
    businessData=result.business;products=result.products;loaded=true;
    priceDrafts.clear();businessDirty=false;productDirty=false;importPlan=null;
    $('import-review').hidden=true;$('import-file').value='';
    renderBusiness();renderProducts();controls(busy);
    status(businessData?'Datos cargados desde Firestore.':'Configura el negocio y guarda. El catálogo está vacío; no se han creado productos.');
  }
  function updatePricesLabel(){
    $('price-count').textContent=priceDrafts.size?priceDrafts.size+' precio(s) por guardar':'';
    $('save-prices').disabled=busy||!priceDrafts.size;
  }
  function renderProducts(){
    const category=$('category').value;
    options($('category'),[['','Todas'],...Array.from(new Set(products.map(p=>p.category))).sort().map(c=>[c,c])],category);
    if(!Array.from($('category').options).some(o=>o.value===category))$('category').value='';
    const q=$('search').value.toLocaleLowerCase().trim(),cat=$('category').value,active=$('active-filter').value;
    const filtered=products.filter(p=>(!q||(p.name+' '+p.sku).toLocaleLowerCase().includes(q))&&(!cat||p.category===cat)&&(!active||String(p.active)===active)).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)||a.name.localeCompare(b.name,'es'));
    const tbody=$('products-table');tbody.replaceChildren();
    $('catalog-count').textContent=products.length+' producto(s) · '+filtered.length+' en esta vista';
    if(!filtered.length){const row=make('tr'),cell=make('td',products.length?'No hay coincidencias.':'Catálogo vacío. Crea un producto o importa un CSV revisado.');cell.colSpan=6;row.append(cell);tbody.append(row);}
    for(const p of filtered){
      const row=make('tr');row.dataset.productId=p.id;
      const name=make('td');name.append(make('strong',p.name),make('small',p.sku));
      const categoryCell=make('td',p.category);categoryCell.append(make('small',p.unit+(p.allowDecimalQuantity?' · admite decimales':'')));
      const price=make('td'),input=make('input');input.type='text';input.inputMode='decimal';input.value=priceDrafts.has(p.id)?priceDrafts.get(p.id):p.priceCOP??'';input.placeholder='Pendiente';input.setAttribute('aria-label','Precio COP de '+p.name);
      input.classList.toggle('price-dirty',priceDrafts.has(p.id));
      input.addEventListener('input',()=>{if(input.value===String(p.priceCOP??''))priceDrafts.delete(p.id);else priceDrafts.set(p.id,input.value);input.classList.toggle('price-dirty',priceDrafts.has(p.id));updatePricesLabel();});
      price.append(input,make('small',money(p.priceCOP)));
      const available=make('td',AVAILABILITY[p.availability]??'Consultar disponibilidad');
      const state=make('td');state.append(make('span',p.active?'Activo':'Inactivo','badge'+(p.active?' active':'')));
      const actions=make('td'),wrap=make('div',undefined,'row-actions'),edit=make('button','Editar'),toggle=make('button',p.active?'Desactivar':'Activar');
      edit.type=toggle.type='button';edit.addEventListener('click',()=>openProduct(p));
      toggle.addEventListener('click',()=>run(async()=>{
        requireReady();if(priceDrafts.has(p.id))throw new Error('Guarda o descarta primero el precio modificado de este producto.');
        await repo.saveProducts(businessId,[{id:p.id,data:{active:!p.active},expected:fingerprint(p.data)}]);
        // Actualizar solo este producto sin descartar precios pendientes de otros productos.
        const result=await afterCommit(()=>repo.load(businessId)),saved=result.products.find(x=>x.id===p.id);
        if(saved)products=products.map(x=>x.id===p.id?saved:x);
        renderProducts();status('Estado del producto guardado en Firestore.','success');
      }));
      wrap.append(edit,toggle);actions.append(wrap);row.append(name,categoryCell,price,available,state,actions);tbody.append(row);
    }
    updatePricesLabel();
  }
  function renderBusiness(){
    const b=businessData??businessDefaults(businessId),form=$('business-form');
    for(const key of ['commercialName','customerWhatsApp','internalNotificationWhatsApp','address','locationUrl'])form.elements.namedItem(key).value=b[key]??'';
    $('business-state').textContent=businessData?'Configuración almacenada · '+businessId:'Sin guardar. Los textos iniciales son propuestas editables. Los horarios no están confirmados.';
    $('schedule').replaceChildren();
    for(const [day,label] of Object.entries(DAYS)){
      const row=make('div',undefined,'schedule-row');row.dataset.day=day;row.append(make('strong',label));
      const checkLabel=make('label',undefined,'check'),check=make('input');check.type='checkbox';check.name=day+'Closed';check.checked=b.schedule?.[day]?.closed??true;checkLabel.append(check,make('span','Cerrado'));
      row.append(checkLabel);
      for(const [key,text] of [['opensAt','Abre'],['closesAt','Cierra']]){
        const labelEl=make('label',text),input=make('input');input.type='time';input.name=day+key;input.value=b.schedule?.[day]?.[key]??'';input.disabled=check.checked;labelEl.append(input);row.append(labelEl);
      }
      check.addEventListener('change',()=>{for(const e of row.querySelectorAll('input[type=time]'))e.disabled=check.checked;});
      $('schedule').append(row);
    }
    $('responses').replaceChildren();
    for(const [key,label] of Object.entries(RESPONSE_LABELS)){
      const e=make('label',label),input=make('textarea');input.name=key;input.rows=3;input.maxLength=2000;input.required=true;input.value=b.responses?.[key]??businessDefaults(businessId).responses[key];
      e.append(make('small',key),input);$('responses').append(e);
    }
    options($('preview-key'),Object.entries(RESPONSE_LABELS),'welcome');preview();
  }
  function preview(){$('preview-text').textContent=$('business-form').elements.namedItem($('preview-key').value)?.value??'';}
  function readBusiness(){
    const f=$('business-form').elements,b={schedule:{},responses:{}};
    for(const key of ['commercialName','customerWhatsApp','internalNotificationWhatsApp','address','locationUrl'])b[key]=f.namedItem(key).value;
    for(const day of Object.keys(DAYS))b.schedule[day]={closed:f.namedItem(day+'Closed').checked,opensAt:f.namedItem(day+'opensAt').value,closesAt:f.namedItem(day+'closesAt').value};
    for(const key of Object.keys(RESPONSE_LABELS))b.responses[key]=f.namedItem(key).value;
    return validateBusiness(b);
  }
  function openProduct(p=null){
    if(busy||!loaded)return;
    if(p&&priceDrafts.has(p.id)){status('Guarda o descarta primero el precio modificado de este producto.','error');return;}
    editProduct=p;editExpected=p?fingerprint(p.data):null;productDirty=false;
    const value=p??blankProduct(),form=$('product-form');
    for(const key of PRODUCT_FIELDS){const input=form.elements.namedItem(key);if(input.type==='checkbox')input.checked=value[key];else input.value=value[key]??'';}
    $('product-title').textContent=p?'Editar producto':'Crear producto';
    $('product-id').textContent=p?'ID permanente: '+p.id:'El ID se asigna al guardar. Los productos nuevos empiezan inactivos.';
    $('product-error').textContent='';$('product-dialog').showModal();
  }
  function closeProduct(){if(busy)return;if(productDirty&&!win.confirm('¿Descartar los cambios de este producto?'))return;productDirty=false;$('product-dialog').close();}
  const on=(id,event,fn)=>$(id).addEventListener(event,fn);
  on('login-form','submit',event=>{event.preventDefault();if(busy)return;run(async()=>{
    status('Iniciando sesión…');const f=$('login-form');
    try{await sdk.setPersistence(auth,sdk.browserSessionPersistence);await sdk.signInWithEmailAndPassword(auth,f.elements.email.value.trim(),f.elements.password.value);}
    finally{f.elements.password.value='';}
  });});
  on('reset-password','click',()=>run(async()=>{
    const email=$('login-email').value.trim();if(!email||!$('login-email').checkValidity())throw new Error('Indica un correo válido para recuperar la contraseña.');
    try{await sdk.sendPasswordResetEmail(auth,email,{url:win.location.origin+'/admin/bots/'});}catch(e){if(e.code!=='auth/user-not-found')throw e;}
    status('Si existe una cuenta para ese correo, Firebase enviará las instrucciones de recuperación. Revisa también la carpeta de spam.','success');
  }));
  on('logout','click',()=>{if(!confirmDiscard())return;run(async()=>{await sdk.signOut(auth);status('Sesión cerrada.');});});
  on('business-select','change',event=>{
    const id=event.target.value;if(!confirmDiscard()){event.target.value=businessId;return;}
    businessId=id;run(()=>reload());
  });
  on('refresh','click',()=>{if(!confirmDiscard())return;run(async()=>{await businessOptions(epoch);await reload();});});
  for(const [tab,panel,otherTab,otherPanel] of [['tab-products','products-panel','tab-business','business-panel'],['tab-business','business-panel','tab-products','products-panel']])on(tab,'click',()=>{
    $(panel).hidden=false;$(otherPanel).hidden=true;$(tab).setAttribute('aria-pressed','true');$(otherTab).setAttribute('aria-pressed','false');
  });
  on('new-business','click',()=>{if(!confirmDiscard())return;$('new-business-form').reset();$('business-dialog').showModal();});
  on('cancel-business','click',()=>$('business-dialog').close());
  on('new-business-form','submit',event=>{event.preventDefault();run(async()=>{
    const id=$('new-business-form').elements.businessId.value.trim();
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80)throw new Error('Usa un ID de hasta 80 caracteres, en minúsculas, números y guiones.');
    if(Array.from($('business-select').options).some(o=>o.value===id))throw new Error('Ese negocio ya está en el selector.');
    businessId=id;$('business-dialog').close();await businessOptions(epoch);await reload();$('tab-business').click();
    // Los botones están temporalmente deshabilitados durante carga.
    $('products-panel').hidden=true;$('business-panel').hidden=false;$('tab-business').setAttribute('aria-pressed','true');$('tab-products').setAttribute('aria-pressed','false');
  });});
  for(const id of ['search','category','active-filter'])on(id,id==='search'?'input':'change',renderProducts);
  on('new-product','click',()=>{if(!businessData){status('Guarda primero la configuración del negocio.','error');$('tab-business').click();return;}openProduct();});
  on('product-form','input',()=>{productDirty=true;});
  on('close-product','click',closeProduct);on('cancel-product','click',closeProduct);
  on('product-dialog','cancel',event=>{event.preventDefault();closeProduct();});
  on('product-form','submit',event=>{event.preventDefault();run(async()=>{
    requireReady();if(!businessData)throw new Error('Guarda primero la configuración del negocio.');
    const f=$('product-form').elements,input={};
    for(const key of PRODUCT_FIELDS)input[key]=f.namedItem(key).type==='checkbox'?f.namedItem(key).checked:f.namedItem(key).value;
    const value=validateProduct(input);
    if(products.some(p=>p.id!==editProduct?.id&&p.sku.toLocaleLowerCase()===value.sku.toLocaleLowerCase()))throw new Error('El código pertenece a otro producto.');
    const id=editProduct?.id??repo.newProductId(businessId);
    await repo.saveProducts(businessId,[{id,data:value,expected:editExpected}]);
    productDirty=false;$('product-dialog').close();
    const result=await afterCommit(()=>repo.load(businessId)),saved=result.products.find(p=>p.id===id);
    if(editProduct)products=products.map(p=>p.id===id?saved:p);else products.push(saved);
    renderProducts();
    status('Producto guardado en Firestore.','success');
  });});
  on('save-prices','click',()=>run(async()=>{
    requireReady();
    const changes=Array.from(priceDrafts,([id,value])=>{
      const p=products.find(p=>p.id===id);return {id,data:{priceCOP:numberValue(value,{nullable:true})},expected:fingerprint(p.data)};
    });
    await repo.saveProducts(businessId,changes);priceDrafts.clear();const result=await afterCommit(()=>repo.load(businessId));products=result.products;renderProducts();status('Precios guardados en Firestore.','success');
  }));
  on('business-form','input',event=>{if(event.target.id!=='preview-key')businessDirty=true;preview();});on('business-form','change',event=>{if(event.target.id!=='preview-key')businessDirty=true;preview();});on('preview-key','change',preview);
  on('business-form','submit',event=>{event.preventDefault();run(async()=>{
    requireReady();const data=readBusiness();await repo.saveBusiness(businessId,data,fingerprint(businessData));
    businessDirty=false;await afterCommit(()=>businessOptions(epoch));
    const result=await afterCommit(()=>repo.load(businessId));businessData=result.business;renderBusiness();status('Negocio y respuestas guardados en Firestore.','success');
  });});
  function downloadCSV(list,name){
    const url=win.URL.createObjectURL(new win.Blob([exportCSV(list)],{type:'text/csv;charset=utf-8;'})),a=make('a');a.href=url;a.download=name;dom.body.append(a);a.click();a.remove();win.setTimeout(()=>win.URL.revokeObjectURL(url),1000);
  }
  on('export-csv','click',()=>downloadCSV(products,businessId+'-catalogo.csv'));on('template-csv','click',()=>downloadCSV([],'plantilla-productos.csv'));
  on('import-file','change',()=>run(async()=>{
    requireReady();if(!businessData)throw new Error('Guarda primero el negocio.');
    if(pendingEdits())throw new Error('Guarda o descarta las ediciones pendientes antes de importar.');
    const file=$('import-file').files[0];if(!file)return;
    if(file.size>5*1024*1024)throw new Error('El archivo supera 5 MB. Divide la importación en archivos más pequeños.');
    importPlan=prepareImport(await file.text(),products);$('import-review').hidden=false;
    $('import-summary').textContent=importPlan.total+' registro(s) · '+importPlan.changes.length+' cambio(s) · '+importPlan.errors.length+' error(es). Se guardará en grupos de hasta 100; cada grupo es atómico. Si falla un grupo posterior, los anteriores permanecen guardados.';
    $('import-errors').replaceChildren(...importPlan.errors.map(e=>make('li',e)));
    $('import-details').replaceChildren();
    for(const c of importPlan.changes){
      const block=make('section',undefined,'import-item');block.append(make('strong',(c.id?'Actualizar: ':'Crear: ')+c.data.name));
      const dl=make('dl');
      for(const field of c.fields){
        const pretty=v=>v===null?'Pendiente':v===undefined?'Sin registro':String(v);
        dl.append(make('dt',field),make('dd',pretty(c.before?.[field])+' → '+pretty(c.data[field])));
      }
      block.append(dl);$('import-details').append(block);
    }
    status(importPlan.errors.length?'Corrige los errores del CSV y vuelve a cargarlo. No se guardó ningún cambio.':'Importación preparada. Revisa los cambios antes de confirmar.',importPlan.errors.length?'error':'info');
  }));
  on('cancel-import','click',()=>{importPlan=null;$('import-review').hidden=true;$('import-file').value='';});
  on('confirm-import','click',()=>run(async()=>{
    requireReady();if(!importPlan||importPlan.errors.length||!importPlan.changes.length)throw new Error('No hay una importación válida para guardar.');
    if(!win.confirm('¿Guardar los cambios revisados? No se eliminarán productos ausentes del CSV.'))return;
    const changes=importPlan.changes.map(c=>({...c,id:c.id??repo.newProductId(businessId)}));
    let saved=0;
    try{
      for(let start=0;start<changes.length;start+=100){
        status('Guardando importación: '+saved+' de '+changes.length+'…');
        const group=changes.slice(start,start+100);await repo.saveProducts(businessId,group);saved+=group.length;
      }
      await reload();status('Importación guardada: '+saved+' producto(s). Los demás permanecen intactos.','success');
    }catch(e){
      importPlan=null;$('import-review').hidden=true;$('import-file').value='';
      try{await reload();}catch{}
      throw new Error('Importación interrumpida. Se confirmaron '+saved+' cambios en grupos anteriores. Recarga y revisa antes de reimportar. '+authError(e));
    }
  }));
  win.addEventListener('beforeunload',event=>{if(dirty()||busy){event.preventDefault();event.returnValue='';}});
  const unsubscribe=sdk.onAuthStateChanged(auth,async next=>{
    const token=++epoch;clearPrivate();user=next;$('login-section').hidden=!!next;$('denied').hidden=!next||next.uid===ADMIN_UID;$('logout').hidden=!next;
    if(!next){status('Inicia sesión para administrar los bots.');return;}
    if(next.uid!==ADMIN_UID){status('Acceso denegado: esta cuenta no está autorizada.','error');return;}
    repo=repositoryFactory(sdk,db,next.uid);$('workspace').hidden=false;controls(true);
    try{if(await businessOptions(token))await reload(token);}catch(e){if(token===epoch)status(authError(e),'error');}
    finally{if(token===epoch)controls(busy);}
  });
  return {dispose:unsubscribe};
}
