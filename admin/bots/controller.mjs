import {ADMIN_UID,RESPONSE_LABELS,DAYS,AVAILABILITY,PRODUCT_FIELDS,blankProduct,businessDefaults,validateBusiness,validateProduct,numberValue,money,fingerprint,prepareImport,exportCSV,validateBusinessInfo,validateResponses,deliveryDefaults,paymentsDefaults,validateDelivery,validatePayments,blankPromotion,validatePromotion,httpsUrl,categoryKey,normalizeCategory} from './model.mjs';
import {createRepository} from './repository.mjs';
export function mountPanel({sdk,auth,db,document:dom=globalThis.document,window:win=globalThis.window,repositoryFactory=createRepository}) {
  const $=id=>dom.getElementById(id), make=(tag,text,className)=>{const e=dom.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
  let user=null,repo=null,businessId='ferreteria-johns',businessData=null,products=[],editProduct=null,editExpected=null;
  let epoch=0,busy=false,loaded=false,businessDirty=false,productDirty=false,importPlan=null;
  const priceDrafts=new Map(),selectedProducts=new Set(),sectionDirty=new Set(),sectionExpected=new Map();
  let promotions=[],promotionsLoaded=false,promotionDirty=false,editingPromotion=null;
  const sectionFields={business:['commercialName','customerWhatsApp','address','locationUrl','timezone','schedule'],responses:['responses'],delivery:['delivery'],payments:['payments']};
  const sectionSlice=(data,key)=>Object.fromEntries(sectionFields[key].map(field=>[field,data?.[field]??null]));
  const tabs=['business','products','responses','delivery','payments','promotions'];
  function showSection(key){for(const tab of tabs){$(tab+'-panel').hidden=tab!==key;$('tab-'+tab).setAttribute('aria-pressed',String(tab===key));}}

  const status=(message,kind='info')=>{$('status').textContent=message;$('status').dataset.kind=kind;};
  const pendingEdits=()=>businessDirty||sectionDirty.size>0||productDirty||promotionDirty||priceDrafts.size>0;
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
      $('bulk-loading').disabled=!selectedProducts.size;
      $('new-promotion').disabled=!businessData||!promotionsLoaded;
      $('confirm-import').disabled=!importPlan||importPlan.errors.length>0||!importPlan.changes.length;
      for(const day of Object.keys(DAYS)){
        const row=$('schedule').querySelector('[data-day="'+day+'"]');
        if(row)for(const e of row.querySelectorAll('input[type=time]'))e.disabled=row.querySelector('input[type=checkbox]').checked;
      }
    }
  }
  async function run(task) {
    if(busy)return;
    busy=true;controls(true);status('Procesando…');
    try{await task();}catch(e){status(authError(e),'error');if($('product-dialog').open)$('product-error').textContent=authError(e);if($('promotion-dialog').open)$('promotion-error').textContent=authError(e);}
    finally{busy=false;controls(false);}
  }
  function requireReady(){if(!user||user.uid!==ADMIN_UID||!loaded)throw new Error('Primero inicia sesión y carga los datos.');}
  async function afterCommit(task) {
    try{return await task();}
    catch{throw new Error('Firebase confirmó el guardado, pero no se pudieron recargar los datos. Usa Recargar datos antes de repetir la operación.');}
  }
  function clearPrivate() {
    loaded=false;repo=null;businessData=null;products=[];promotions=[];promotionsLoaded=false;paymentImageValue='';promotionImageValue='';editingPromotion=null;editProduct=null;sectionDirty.clear();sectionExpected.clear();selectedProducts.clear();promotionDirty=false;priceDrafts.clear();businessDirty=false;productDirty=false;importPlan=null;
    $('workspace').hidden=true;$('products-table').replaceChildren();$('business-select').replaceChildren();
    $('promotions-list').replaceChildren();$('promotions-state').textContent='';$('payment-methods').replaceChildren();$('payments-preview').textContent='';$('payments-image').hidden=true;$('payments-image').removeAttribute('src');$('promotion-preview').textContent='';$('promotion-image').hidden=true;$('promotion-image').removeAttribute('src');
    for(const key of ['delivery','payments','responses'])$(key+'-form').reset();
    if($('promotion-dialog').open)$('promotion-dialog').close();
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
    businessData=result.business;products=result.products;loaded=true;promotions=[];promotionsLoaded=false;selectedProducts.clear();sectionDirty.clear();
    priceDrafts.clear();businessDirty=false;productDirty=false;importPlan=null;
    $('import-review').hidden=true;$('import-file').value='';
    renderBusiness();renderProducts();$('promotions-list').replaceChildren();$('promotions-state').textContent='Abre este apartado para cargar las promociones.';controls(busy);
    if(!$('promotions-panel').hidden)await loadPromotions();
    status(businessData?'Datos cargados desde Firestore.':'Abre Negocio y horarios, revisa los datos y pulsa Guardar negocio y horarios. Después podrás crear productos.');
  }
  function updatePricesLabel(){
    $('price-count').textContent=priceDrafts.size?priceDrafts.size+' precio(s) por guardar':'';
    $('save-prices').disabled=busy||!priceDrafts.size;
  }
  function renderProducts(){
    const category=$('category').value;
    options($('category'),[['','Todas'],...Array.from(new Map(products.map(p=>[categoryKey(p.category),normalizeCategory(p.category)])).values()).sort().map(c=>[c,c])],category);
    if(!Array.from($('category').options).some(o=>o.value===category))$('category').value='';
    const q=$('search').value.toLocaleLowerCase().trim(),cat=$('category').value,active=$('active-filter').value;
    const filtered=products.filter(p=>(!q||(p.name+' '+p.sku).toLocaleLowerCase().includes(q))&&(!cat||categoryKey(p.category)===categoryKey(cat))&&(!active||String(p.active)===active)).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)||a.name.localeCompare(b.name,'es')||a.id.localeCompare(b.id));
    const tbody=$('products-table');tbody.replaceChildren();
    $('catalog-count').textContent=products.length+' producto(s) · '+filtered.length+' en esta vista';
    if(!filtered.length){const row=make('tr'),cell=make('td',products.length?'No hay coincidencias.':'Catálogo vacío. Crea un producto o importa un CSV revisado.');cell.colSpan=7;row.append(cell);tbody.append(row);}
    for(const p of filtered){
      const row=make('tr');row.dataset.productId=p.id;
      const selection=make('td'),checkbox=make('input');checkbox.type='checkbox';checkbox.checked=selectedProducts.has(p.id);checkbox.setAttribute('aria-label','Seleccionar '+p.name);checkbox.addEventListener('change',()=>{if(checkbox.checked)selectedProducts.add(p.id);else selectedProducts.delete(p.id);selectionLabel();});selection.append(checkbox);
      const name=make('td');name.append(make('strong',p.name),make('small',p.sku));
      const categoryCell=make('td',p.category);categoryCell.append(make('small',p.unit+(p.allowDecimalQuantity?' · admite decimales':'')));
      const price=make('td'),input=make('input');input.type='text';input.inputMode='decimal';input.value=priceDrafts.has(p.id)?priceDrafts.get(p.id):p.priceCOP??'';input.placeholder='Pendiente';input.setAttribute('aria-label','Precio COP de '+p.name);
      input.classList.toggle('price-dirty',priceDrafts.has(p.id));
      input.addEventListener('input',()=>{if(input.value===String(p.priceCOP??''))priceDrafts.delete(p.id);else priceDrafts.set(p.id,input.value);input.classList.toggle('price-dirty',priceDrafts.has(p.id));updatePricesLabel();});
      price.append(input,make('small',money(p.priceCOP)));
      const available=make('td',AVAILABILITY[p.availability]??'Consultar disponibilidad');
      const state=make('td');state.append(make('span',p.active?'Activo':'Inactivo','badge'+(p.active?' active':'')));if(p.loadingUnloadingExtraApplies)state.append(make('small','Cargue adicional: consultar')); 
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
      wrap.append(edit,toggle);actions.append(wrap);row.append(selection,name,categoryCell,price,available,state,actions);tbody.append(row);
    }
    options($('category-suggestions'),Array.from(new Map(products.map(p=>[categoryKey(p.category),normalizeCategory(p.category)])).values()).map(c=>[c,c]),'');
    selectionLabel();updatePricesLabel();
  }
  function selectionLabel(){
    $('selection-count').textContent=selectedProducts.size+' producto(s) seleccionado(s). El aviso no calcula cargos.';
    $('bulk-loading').disabled=busy||!selectedProducts.size;
    const visible=Array.from($('products-table').querySelectorAll('tr[data-product-id]')).map(r=>r.dataset.productId);
    $('select-visible').checked=!!visible.length&&visible.every(id=>selectedProducts.has(id));
    $('select-visible').indeterminate=visible.some(id=>selectedProducts.has(id))&&!$('select-visible').checked;
  }
  function renderBusiness(){
    for(const key of Object.keys(sectionFields))renderSection(key);
    $('setup-notice').hidden=!!businessData;
  }
  function stateNote(key){
    const required=key==='responses'?Object.keys(RESPONSE_LABELS):key==='delivery'?Object.keys(deliveryDefaults(businessId)):key==='payments'?['isExample','instructionsText','imageUrl','methods']:[];
    const exists=key==='business'?!!businessData:!!businessData?.[key]&&required.every(field=>Object.hasOwn(businessData[key],field));
    $(key+'-state').textContent=exists?'Configuración almacenada en Firestore · '+businessId:'Propuesta pendiente de guardar. Revisa y guarda este apartado explícitamente.';
  }
  function renderSection(key){
    sectionExpected.set(key,fingerprint(businessData));sectionDirty.delete(key);stateNote(key);
    const defaults=businessDefaults(businessId),b=businessData??defaults;
    if(key==='business'){
      const form=$('business-form');
      for(const field of ['commercialName','customerWhatsApp','address','locationUrl'])form.elements.namedItem(field).value=b[field]??'';
      $('schedule').replaceChildren();
      for(const [day,label] of Object.entries(DAYS)){
        const value=b.schedule?.[day]??defaults.schedule[day],row=make('div',undefined,'schedule-row');row.dataset.day=day;row.append(make('strong',label));
        const checkLabel=make('label',undefined,'check'),check=make('input');check.type='checkbox';check.name=day+'Closed';check.checked=value.closed;checkLabel.append(check,make('span','Cerrado'));row.append(checkLabel);
        for(const [field,text] of [['opensAt','Abre'],['closesAt','Cierra']]){
          const labelEl=make('label',text),input=make('input');input.type='time';input.name=day+field;input.value=value[field]??'';input.disabled=check.checked;labelEl.append(input);row.append(labelEl);
        }
        check.addEventListener('change',()=>{for(const e of row.querySelectorAll('input[type=time]'))e.disabled=check.checked;});$('schedule').append(row);
      }
    }else if(key==='responses'){
      $('responses').replaceChildren();
      for(const [field,label] of Object.entries(RESPONSE_LABELS)){
        const e=make('label',label),input=make('textarea');input.name=field;input.rows=3;input.maxLength=2000;input.required=true;input.value=b.responses?.[field]??defaults.responses[field];e.append(make('small',field),input);$('responses').append(e);
      }
      options($('preview-key'),Object.entries(RESPONSE_LABELS),'welcome');preview();
    }else if(key==='delivery'){
      const value={...deliveryDefaults(businessId),...b.delivery},form=$('delivery-form');
      for(const [field,val] of Object.entries(value)){const input=form.elements.namedItem(field);if(!input)continue;if(input.type==='checkbox')input.checked=val;else input.value=val??'';}
    }else if(key==='payments'){
      const value={...paymentsDefaults(),...b.payments},form=$('payments-form');
      form.elements.isExample.checked=value.isExample;form.elements.instructionsText.value=value.instructionsText??'';form.elements.imageUrl.value=value.imageUrl??'';
      $('payment-methods').replaceChildren();for(const method of [...value.methods].sort((a,b)=>a.sortOrder-b.sortOrder||a.id.localeCompare(b.id)))addMethodRow(method);paymentPreview();
    }
  }
  function preview(){$('preview-text').textContent=$('responses-form').elements.namedItem($('preview-key').value)?.value??'';}
  function readBusiness(){
    const f=$('business-form').elements,b={schedule:{}};
    for(const key of ['commercialName','customerWhatsApp','address','locationUrl'])b[key]=f.namedItem(key).value;
    for(const day of Object.keys(DAYS))b.schedule[day]={closed:f.namedItem(day+'Closed').checked,opensAt:f.namedItem(day+'opensAt').value,closesAt:f.namedItem(day+'closesAt').value};
    return validateBusinessInfo(b);
  }
  async function saveSection(key){
    requireReady();if(key!=='business'&&!businessData)throw new Error('Guarda primero Negocio y horarios. Usa el botón Configurar negocio.');
    const f=$(key+'-form').elements;let patch;
    if(key==='business')patch=readBusiness();
    else if(key==='responses')patch={responses:{...businessData.responses,...validateResponses(Object.fromEntries(Object.keys(RESPONSE_LABELS).map(k=>[k,f.namedItem(k).value])))}};
    else if(key==='delivery'){
      const input={};for(const field of Object.keys(deliveryDefaults(businessId)))input[field]=f.namedItem(field).type==='checkbox'?f.namedItem(field).checked:f.namedItem(field).value;
      patch={delivery:{...businessData.delivery,...validateDelivery(input)}};
    }else {
      const payments=validatePayments(readPayments());
      if(!payments.isExample && businessData.payments?.isExample!==false && !win.confirm('¿Confirmas que reemplazaste los ejemplos y verificaste con el negocio los datos de los medios activos?')){status('Confirmación cancelada. Los medios no se guardaron.');return;}
      patch={payments:{...businessData.payments,...payments}};
    }
    if(key==='business'&&!businessData){patch.responses=businessDefaults(businessId).responses;patch.internalNotificationWhatsApp=null;}
    const previous=businessData;
    await repo.saveBusiness(businessId,patch,sectionExpected.get(key));sectionDirty.delete(key);
    const result=await afterCommit(()=>repo.load(businessId));businessData=result.business;
    for(const other of Object.keys(sectionFields)){
      if(other===key||!sectionDirty.has(other))renderSection(other);
      else if(fingerprint(sectionSlice(previous??businessDefaults(businessId),other))===fingerprint(sectionSlice(businessData,other)))sectionExpected.set(other,fingerprint(businessData));
    }
    $('setup-notice').hidden=!!businessData;await afterCommit(()=>businessOptions(epoch));
    $(key+'-state').textContent='Guardado en Firestore · '+businessId;
    status({business:'Negocio y horarios guardados en Firestore.',responses:'Respuestas guardadas en Firestore.',delivery:'Entregas y cargue guardados en Firestore.',payments:'Medios de pago guardados en Firestore.'}[key],'success');
  }
  function addMethodRow(method){
    const card=make('section',undefined,'method-card');card.dataset.methodId=method.id;
    const heading=make('div',undefined,'section-heading');heading.append(make('h3','Medio de pago'),make('small','ID permanente: '+method.id));card.append(heading);
    const grid=make('div',undefined,'form-grid');
    for(const [field,label,type] of [['label','Nombre','text'],['detailsText','Detalles','textarea'],['sortOrder','Orden','number'],['active','Medio activo','checkbox']]){
      const el=make('label',type==='checkbox'?undefined:label,type==='checkbox'?'check':field==='detailsText'?'wide':undefined),input=make(type==='textarea'?'textarea':'input');input.dataset.field=field;
      if(type!=='textarea')input.type=type;else{input.rows=4;input.maxLength=2000;}
      if(type==='checkbox'){input.checked=method[field];el.append(input,make('span',label));}
      else{input.value=method[field]??'';input.required=true;if(type==='number'){input.min=0;input.max=1000000;input.step=1;}if(field==='label')input.maxLength=160;el.append(input);}grid.append(el);
    }
    card.append(grid);$('payment-methods').append(card);
  }
  function readPayments(){
    const f=$('payments-form').elements;
    return {isExample:f.isExample.checked,instructionsText:f.instructionsText.value,imageUrl:f.imageUrl.value,methods:Array.from($('payment-methods').children,card=>{
      const get=field=>card.querySelector('[data-field="'+field+'"]');return {id:card.dataset.methodId,label:get('label').value,detailsText:get('detailsText').value,sortOrder:get('sortOrder').value,active:get('active').checked};
    })};
  }
  function imagePreview(prefix,url){
    const img=$(prefix+'-image'),note=$(prefix+'-image-status');
    img.hidden=true;img.removeAttribute('src');note.textContent='';
    let valid;try{valid=httpsUrl(url);}catch(e){note.textContent=e.message;return;}
    if(!valid)return;note.textContent='Cargando imagen pública…';
    img.onload=()=>{img.hidden=false;note.textContent='Imagen complementaria. No se guarda una copia en Firebase.';};
    img.onerror=()=>{img.hidden=true;note.textContent='No se pudo cargar la imagen. Revisa que la URL sea pública y accesible.';};img.src=valid;
  }
  let paymentImageValue='',promotionImageValue='';
  function paymentPreview(){
    const p=readPayments();$('payments-warning').textContent=p.isExample?'EJEMPLO: estos datos no autorizan transferencias.':'Datos reales: verifica con el negocio que todos los medios activos estén autorizados.';
    const lines=[p.isExample?'⚠️ DATOS DE EJEMPLO. No realices transferencias.':'',p.instructionsText,...p.methods.filter(m=>m.active).sort((a,b)=>Number(a.sortOrder)-Number(b.sortOrder)||a.id.localeCompare(b.id)).map(m=>m.label+'\n'+m.detailsText)].filter(Boolean);
    $('payments-preview').textContent=lines.join('\n\n');if(p.imageUrl!==paymentImageValue){paymentImageValue=p.imageUrl;imagePreview('payments',p.imageUrl);}
  }
  async function loadPromotions(){
    requireReady();const token=epoch,id=businessId;promotionsLoaded=false;$('promotions-state').textContent='Cargando promociones desde Firestore…';
    try{const result=await repo.loadPromotions(id);if(token!==epoch||id!==businessId)return;promotions=result;promotionsLoaded=true;renderPromotions();}
    catch(e){if(token===epoch&&id===businessId){$('promotions-state').textContent=e.code==='permission-denied'?'Falta publicar la regla de acceso a promotions. Los demás apartados siguen disponibles.':authError(e);$('promotions-list').replaceChildren();}throw e;}
  }
  function renderPromotions(){
    $('promotions-list').replaceChildren();$('promotions-state').textContent=promotions.length?promotions.length+' promoción(es) almacenada(s).':'No hay promociones. Crea una si el negocio tiene una oferta confirmada.';
    for(const p of [...promotions].sort((a,b)=>a.sortOrder-b.sortOrder||a.title.localeCompare(b.title,'es')||a.id.localeCompare(b.id))){
      const card=make('article',undefined,'promotion-card');card.dataset.promotionId=p.id;card.append(make('h3',p.title),make('p',p.description),make('small',(p.active?'Activa':'Inactiva')+' · orden '+p.sortOrder+' · ID '+p.id));
      if(p.imageUrl){try{const src=httpsUrl(p.imageUrl),img=make('img');img.alt=p.title;img.className='image-preview';img.referrerPolicy='no-referrer';img.loading='lazy';img.src=src;img.onerror=()=>{img.remove();card.append(make('small','Imagen no disponible.'));};card.append(img);}catch{card.append(make('small','URL de imagen inválida.'));}}
      const actions=make('div',undefined,'actions'),edit=make('button','Editar'),toggle=make('button',p.active?'Desactivar':'Activar');edit.type=toggle.type='button';edit.addEventListener('click',()=>openPromotion(p));toggle.addEventListener('click',()=>run(async()=>{
        requireReady();await repo.savePromotions(businessId,[{id:p.id,data:{active:!p.active},expected:fingerprint(p.data)}]);await afterCommit(loadPromotions);status('Estado de promoción guardado en Firestore.','success');
      }));actions.append(edit,toggle);card.append(actions);$('promotions-list').append(card);
    }
  }
  function promotionPreview(){
    const f=$('promotion-form').elements;$('promotion-preview').textContent=f.title.value+'\n\n'+f.description.value;
    if(f.imageUrl.value!==promotionImageValue){promotionImageValue=f.imageUrl.value;imagePreview('promotion',f.imageUrl.value);}
  }
  function openPromotion(p=null){
    if(busy||!loaded||!promotionsLoaded)return;if(!businessData){status('Guarda primero Negocio y horarios.','error');showSection('business');return;}
    editingPromotion=p;promotionDirty=false;const value=p??blankPromotion(),f=$('promotion-form').elements;
    for(const field of Object.keys(blankPromotion())){if(f[field].type==='checkbox')f[field].checked=value[field];else f[field].value=value[field]??'';}
    $('promotion-title').textContent=p?'Editar promoción':'Crear promoción';$('promotion-id').textContent=p?'ID permanente: '+p.id:'El ID se asigna al guardar. Empieza inactiva.';$('promotion-error').textContent='';promotionImageValue='';imagePreview('promotion','');promotionPreview();$('promotion-dialog').showModal();
  }
  function closePromotion(){if(busy)return;if(promotionDirty&&!win.confirm('¿Descartar los cambios de esta promoción?'))return;promotionDirty=false;$('promotion-dialog').close();}
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
  for(const key of tabs)on('tab-'+key,'click',()=>{showSection(key);if(key==='promotions'&&!promotionsLoaded)run(loadPromotions);});
  on('go-setup','click',()=>showSection('business'));
  on('new-business','click',()=>{if(!confirmDiscard())return;$('new-business-form').reset();$('new-business-form').elements.businessId.setCustomValidity('');$('business-dialog').showModal();});
  on('cancel-business','click',()=>$('business-dialog').close());
  const idInput=$('new-business-form').elements.businessId;idInput.addEventListener('input',()=>idInput.setCustomValidity(idInput.value&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(idInput.value)?'Usa minúsculas, números y guiones, sin espacios ni tildes. Ejemplo: mi-negocio.':''));
  on('new-business-form','submit',event=>{event.preventDefault();run(async()=>{
    const id=$('new-business-form').elements.businessId.value.trim();
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80)throw new Error('Usa un ID de hasta 80 caracteres, en minúsculas, números y guiones.');
    if(Array.from($('business-select').options).some(o=>o.value===id))throw new Error('Ese negocio ya está en el selector.');
    businessId=id;$('business-dialog').close();await businessOptions(epoch);await reload();showSection('business');
  });});
  for(const id of ['search','category','active-filter'])on(id,id==='search'?'input':'change',renderProducts);
  on('new-product','click',()=>{if(!businessData){status('En Negocio y horarios pulsa Guardar negocio y horarios antes de crear productos.','error');$('tab-business').click();return;}openProduct();});
  on('product-form','input',()=>{productDirty=true;});
  on('close-product','click',closeProduct);on('cancel-product','click',closeProduct);
  on('product-dialog','cancel',event=>{event.preventDefault();closeProduct();});
  on('product-form','submit',event=>{event.preventDefault();run(async()=>{
    requireReady();if(!businessData)throw new Error('En Negocio y horarios pulsa Guardar negocio y horarios antes de crear productos.');
    const f=$('product-form').elements,input={};
    for(const key of PRODUCT_FIELDS)input[key]=f.namedItem(key).type==='checkbox'?f.namedItem(key).checked:f.namedItem(key).value;
    const value=validateProduct(input);const matchingCategory=products.find(p=>categoryKey(p.category)===categoryKey(value.category));if(matchingCategory)value.category=normalizeCategory(matchingCategory.category);
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
  for(const key of Object.keys(sectionFields)){
    const mark=event=>{if(event.target.id==='preview-key')return;sectionDirty.add(key);$(key+'-state').textContent='Cambios sin guardar. Pulsa el botón Guardar de este apartado.';if(key==='responses')preview();if(key==='payments')paymentPreview();};
    on(key+'-form','input',mark);on(key+'-form','change',mark);on(key+'-form','submit',event=>{event.preventDefault();run(()=>saveSection(key));});
  }
  on('preview-key','change',preview);
  on('apply-schedule','click',()=>{
    const opens=$('all-opens').value,closes=$('all-closes').value;
    if(!opens||!closes||opens>=closes){status('Indica apertura y cierre válidos dentro del mismo día.','error');return;}
    if(!win.confirm('¿Aplicar '+opens+'–'+closes+' a los siete días? Revisa y guarda después.'))return;
    const f=$('business-form').elements;for(const day of Object.keys(DAYS)){f.namedItem(day+'Closed').checked=false;f.namedItem(day+'opensAt').value=opens;f.namedItem(day+'closesAt').value=closes;}
    sectionDirty.add('business');controls(false);$('business-state').textContent='Horario aplicado al formulario, pendiente de guardar.';status('Revisa los horarios y pulsa Guardar negocio y horarios.');
  });
  on('add-payment-method','click',()=>{
    if($('payment-methods').children.length>=20){status('Admite hasta 20 medios de pago. Puedes reutilizar o desactivar los existentes.','error');return;}
    addMethodRow({id:repo.newProductId(businessId),label:'',detailsText:'',active:false,sortOrder:$('payment-methods').children.length});sectionDirty.add('payments');$('payments-state').textContent='Medio preparado. Completa los datos y guarda este apartado.';paymentPreview();
  });
  on('copy-payments','click',()=>run(async()=>{if(!win.navigator.clipboard?.writeText)throw new Error('El navegador no permite copiar automáticamente. Selecciona el texto de la vista previa y cópialo.');await win.navigator.clipboard.writeText($('payments-preview').textContent);status('Texto de la vista previa copiado. No se enviaron mensajes.','success');}));
  on('select-visible','change',()=>{for(const row of $('products-table').querySelectorAll('tr[data-product-id]')){if($('select-visible').checked)selectedProducts.add(row.dataset.productId);else selectedProducts.delete(row.dataset.productId);}renderProducts();});
  on('bulk-loading','click',()=>run(async()=>{
    requireReady();if(!selectedProducts.size)throw new Error('Selecciona al menos un producto.');
    const value=$('bulk-loading-value').value==='true',changes=products.filter(p=>selectedProducts.has(p.id)).map(p=>({id:p.id,data:{loadingUnloadingExtraApplies:value},expected:fingerprint(p.data)}));
    if(changes.some(c=>priceDrafts.has(c.id)))throw new Error('Guarda primero los precios pendientes de los productos seleccionados.');
    if(!win.confirm('¿Guardar el aviso de cargue en '+changes.length+' producto(s)? No se calculará ningún cargo.'))return;
    let saved=0;try{
      for(let start=0;start<changes.length;start+=100){await repo.saveProducts(businessId,changes.slice(start,start+100));saved+=Math.min(100,changes.length-start);}
      const result=await afterCommit(()=>repo.load(businessId));products=result.products;selectedProducts.clear();renderProducts();status('Aviso de cargue guardado en '+saved+' producto(s).','success');
    }catch(e){throw new Error('Se confirmaron '+saved+' cambios. Recarga y revisa antes de repetir. '+authError(e));}
  }));
  on('refresh-promotions','click',()=>run(loadPromotions));on('new-promotion','click',()=>openPromotion());
  on('promotion-form','input',()=>{promotionDirty=true;promotionPreview();});on('promotion-form','change',()=>{promotionDirty=true;promotionPreview();});
  on('close-promotion','click',closePromotion);on('cancel-promotion','click',closePromotion);on('promotion-dialog','cancel',event=>{event.preventDefault();closePromotion();});
  on('promotion-form','submit',event=>{event.preventDefault();run(async()=>{
    requireReady();if(!businessData||!promotionsLoaded)throw new Error('Guarda el negocio y carga las promociones primero.');
    const f=$('promotion-form').elements,input={};for(const field of Object.keys(blankPromotion()))input[field]=f[field].type==='checkbox'?f[field].checked:f[field].value;
    const data=validatePromotion(input),id=editingPromotion?.id??repo.newPromotionId(businessId);
    await repo.savePromotions(businessId,[{id,data,expected:editingPromotion?fingerprint(editingPromotion.data):null}]);promotionDirty=false;$('promotion-dialog').close();await afterCommit(loadPromotions);status('Promoción guardada en Firestore.','success');
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
