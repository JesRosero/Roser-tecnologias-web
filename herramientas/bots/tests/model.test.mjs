import test from 'node:test';
import assert from 'node:assert/strict';
import {numberValue,validateProduct,validateQuantity,validateBusiness,businessDefaults,blankProduct,exportCSV,prepareImport,parseCSV,fingerprint} from '../../../admin/bots/model.mjs';
const product=()=>({...blankProduct(),sku:'TEST-1',name:'Ejemplo de prueba',category:'Pruebas',priceCOP:12500,active:false});
test('precio pendiente, cero, decimales y formatos inválidos',()=>{
  assert.equal(numberValue('',{nullable:true}),null);
  assert.equal(numberValue('0',{nullable:true}),0);
  assert.equal(numberValue('1234,50'),1234.5);
  for(const s of ['-1','1.234.567','1,000','$500','1e5','NaN','Infinity','2.555'])assert.throws(()=>numberValue(s));
  assert.equal(validateProduct({...product(),priceCOP:''}).priceCOP,null);
  assert.equal(validateProduct({...product(),priceCOP:'0'}).priceCOP,0);
  assert.throws(()=>validateQuantity('1.5',product()));
  assert.equal(validateQuantity('1.5',{allowDecimalQuantity:true}),1.5);
  assert.throws(()=>validateQuantity('0',product()));
});
test('negocio sin variables, teléfonos y horarios válidos',()=>{
  const b=businessDefaults();assert.equal(validateBusiness(b).customerWhatsApp,'+573168026222');
  assert.throws(()=>validateBusiness({...b,internalNotificationWhatsApp:b.customerWhatsApp}));
  assert.throws(()=>validateBusiness({...b,responses:{...b.responses,welcome:'Hola {{name}}'}}));
  assert.throws(()=>validateBusiness({...b,locationUrl:'javascript:alert(1)'}));
  assert.throws(()=>validateBusiness({...b,schedule:{...b.schedule,mon:{closed:false,opensAt:'17:00',closesAt:'08:00'}}}));
});
test('CSV Excel: BOM, Unicode, comillas, punto y coma, saltos, null y cero',()=>{
  const p={...product(),id:'fixed-id',name:'Tornillo; prueba "A"',description:'Primera línea\nSegunda línea',priceCOP:null};
  const csv=exportCSV([p]),rows=parseCSV(csv);
  assert.equal(rows[0].name,p.name);assert.equal(rows[0].description,p.description);
  const existing={...p,data:{...p}};
  const result=prepareImport(csv,[existing]);
  assert.deepEqual(result.errors,[]);assert.equal(result.changes.length,0);
  const changed=exportCSV([{...p,priceCOP:0}]);
  assert.equal(prepareImport(changed,[existing]).changes[0].data.priceCOP,0);
  assert.equal(prepareImport(exportCSV([{...product(),id:''}]),[]).changes[0].id,null);
  assert.throws(()=>parseCSV('a;b\n1;2'));
  assert.throws(()=>parseCSV(csv+'\n"sin cerrar'));
  assert.equal(prepareImport(exportCSV([{...p,id:'unknown'}]),[]).errors.length,1);
  assert.equal(prepareImport(exportCSV([{...p,id:''},{...p,id:''}]),[]).errors.length,1);
  const formula=exportCSV([{...product(),name:'=HYPERLINK("bad")'}]);assert.ok(formula.includes("'=HYPERLINK"));
  assert.equal(prepareImport(formula,[]).changes[0].data.name,'=HYPERLINK("bad")');
});
test('huella ignora orden de claves, detecta cambios fuera del precio',()=>{
  assert.equal(fingerprint({a:1,b:2}),fingerprint({b:2,a:1}));
  assert.notEqual(fingerprint({a:1,b:2}),fingerprint({a:1,b:3}));
});
