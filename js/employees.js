async function loadEmployeesPage(){
  renderEmployees();
  document.getElementById("employeeForm").onsubmit=async e=>{
    e.preventDefault();
    const f=new FormData(e.target), employeeCode=f.get("employeeCode").trim(),name=f.get("name").trim();
    if(!employeeCode||!name)return;
    try{await dbAdd("employees",{employeeCode,name,department:f.get("department").trim(),designation:f.get("designation").trim(),joiningDate:f.get("joiningDate"),active:true});e.target.reset();showAlert("Employee added.");renderEmployees()}
    catch(err){showAlert("Employee ID already exists or could not be saved.","danger")}
  };
}
async function renderEmployees(){
  const rows=await dbGetAll("employees"),body=document.getElementById("employeeBody");
  body.innerHTML=rows.length?rows.map(e=>`<tr><td class="fw-semibold">${escapeHtml(e.employeeCode)}</td><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.department||"—")}</td><td>${escapeHtml(e.designation||"—")}</td><td><button class="btn btn-sm btn-outline-danger" onclick="removeEmployee(${e.id})">Delete</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No employees yet.</td></tr>`;
}
async function removeEmployee(id){if(!confirm("Delete this employee? Existing attendance records will remain."))return;await dbDelete("employees",id);renderEmployees()}
