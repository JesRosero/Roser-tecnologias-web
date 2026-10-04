export const ADMIN_UID = 'UNVzgzxtFFPP52WaOImlzrMRhiV2';
export const RESPONSE_LABELS = {
  welcome: 'Saludo inicial', outOfHours: 'Fuera de horario', help: 'Ayuda',
  paymentMethods: 'Métodos de pago', deliveryInfo: 'Entregas',
  humanHandoff: 'Atención humana', orderReceived: 'Solicitud recibida',
  orderPendingConfirmation: 'Pedido pendiente de revisión'
};
export const DAYS = {mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
export const PRODUCT_FIELDS = ['sku','name','description','category','unit','priceCOP','availability','active','sortOrder','allowDecimalQuantity'];
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
    description:text(input.description,'Descripción',500),category:text(input.category,'Categoría',100,true),
    unit:text(input.unit,'Unidad de venta',60,true),
    priceCOP:numberValue(input.priceCOP,{nullable:true}),
    availability:String(input.availability??''),active:boolean(input.active),
    sortOrder:numberValue(input.sortOrder,{integer:true,max:1e6}),
    allowDecimalQuantity:boolean(input.allowDecimalQuantity)
  };
  if (!(p.availability in AVAILABILITY)) throw new Error('Disponibilidad inválida.');
  return p;
}
export function validateQuantity(value, product) {
  const q=numberValue(value,{integer:!product.allowDecimalQuantity,min:0.01,max:1e6});
  if (q<=0) throw new Error('La cantidad debe ser mayor que cero.');
  return q;
}
export const blankProduct = () => ({sku:'',name:'',description:'',category:'',unit:'unidad',priceCOP:null,availability:'check',active:false,sortOrder:0,allowDecimalQuantity:false});
export function businessDefaults(id='ferreteria-johns') {
  return {
    schemaVersion:1, commercialName:id==='ferreteria-johns' ? "Ferretería John's" : '',
    customerWhatsApp:id==='ferreteria-johns'?'+573168026222':'',
    internalNotificationWhatsApp:null,address:'',locationUrl:'',timezone:'America/Bogota',
    schedule:Object.fromEntries(Object.keys(DAYS).map(day=>[day,{closed:true,opensAt:null,closesAt:null}])),
    responses:{
      welcome:'Hola. Bienvenido a nuestra atención por WhatsApp. Puedes consultar productos o solicitar atención de un vendedor.',
      outOfHours:'En este momento estamos fuera del horario de atención. Un vendedor revisará tu consulta cuando esté disponible.',
      help:'Selecciona una opción del menú para consultar productos, preparar una solicitud o hablar con un vendedor.',
      paymentMethods:'Consulta con un vendedor los métodos de pago disponibles antes de realizar un pago.',
      deliveryInfo:'Consulta con un vendedor las condiciones, cobertura y costo de la entrega.',
      humanHandoff:'Solicitaste atención humana. Un vendedor atenderá tu consulta según su disponibilidad.',
      orderReceived:'Recibimos tu solicitud de pedido. Está pendiente de revisión por un vendedor.',
      orderPendingConfirmation:'El total es estimado. El pedido está pendiente de revisar disponibilidad y confirmar precios, pago y entrega con un vendedor.'
    }
  };
}
export function validateBusiness(input) {
  const b = {schemaVersion:1,commercialName:text(input.commercialName,'Nombre comercial',160,true),
    customerWhatsApp:text(input.customerWhatsApp,'WhatsApp de atención',20,true),
    internalNotificationWhatsApp:text(input.internalNotificationWhatsApp,'Número interno',20)||null,
    address:text(input.address,'Dirección',500),locationUrl:text(input.locationUrl,'Ubicación',1000),
    timezone:'America/Bogota',schedule:{},responses:{}};
  for (const phone of [b.customerWhatsApp,b.internalNotificationWhatsApp].filter(Boolean)) if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Los números deben incluir + e indicativo, sin espacios.');
  if (b.internalNotificationWhatsApp===b.customerWhatsApp) throw new Error('El número interno debe ser diferente al de atención. Deja el campo vacío si no está definido.');
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
  for (const key of Object.keys(RESPONSE_LABELS)) {
    const v=text(input.responses?.[key],RESPONSE_LABELS[key],2000,true);
    if (/[{}]/.test(v)||v.includes('$'+'{'))throw new Error(RESPONSE_LABELS[key]+': no se admiten variables ni llaves.');
    b.responses[key]=v;
  }
  return b;
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
  if(headers.length!==CSV_COLUMNS.length||new Set(headers).size!==headers.length||CSV_COLUMNS.some(k=>!headers.includes(k)))throw new Error('Usa las columnas exactas del CSV exportado o de la plantilla.');
  return rows.map((r,i)=>{
    if(r.length!==headers.length)throw new Error('Registro '+(i+2)+': número de columnas incorrecto.');
    return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));
  });
}
export function prepareImport(source, existing) {
  const rows=parseCSV(source),errors=[],changes=[],seenIds=new Set(),seenCodes=new Set();
  const codes=new Map(existing.map(p=>[p.sku.toLocaleLowerCase(),p.id]));
  rows.forEach((row,index)=>{
    try{
      const id=row.productId.trim();
      if(id&&!/^[A-Za-z0-9_-]{1,100}$/.test(id))throw new Error('ID inválido.');
      if(id&&seenIds.has(id))throw new Error('ID repetido en el archivo.');
      if(id)seenIds.add(id);
      // Deshacer únicamente el escape de fórmulas que utiliza nuestra exportación.
      for(const key of ['sku','name','description','category','unit'])if(/^'[=+@\-\t\r]/.test(row[key]))row[key]=row[key].slice(1);
      const p=validateProduct(row),code=p.sku.toLocaleLowerCase();
      if(seenCodes.has(code))throw new Error('Código repetido en el archivo.');
      seenCodes.add(code);
      const old=existing.find(x=>x.id===id);
      if(id&&!old)throw new Error('El ID no existe. Para crear un producto deja productId vacío.');
      if(codes.has(code)&&codes.get(code)!==id)throw new Error('El código pertenece a otro producto. Usa su productId para editarlo.');
      const diff=old?PRODUCT_FIELDS.filter(k=>canonical(old[k])!==canonical(p[k])):PRODUCT_FIELDS;
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
  return '\uFEFF'+[CSV_COLUMNS,...products.map(p=>[p.id??'',...PRODUCT_FIELDS.map(k=>p[k])])].map(r=>r.map(cell).join(';')).join('\r\n');
}
