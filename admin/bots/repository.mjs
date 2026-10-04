import {fingerprint} from './model.mjs';
export function createRepository(sdk,db,uid) {
  const {doc,collection,getDocsFromServer,getDocFromServer,runTransaction,serverTimestamp}=sdk;
  const businessRef=id=>doc(db,'businesses',id);
  const productCollection=id=>collection(db,'businesses',id,'products');
  function conflict(message='Hay cambios más recientes. Recarga y revisa antes de guardar.') {
    const e=new Error(message);e.code='conflict';return e;
  }
  const metadata=old=>({schemaVersion:1,revision:(old?.revision??0)+1,updatedAt:serverTimestamp(),updatedBy:uid,
    ...(!old?{createdAt:serverTimestamp(),createdBy:uid}:{})});
  return {
    async listBusinesses(){const snap=await getDocsFromServer(collection(db,'businesses'));return snap.docs.map(d=>({id:d.id,data:d.data()}));},
    async load(id){
      const [business,products]=await Promise.all([getDocFromServer(businessRef(id)),getDocsFromServer(productCollection(id))]);
      return {business:business.exists()?business.data():null,products:products.docs.map(d=>({id:d.id,...d.data(),data:d.data()}))};
    },
    async saveBusiness(id,data,expected){
      const ref=businessRef(id);
      await runTransaction(db,async tx=>{
        const snap=await tx.get(ref),old=snap.exists()?snap.data():null;
        if(fingerprint(old)!==expected)throw conflict();
        const next={...data,...metadata(old)};
        if(old)tx.update(ref,next);else tx.set(ref,next);
      });
    },
    newProductId(id){return doc(productCollection(id)).id;},
    async saveProducts(id,changes){
      if(!changes.length)return;
      // Una sola transacción: si cualquier producto cambió, no se aplica ninguno.
      const refs=changes.map(c=>doc(productCollection(id),c.id));
      await runTransaction(db,async tx=>{
        const snapshots=await Promise.all(refs.map(ref=>tx.get(ref)));
        snapshots.forEach((snap,i)=>{
          const old=snap.exists()?snap.data():null;
          if(fingerprint(old)!==changes[i].expected)throw conflict('El producto '+(changes[i].data.name??changes[i].id)+' cambió. Recarga y vuelve a revisar; no se guardó este grupo.');
        });
        snapshots.forEach((snap,i)=>{
          const old=snap.exists()?snap.data():null,change=changes[i];
          const patch={...change.data,...metadata(old)};
          if(old)tx.update(refs[i],patch);else tx.set(refs[i],patch);
        });
      });
    }
  };
}
