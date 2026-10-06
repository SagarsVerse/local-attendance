function todayKey(d=new Date()){return d.toISOString().slice(0,10)}
function timeToMinutes(t){const [h,m]=t.split(":").map(Number);return h*60+m}
function minutesToText(min){min=Math.max(0,Math.round(min));const h=Math.floor(min/60),m=min%60;return `${h}h ${String(m).padStart(2,"0")}m`}
function fmtTime(t){if(!t)return "—";const [h,m]=t.split(":").map(Number);const d=new Date();d.setHours(h,m,0,0);return d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}
function nowTime(){const d=new Date();return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
function showAlert(msg,type="success"){const box=document.getElementById("alertBox");if(!box)return;box.innerHTML=`<div class="alert alert-${type} alert-dismissible fade show">${msg}<button class="btn-close" data-bs-dismiss="alert"></button></div>`;setTimeout(()=>box.innerHTML="",3500)}
function registerSW(){if("serviceWorker"in navigator)navigator.serviceWorker.register(location.pathname.replace(/\/[^/]*$/,"/")+"sw.js").catch(()=>{})}
function startClock(){
  const el=document.getElementById("liveClock"),label=document.getElementById("todayLabel");
  const tick=()=>{const d=new Date();if(el)el.textContent=d.toLocaleTimeString();if(label)label.textContent=d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"})};
  tick();setInterval(tick,1000);
}
async function initDashboard(){
  startClock();
  const employees=await dbGetAll("employees"), records=(await dbGetAll("attendance")).filter(x=>x.date===todayKey());
  document.getElementById("statEmployees").textContent=employees.length;
  document.getElementById("statPresent").textContent=records.filter(x=>x.status==="Present").length;
  document.getElementById("statLate").textContent=records.filter(x=>x.lateMinutes>0).length;
  document.getElementById("statOT").textContent=minutesToText(records.reduce((a,x)=>a+(x.overtimeMinutes||0),0));
  const names=Object.fromEntries(employees.map(e=>[e.id,e.name]));
  const body=document.getElementById("todayTable");
  body.innerHTML=records.length?records.map(r=>`<tr><td class="fw-semibold">${escapeHtml(names[r.employeeId]||"Unknown")}</td><td>${fmtTime(r.checkIn)}</td><td>${fmtTime(r.checkOut)}</td><td>${minutesToText(r.workingMinutes||0)}</td><td><span class="badge text-bg-${r.status==="Present"?"success":"secondary"} badge-status">${r.status}</span></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No attendance marked today.</td></tr>`;
  const exp=document.getElementById("exportBtn"),imp=document.getElementById("importBtn"),file=document.getElementById("importFile");
  exp.onclick=exportBackup;imp.onclick=()=>file.click();file.onchange=async()=>{try{await importBackup(file.files[0]);showAlert("Backup restored successfully.");setTimeout(()=>location.reload(),700)}catch(e){showAlert(e.message,"danger")}};
  const install=document.getElementById("installBtn"); if(window.deferredPrompt){install.hidden=false;install.onclick=async()=>{window.deferredPrompt.prompt();window.deferredPrompt=null;install.hidden=true}}
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.deferredPrompt=e});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
