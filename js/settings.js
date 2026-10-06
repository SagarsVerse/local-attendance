async function loadSettingsPage(){
  const s=await getSettings();
  for(const k of ["shiftStart","shiftEnd","graceMinutes","breakMinutes"])document.getElementById(k).value=s[k];
  document.getElementById("overtimeEnabled").checked=!!s.overtimeEnabled;
  document.getElementById("earlyOutEnabled").checked=!!s.earlyOutEnabled;
  document.getElementById("lateEnabled").checked=!!s.lateEnabled;
  document.getElementById("settingsForm").onsubmit=async e=>{
    e.preventDefault();await saveSettings({
      shiftStart:document.getElementById("shiftStart").value,
      shiftEnd:document.getElementById("shiftEnd").value,
      graceMinutes:Number(document.getElementById("graceMinutes").value),
      breakMinutes:Number(document.getElementById("breakMinutes").value),
      overtimeEnabled:document.getElementById("overtimeEnabled").checked,
      earlyOutEnabled:document.getElementById("earlyOutEnabled").checked,
      lateEnabled:document.getElementById("lateEnabled").checked
    });showAlert("Settings saved.");
  };
}
