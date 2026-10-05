export const ADMIN_UID = 'UNVzgzxtFFPP52WaOImlzrMRhiV2';
export const RESPONSE_LABELS = {
  welcome: 'Saludo inicial', outOfHours: 'Fuera de horario', help: 'Ayuda',
  paymentMethods: 'Métodos de pago', deliveryInfo: 'Entregas',
  humanHandoff: 'Atención humana', orderReceived: 'Solicitud recibida',
  orderPendingConfirmation: 'Pedido pendiente de revisión',
  customerNamePrompt:'Nombre del cliente (opcional)',productAdded:'Producto agregado',cartHelp:'Ayuda del carrito',
  receiptReasonPrompt:'Motivo del pago',receiptReferencePrompt:'Referencia del pedido',receiptUploadPrompt:'Adjuntar comprobante',
  receiptReceived:'Comprobante recibido',noPromotions:'Sin promociones'
};
export const DAYS = {mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
export const PRODUCT_FIELDS = ['sku','name','description','category','unit','priceCOP','availability','active','sortOrder','allowDecimalQuantity','loadingUnloadingExtraApplies'];
export const AVAILABILITY = {available:'Disponible según el negocio',unavailable:'No disponible',check:'Consultar disponibilidad'};
export const CSV_COLUMNS = ['productId',...PRODUCT_FIELDS];
export const money = value => value === null ? 'Precio pendiente' : new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2}).format(value);
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
}
export const fingerprint = data => data == null ? null : canonical(data);
export function numberValue(value, {nullable=false, integer=false, min=0,max=1e12}={}) {
  if (value === null || String(value).trim() === '') {
    if (nullable) return null;
    throw new Error('Falta un valor numérico.');
  }
  if (typeof value !== 'number' && !/^\d+(?:[.,]\d{1,2})?$/.test(String(value).trim())) throw new Error('Usa números sin símbolos ni separadores de miles y con máximo dos decimales.');
  const n = typeof value === 'number' ? value : Number(String(value).trim().replace(',','.'));
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new Error('Número fuera del rango permitido.');
  if (!integer && Math.abs(n*100-Math.round(n*100)) > 0.001) throw new Error('Usa máximo dos decimales.');
  return n;
}
function text(value, name, max, required=false) {
  const s = String(value??'').trim();
  if ((required && !s) || s.length>max) throw new Error(name+': revisa el contenido (máximo '+max+' caracteres).');
  return s;
}
function boolean(value) {
  if (value===true || value==='true') return true;
  if (value===false || value==='false') return false;
  throw new Error('Los campos booleanos deben ser true o false.');
}
export function validateProduct(input) {
  const p = {
    sku:text(input.sku,'Código',80,true),name:text(input.name,'Nombre',160,true),
    description:text(input.description,'Descripción',500),category:normalizeCategory(text(input.category,'Categoría',100,true)),
    unit:text(input.unit,'Unidad de venta',60,true),
    priceCOP:numberValue(input.priceCOP,{nullable:true}),
    availability:String(input.availability??''),active:boolean(input.active),
    sortOrder:numberValue(input.sortOrder,{integer:true,max:1e6}),
    allowDecimalQuantity:boolean(input.allowDecimalQuantity),
    loadingUnloadingExtraApplies:boolean(input.loadingUnloadingExtraApplies??false)
  };
  if (!(p.availability in AVAILABILITY)) throw new Error('Disponibilidad inválida.');
  return p;
}
export function validateQuantity(value, product) {
  const q=numberValue(value,{integer:!product.allowDecimalQuantity,min:0.01,max:1e6});
  if (q<=0) throw new Error('La cantidad debe ser mayor que cero.');
  return q;
}
export const blankProduct = () => ({sku:'',name:'',description:'',category:'',unit:'unidad',priceCOP:null,availability:'check',active:false,sortOrder:0,allowDecimalQuantity:false,loadingUnloadingExtraApplies:false});
export function businessDefaults(id='ferreteria-johns') {
  return {
    schemaVersion:1, commercialName:id==='ferreteria-johns' ? "Ferretería John's" : '',
    customerWhatsApp:id==='ferreteria-johns'?'+573168026222':'',
    internalNotificationWhatsApp:null,address:'',locationUrl:'',timezone:'America/Bogota',
    schedule:Object.fromEntries(Object.keys(DAYS).map(day=>[day,{closed:id!=='ferreteria-johns',opensAt:id==='ferreteria-johns'?'08:00':null,closesAt:id==='ferreteria-johns'?'17:00':null}])),
    responses:{
      welcome:id==='ferreteria-johns'?"👋 Bienvenido a Ferretería John's. 🤖 Puedes consultar productos y preparar solicitudes las 24 horas. 🏪 La atención presencial y de nuestros vendedores es todos los días de 8:00 a. m. a 5:00 p. m.":'👋 Bienvenido. Puedes consultar productos y preparar solicitudes las 24 horas. Consulta el horario de atención personal del negocio.',
      outOfHours:'🌙 En este momento estamos fuera del horario de atención personal. Puedes consultar productos y dejar tu solicitud; un vendedor la revisará cuando abra.',
      help:'Selecciona una opción del menú para consultar productos, preparar una solicitud o hablar con un vendedor.',
      paymentMethods:'Consulta con un vendedor los métodos de pago disponibles antes de realizar un pago.',
      deliveryInfo:'Consulta con un vendedor las condiciones, cobertura y costo de la entrega.',
      humanHandoff:'🙋 Tu conversación queda pendiente de atención personal. Un vendedor continuará por este mismo chat en horario de atención.',
      orderReceived:'📨 Recibimos tu solicitud.',
      orderPendingConfirmation:'El vendedor revisará disponibilidad, precios, pago y entrega. Esta solicitud todavía no confirma una venta.',
      customerNamePrompt:'👤 ¿A nombre de quién dejamos tu consulta o solicitud? Puedes escribir tu nombre o seleccionar Omitir.',
      productAdded:'✅ Producto agregado. Puedes agregar más productos, ver el carrito o terminar tu solicitud.',
      cartHelp:'🧺 Revisa tu carrito. Puedes agregar productos, modificar cantidades o quitar artículos antes de terminar.',
      receiptReasonPrompt:'📝 Indica el motivo o la descripción del pago.',
      receiptReferencePrompt:'🔎 Puedes indicar la referencia de tu pedido o seleccionar Omitir.',
      receiptUploadPrompt:'📎 Adjunta el comprobante como imagen o PDF.',
      receiptReceived:'📎 Comprobante recibido. El vendedor verificará el pago.',
      noPromotions:'🏷️ Actualmente no hay promociones publicadas. Puedes consultar nuestros productos o hablar con un vendedor.'
    }
  };
}
export function validateBusinessInfo(input) {
  const b = {schemaVersion:1,commercialName:text(input.commercialName,'Nombre comercial',160,true),
    customerWhatsApp:text(input.customerWhatsApp,'WhatsApp de atención',20,true),
    address:text(input.address,'Dirección',500),locationUrl:text(input.locationUrl,'Ubicación',1000),
    timezone:'America/Bogota',schedule:{}};
  if (!/^\+[1-9]\d{7,14}$/.test(b.customerWhatsApp)) throw new Error('El número debe incluir + e indicativo, sin espacios.');
  if (b.locationUrl) {
    let u;try {u=new URL(b.locationUrl);}catch{throw new Error('La ubicación debe ser una URL válida.');}
    if (u.protocol!=='https:') throw new Error('Usa una ubicación con https.');
  }
  for (const day of Object.keys(DAYS)) {
    const s=input.schedule?.[day];if(!s)throw new Error('Falta el horario de '+DAYS[day]);
    if (s.closed) b.schedule[day]={closed:true,opensAt:null,closesAt:null};
    else {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.opensAt)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.closesAt)||s.opensAt>=s.closesAt) throw new Error('Revisa '+DAYS[day]+': cierre posterior a apertura, dentro del mismo día.');
      b.schedule[day]={closed:false,opensAt:s.opensAt,closesAt:s.closesAt};
    }
  }
  return b;
}
export function validateResponses(input) {
  const responses={};
  for (const key of Object.keys(RESPONSE_LABELS)) responses[key]=literal(input?.[key],RESPONSE_LABELS[key],2000,true);
  return responses;
}
export function validateBusiness(input) {
  const b=validateBusinessInfo(input);
  b.responses=validateResponses(input.responses);
  if ('internalNotificationWhatsApp' in input) {
    const phone=text(input.internalNotificationWhatsApp,'Número interno',20)||null;
    if(phone&&(!/^\+[1-9]\d{7,14}$/.test(phone)||phone===b.customerWhatsApp))throw new Error('Número interno inválido o igual al de atención.');
    b.internalNotificationWhatsApp=phone;
  }
  return b;
}
export const normalizeCategory=value=>String(value??'').trim().replace(/\s+/g,' ');
export const categoryKey=value=>normalizeCategory(value).toLocaleLowerCase('es');
export function literal(value,name,max=4000,required=false) {
  const s=text(value,name,max,required);
  if(/[{}]/.test(s))throw new Error(name+': no se admiten variables ni llaves.');
  return s;
}
export function httpsUrl(value,name='Imagen') {
  const s=text(value,name,1000);
  if(!s)return '';
  let u;try{u=new URL(s);}catch{throw new Error(name+': usa una URL HTTPS pública o deja vacío.');}
  if(u.protocol!=='https:'||u.username||u.password)throw new Error(name+': usa una URL HTTPS sin credenciales.');
  if(u.href.length>1000)throw new Error(name+': la URL es demasiado larga.');
  return u.href;
}
export function deliveryDefaults(id) {
  const johns=id==='ferreteria-johns';
  return {pickupEnabled:johns,deliveryEnabled:johns,freightUpTo300KgCOP:johns?17000:0,
    freightOver300UpTo900KgCOP:johns?19000:0,loadingUnloadingPerTripCOP:johns?15000:0,
    conditionsText:johns?'🚚 El flete cuesta $17.000 por viaje hasta 300 kg y $19.000 por viaje para cargas de más de 300 y hasta 900 kg. Para cargas mayores, el vendedor determina los viajes necesarios y confirma el costo total.\n\n🧱 El precio de ladrillo, farol, arena y mixto no incluye cargue ni descargue. Si solicitas ese servicio, tiene un costo adicional de $15.000 por viaje, sujeto a coordinación con el vendedor.\n\n📍 La entrega se realiza en la puerta de la casa; no incluye ingresar los materiales al domicilio.\n\nEl domicilio se realiza después de acordar el pedido con el vendedor y de que este verifique el pago.':'Consulta con el vendedor las condiciones y el costo final de entrega.'};
}
export function validateDelivery(input) {
  return {pickupEnabled:boolean(input.pickupEnabled),deliveryEnabled:boolean(input.deliveryEnabled),
    freightUpTo300KgCOP:numberValue(input.freightUpTo300KgCOP),freightOver300UpTo900KgCOP:numberValue(input.freightOver300UpTo900KgCOP),
    loadingUnloadingPerTripCOP:numberValue(input.loadingUnloadingPerTripCOP),conditionsText:literal(input.conditionsText,'Condiciones de entrega',4000,true)};
}
export const paymentsDefaults=()=>({isExample:true,instructionsText:'💳 Información de pago de ejemplo. No realices transferencias con estos datos. Consulta al vendedor los medios autorizados.',imageUrl:'',methods:[
  {id:'example-bank-transfer',label:'Transferencia bancaria · EJEMPLO',detailsText:'Banco: [BANCO]\nTipo de cuenta: [TIPO]\nNúmero: [NÚMERO DE CUENTA]\nTitular: [TITULAR]',active:false,sortOrder:0},
  {id:'example-digital-wallet',label:'Billetera digital · EJEMPLO',detailsText:'Billetera: [BILLETERA]\nNúmero: [NÚMERO]\nTitular: [TITULAR]',active:false,sortOrder:1},
  {id:'example-in-store',label:'Pago en el negocio · EJEMPLO',detailsText:'Pendiente de definir con el vendedor.',active:false,sortOrder:2}]});
