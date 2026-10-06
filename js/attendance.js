async function loadAttendancePage(){
  const employees=await dbGetAll("employees"), settings=await getSettings();
  const select=document.getElementById("employeeSelect");
  select.innerHTML=employees.length?employees.map(e=>`<option value="${e.id}">${escapeHtml(e.employeeCode)} — ${escapeHtml(e.name)}</option>`).join(""):`<option value="">Add an employee first</option>`;
  document.getElementById("shiftInfo").textContent=`Shift ${fmtTime(settings.shiftStart)} – ${fmtTime(settings.shiftEnd)} • Grace ${settings.graceMinutes} min`;
  document.getElementById("markBtn").onclick=()=>markCheckIn();
  document.getElementById("checkoutBtn").onclick=()=>markCheckOut();
  await renderToday();
}
async function markCheckIn(){
  const employeeId=Number(document.getElementById("employeeSelect").value);if(!employeeId)return showAlert("Please add/select an employee.","warning");
  const date=todayKey(), rows=await dbGetAll("attendance"), existing=rows.find(x=>x.employeeId===employeeId&&x.date===date);
  if(existing)return showAlert("Check-in already exists for today.","warning");
  const s=await getSettings(), checkIn=nowTime(), late=Math.max(0,timeToMinutes(checkIn)-timeToMinutes(s.shiftStart)-Number(s.graceMinutes||0));
  await dbAdd("attendance",{employeeId,date,checkIn,checkOut:null,workingMinutes:0,lateMinutes:s.lateEnabled?late:0,earlyOutMinutes:0,overtimeMinutes:0,status:"Present"});
  showAlert("Check-in saved.");renderToday();
}
async function markCheckOut(){
  const employeeId=Number(document.getElementById("employeeSelect").value);if(!employeeId)return;
  const date=todayKey(), rows=await dbGetAll("attendance"), r=rows.find(x=>x.employeeId===employeeId&&x.date===date);
  if(!r)return showAlert("No check-in found for this employee.","warning");
  if(r.checkOut)return showAlert("Check-out already saved.","warning");
  const s=await getSettings(), out=nowTime(), inMin=timeToMinutes(r.checkIn),outMin=timeToMinutes(out);
  const working=Math.max(0,outMin-inMin-Number(s.breakMinutes||0));
  const shiftEnd=timeToMinutes(s.shiftEnd), shiftStart=timeToMinutes(s.shiftStart);
  const early=s.earlyOutEnabled?Math.max(0,shiftEnd-outMin):0;
  const ot=s.overtimeEnabled?Math.max(0,outMin-shiftEnd):0;
  r.checkOut=out;r.workingMinutes=working;r.earlyOutMinutes=early;r.overtimeMinutes=ot;
  await dbPut("attendance",r);showAlert("Check-out saved.");renderToday();
}
async function renderToday(){
  const employees=await dbGetAll("employees"),names=Object.fromEntries(employees.map(e=>[e.id,e.name]));
  const rows=(await dbGetAll("attendance")).filter(x=>x.date===todayKey()).sort((a,b)=>a.id-b.id);
  document.getElementById("attendanceBody").innerHTML=rows.length?rows.map(r=>`<tr><td>${escapeHtml(names[r.employeeId]||"Unknown")}</td><td>${fmtTime(r.checkIn)}</td><td>${fmtTime(r.checkOut)}</td><td>${minutesToText(r.workingMinutes)}</td><td>${r.lateMinutes}m</td><td>${r.earlyOutMinutes}m</td><td>${minutesToText(r.overtimeMinutes)}</td></tr>`).join(""):`<tr><td colspan="7" class="empty">No attendance today.</td></tr>`;
}
