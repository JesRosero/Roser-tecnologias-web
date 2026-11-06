// El servidor local agrega este puente solo a una vista solicitada por el administrador.
(()=>{
 let ctx;try{const token=new URLSearchParams(location.search).get('__roser_visual');ctx=parent!==window&&parent.location.origin===location.origin&&parent.__roserVisual;if(!ctx||ctx.token!==token||!parent.location.pathname.endsWith('/admin/visual.html'))return;}catch{return;}
 const real=window.fetch.bind(window);let model=null;const estado={pendientes:0,cargado:false,aplicar(pares){if(!model)return;for(const [path,value]of pares){let n=model;for(const k of path.slice(0,-1)){if(n[k]===undefined){n=null;break;}n=n[k];}if(n)n[path.at(-1)]=value;}}};window.__roserPuente=estado;
 window.fetch=async(input,init)=>{
  const u=new URL(typeof input==='string'?input:input.url,location.href);estado.pendientes++;
  try{
   if(u.origin===location.origin&&u.pathname===ctx.archivo){
    model=JSON.parse(JSON.stringify(ctx.leer()));
    if(ctx.mostrar?.tipo==='proyecto'){const p=model.proyectos.find(p=>p.id===ctx.mostrar.id);if(p)p.visible=true;}
    if(ctx.mostrar?.tipo==='producto'){const p=model.productos.find(p=>p.id===ctx.mostrar.id);if(p){p.visible=true;const g=model.grupos.find(g=>g.id===p.grupo),s=model.subcategorias.find(s=>s.id===p.subcategoria);if(g)g.visible=true;if(s)s.visible=true;}}
    const res=new Response(JSON.stringify(model),{status:200,headers:{'Content-Type':'application/json'}});
    Object.defineProperty(res,'json',{value:async()=>{estado.cargado=true;return model;}});return res;
   }
   return await real(input,init);
  }finally{estado.pendientes--;}
 };
})();
