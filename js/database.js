const DB_NAME="LocalAttendanceDB",DB_VERSION=1;
let dbPromise;

function openDB(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=e=>{
      const db=e.target.result;
      if(!db.objectStoreNames.contains("employees")){
        const s=db.createObjectStore("employees",{keyPath:"id",autoIncrement:true});
        s.createIndex("employeeCode","employeeCode",{unique:true});
      }
      if(!db.objectStoreNames.contains("attendance")){
        const s=db.createObjectStore("attendance",{keyPath:"id",autoIncrement:true});
        s.createIndex("date","date"); s.createIndex("employeeId","employeeId");
      }
      if(!db.objectStoreNames.contains("leaves")){
        const s=db.createObjectStore("leaves",{keyPath:"id",autoIncrement:true});
        s.createIndex("employeeId","employeeId");
      }
      if(!db.objectStoreNames.contains("holidays")){
        const s=db.createObjectStore("holidays",{keyPath:"id",autoIncrement:true});
        s.createIndex("date","date",{unique:true});
      }
      if(!db.objectStoreNames.contains("settings"))db.createObjectStore("settings",{keyPath:"key"});
    };
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}
async function tx(store,mode="readonly"){
  const db=await openDB(); return db.transaction(store,mode).objectStore(store);
}
function reqPromise(req){return new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
async function dbGetAll(store){return reqPromise((await tx(store)).getAll())}
async function dbGet(store,key){return reqPromise((await tx(store)).get(key))}
async function dbPut(store,value){return reqPromise((await tx(store,"readwrite")).put(value))}
async function dbAdd(store,value){return reqPromise((await tx(store,"readwrite")).add(value))}
async function dbDelete(store,key){return reqPromise((await tx(store,"readwrite")).delete(key))}
async function dbClear(store){return reqPromise((await tx(store,"readwrite")).clear())}

const DEFAULT_SETTINGS={
  shiftStart:"10:00",shiftEnd:"18:00",graceMinutes:10,breakMinutes:60,
  overtimeEnabled:true,earlyOutEnabled:true,lateEnabled:true
};
async function getSettings(){
  const rows=await dbGetAll("settings"), s={...DEFAULT_SETTINGS};
  rows.forEach(x=>s[x.key]=x.value);
  return s;
}
async function saveSettings(obj){
  for(const [key,value] of Object.entries(obj))await dbPut("settings",{key,value});
}

async function exportBackup(){
  const data={version:1,exportedAt:new Date().toISOString()};
  for(const store of ["employees","attendance","leaves","holidays","settings"])data[store]=await dbGetAll(store);
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`attendance-backup-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href);
}
async function importBackup(file){
  const data=JSON.parse(await file.text());
  if(!data || !Array.isArray(data.employees)||!Array.isArray(data.attendance))throw new Error("Invalid backup file");
  for(const store of ["employees","attendance","leaves","holidays","settings"])await dbClear(store);
  for(const e of data.employees)await dbPut("employees",e);
  for(const e of data.attendance)await dbPut("attendance",e);
  for(const e of (data.leaves||[]))await dbPut("leaves",e);
  for(const e of (data.holidays||[]))await dbPut("holidays",e);
  for(const e of (data.settings||[]))await dbPut("settings",e);
}
