async function loadReportsPage(){
  const employees=await dbGetAll("employees"),rows=await dbGetAll("attendance"),names=Object.fromEntries(employees.map(e=>[e.id,e.name]));
  const month=document.getElementById("monthFilter");month.value=new Date().toISOString().slice(0,7);
  const render=()=>{const prefix=month.value,filtered=rows.filter(r=>r.date.startsWith(prefix));let work=0,ot=0,late=0,early=0;
    filtered.forEach(r=>{work+=r.workingMinutes||0;ot+=r.overtimeMinutes||0;late+=r.lateMinutes||0;early+=r.earlyOutMinutes||0});
    document.getElementById("summary").innerHTML=`<div class="col-6 col-lg-3"><div class="stat-card"><span>Records</span><strong>${filtered.length}</strong></div></div><div class="col-6 col-lg-3"><div class="stat-card"><span>Working</span><strong>${minutesToText(work)}</strong></div></div><div class="col-6 col-lg-3"><div class="stat-card"><span>Overtime</span><strong>${minutesToText(ot)}</strong></div></div><div class="col-6 col-lg-3"><div class="stat-card"><span>Late</span><strong>${minutesToText(late)}</strong></div></div>`;
    document.getElementById("reportBody").innerHTML=filtered.length?filtered.sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<tr><td>${r.date}</td><td>${escapeHtml(names[r.employeeId]||"Unknown")}</td><td>${fmtTime(r.checkIn)}</td><td>${fmtTime(r.checkOut)}</td><td>${minutesToText(r.workingMinutes)}</td><td>${r.lateMinutes}m</td><td>${r.earlyOutMinutes}m</td><td>${minutesToText(r.overtimeMinutes)}</td></tr>`).join(""):`<tr><td colspan="8" class="empty">No records for this month.</td></tr>`;
  };month.onchange=render;render();
}