export function validatePayments(input) {
  if(!Array.isArray(input.methods)||input.methods.length>20)throw new Error('Admite hasta 20 medios de pago.');
  const ids=new Set();
  const methods=input.methods.map(m=>{
    const id=text(m.id,'ID del medio de pago',100,true);
    if(!/^[A-Za-z0-9_-]+$/.test(id)||ids.has(id))throw new Error('ID de medio de pago inválido o repetido.');ids.add(id);
    return {id,label:literal(m.label,'Nombre del medio de pago',160,true),detailsText:literal(m.detailsText,'Detalles del pago',2000,true),active:boolean(m.active),sortOrder:numberValue(m.sortOrder,{integer:true,max:1e6})};
  });
  const p={isExample:boolean(input.isExample),instructionsText:literal(input.instructionsText,'Instrucciones de pago',4000,true),imageUrl:httpsUrl(input.imageUrl),methods};
  if(!p.isExample && /\[[^\]]+\]/.test([p.instructionsText,...methods.filter(m=>m.active).flatMap(m=>[m.label,m.detailsText])].join('\n')))throw new Error('Reemplaza los marcadores de ejemplo antes de confirmar datos de pago reales.');
  return p;
}
export const blankPromotion=()=>({title:'',description:'',imageUrl:'',active:false,sortOrder:0});
export function validatePromotion(input) {
  return {title:literal(input.title,'Título',160,true),description:literal(input.description,'Descripción de promoción',4000,true),imageUrl:httpsUrl(input.imageUrl),active:boolean(input.active),sortOrder:numberValue(input.sortOrder,{integer:true,max:1e6})};
}
export function parseCSV(source) {
  const s=source.replace(/^\uFEFF/,'');
  const first=s.split(/\r?\n/,1)[0], delimiter=first.includes(';')?';':',';
  const rows=[];let row=[],value='',quoted=false,afterQuote=false;
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(quoted){
      if(c==='"'){if(s[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;}}
      else value+=c;
    }else if(c==='"'){
      if(value||afterQuote)throw new Error('Comillas CSV mal ubicadas.');
      quoted=true;
    }else if(c===delimiter){
      row.push(value);value='';afterQuote=false;
    }else if(c==='\n'||c==='\r'){
      if(c==='\r'&&s[i+1]==='\n')i++;
      row.push(value);if(row.some(x=>x!==''))rows.push(row);
      row=[];value='';afterQuote=false;
    }else {
      if(afterQuote)throw new Error('Contenido después de comillas de cierre.');
      value+=c;
    }
  }
  if(quoted)throw new Error('Comillas CSV sin cerrar.');
  row.push(value);if(row.some(x=>x!==''))rows.push(row);
  if(!rows.length)throw new Error('El archivo está vacío.');
  const headers=rows.shift().map(x=>x.trim());
  if(new Set(headers).size!==headers.length||headers.some(k=>!CSV_COLUMNS.includes(k))||CSV_COLUMNS.filter(k=>k!=='loadingUnloadingExtraApplies').some(k=>!headers.includes(k)))throw new Error('Usa las columnas exactas del CSV exportado o de la plantilla.');
  return rows.map((r,i)=>{
    if(r.length!==headers.length)throw new Error('Registro '+(i+2)+': número de columnas incorrecto.');
    return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));
  });
}
export function prepareImport(source, existing) {
  const rows=parseCSV(source),errors=[],changes=[],seenIds=new Set(),seenCodes=new Set();
  const codes=new Map(existing.map(p=>[p.sku.toLocaleLowerCase(),p.id])),categories=new Map(existing.map(p=>[categoryKey(p.category),normalizeCategory(p.category)]));
  rows.forEach((row,index)=>{
    try{
      const id=row.productId.trim();
      if(id&&!/^[A-Za-z0-9_-]{1,100}$/.test(id))throw new Error('ID inválido.');
      if(id&&seenIds.has(id))throw new Error('ID repetido en el archivo.');
      if(id)seenIds.add(id);
      // Deshacer únicamente el escape de fórmulas que utiliza nuestra exportación.
      for(const key of ['sku','name','description','category','unit'])if(/^'[=+@\-\t\r]/.test(row[key]))row[key]=row[key].slice(1);
      const old=existing.find(x=>x.id===id);
      if(!Object.hasOwn(row,'loadingUnloadingExtraApplies'))row.loadingUnloadingExtraApplies=old?.loadingUnloadingExtraApplies??false;
      const p=validateProduct(row),code=p.sku.toLocaleLowerCase();
      const catKey=categoryKey(p.category);if(categories.has(catKey))p.category=categories.get(catKey);else categories.set(catKey,p.category);
      if(seenCodes.has(code))throw new Error('Código repetido en el archivo.');
      seenCodes.add(code);
      if(id&&!old)throw new Error('El ID no existe. Para crear un producto deja productId vacío.');
      if(codes.has(code)&&codes.get(code)!==id)throw new Error('El código pertenece a otro producto. Usa su productId para editarlo.');
      const diff=old?PRODUCT_FIELDS.filter(k=>canonical(k==='loadingUnloadingExtraApplies'?(old[k]??false):old[k])!==canonical(p[k])):PRODUCT_FIELDS;
      if(diff.length)changes.push({id:id||null,data:p,expected:old?fingerprint(old.data):null,before:old??null,fields:diff,row:index+2});
    }catch(e){errors.push('Registro '+(index+2)+': '+e.message);}
  });
  return {changes,errors,total:rows.length};
}
export function exportCSV(products) {
  const cell=x=>{
    let v=x===null||x===undefined?'':String(x);
    // Evitar ejecución de fórmulas al abrir textos en Excel; quitar el apóstrofo al reimportar si se necesita.
    if(/^[=+@\-\t\r]/.test(v))v="'"+v;
    return '"'+v.replaceAll('"','""')+'"';
  };
  return '\uFEFF'+[CSV_COLUMNS,...products.map(p=>[p.id??'',...PRODUCT_FIELDS.map(k=>k==='loadingUnloadingExtraApplies'?(p[k]??false):p[k])])].map(r=>r.map(cell).join(';')).join('\r\n');
}
