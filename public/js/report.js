let currentReportData = null;
let selectedAppointmentForSlip = null;

window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.phone) {
    document.getElementById("patientid").value = user.phone;
    getReport();
  }
});

async function getReport() {
  const phone = document.getElementById("patientid").value.trim();
  const reportBox = document.getElementById("reportBox");
  const patientInfo = document.getElementById("patientInfo");
  const appointmentsList = document.getElementById("appointmentsList");

  if (!phone) {
    alert("कृपया फ़ोन नंबर दर्ज करें (Please enter phone number)");
    return;
  }

  reportBox.style.display = "none";

  try {
    const res = await patientFetch(
      `/report/${encodeURIComponent(phone)}`,
    );
    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Patient not found");
      return;
    }

    currentReportData = data;

    patientInfo.innerHTML = `
          <h3>👤 ${data.patient.name}</h3>
          <div class="patient-details">
            <div><strong>उम्र (Age):</strong> ${data.patient.age || "N/A"} Yrs (${data.patient.gender})</div>
            <div><strong>फ़ोन (Phone):</strong> ${data.patient.phone}</div>
            <div><strong>गाँव/शहर (Village):</strong> ${data.patient.village || "N/A"}</div>
            <div><strong>जन्म तिथि (DOB):</strong> ${data.patient.dob || "N/A"}</div>
            <div><strong>🆔 ABHA ID:</strong> ${data.patient.abhaId || "N/A"}</div>
            <div><strong>राशन कार्ड:</strong> ${data.patient.rationCard || "N/A"}</div>
          </div>
        `;

    // Render Appointments
    if (!data.appointments || data.appointments.length === 0) {
      appointmentsList.innerHTML = `<div class="no-data">⚠️ कोई अपॉइंटमेंट नहीं मिला (No appointments found)</div>`;
    } else {
      appointmentsList.innerHTML = data.appointments
        .map((a, idx) => {
          const isDone = a.status === "Completed";
          const statusHtml = isDone
            ? `<span class="status-tag status-done">🟢 पूर्ण (Done)</span>`
            : `<span class="status-tag status-wait">🟡 प्रतीक्षारत (Waiting)</span>`;

          const medHtml =
            a.medicines && a.medicines.length > 0
              ? a.medicines
                .map((m) => `<span class="med-tag">💊 ${m}</span>`)
                .join(" ")
              : '<span style="color: #777; font-size: 13px;">No medicines recorded yet</span>';

          const diagHtml = a.diagnosis
            ? `<div class="diag-box"><strong>🩺 Diagnosis:</strong> ${a.diagnosis}</div>`
            : "";

          return `
              <div class="appointment-item">
                <div class="app-header">
                  <div>
                    <span class="token-pill">Token #${a.tokenNumber || idx + 1}</span>
                    <strong style="margin-left: 8px; font-size: 16px;">👨‍⚕️ ${a.doctor}</strong>
                    <span style="font-size: 13px; margin-left: 8px; color: #1b5e20; background: #e8f5e9; padding: 2px 8px; border-radius: 12px; font-weight: 600;">🚪 ${a.roomNumber || "Room 1"}</span>
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    ${statusHtml}
                    ${a.diagnosis || (a.medicines && a.medicines.length > 0)
              ? `
                      <button class="btn-slip" style="background: #2e7d32;" onclick='speakPrescription(${JSON.stringify(a).replace(/'/g, "&apos;")})'>
                        🔊 पर्ची सुनें
                      </button>
                    `
              : ""
            }
                    <button class="btn-slip" onclick='openSlipForAppointment(${JSON.stringify(a).replace(/'/g, "&apos;")})'>
                      🖨️ ${isDone ? "Prescription Slip" : "OPD Slip"}
                    </button>
                  </div>
                </div>

                <div style="font-size: 14px; color: #555; margin-bottom: 6px;">
                  📅 <strong>Date:</strong> ${a.date || "N/A"} &nbsp;|&nbsp; ⏱ <strong>Time:</strong> ${a.time} &nbsp;|&nbsp; 🚪 <strong>Room:</strong> ${a.roomNumber || "Room 1"}
                </div>

                ${diagHtml}

                <div style="margin-top: 8px;">
                  <strong>दवाइयाँ (Prescribed Medicines):</strong><br>
                  ${medHtml}
                </div>
              </div>
            `;
        })
        .join("");
    }

    reportBox.style.display = "block";
  } catch (err) {
    console.error("Report fetch error:", err);
    alert(
      "सर्वर से रिपोर्ट लाने में त्रुटि (Error fetching report from server)",
    );
  }
}

function speakPrescription(a) {
  if (!currentReportData || !currentReportData.patient) return;
  const patient = currentReportData.patient;
  const meds =
    Array.isArray(a.medicines) && a.medicines.length > 0
      ? a.medicines.join(", ")
      : "कोई विशेष दवाई नहीं";
  const diag = a.diagnosis ? `रोग विवरण: ${a.diagnosis}।` : "";
  const text = `मरीज ${patient.name} जी, डॉक्टर ${a.doctor} के कमरा नंबर ${a.roomNumber || "1"} में परामर्श दिया गया है। ${diag} लिखी गई दवाइयाँ: ${meds}। कृपया निर्देशानुसार समय पर लें।`;

  if (!window.speechSynthesis)
    return alert("Speech synthesis is not supported on this device.");
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}

function openSlipForAppointment(app) {
  if (!currentReportData || !currentReportData.patient) return;
  const patient = currentReportData.patient;
  selectedAppointmentForSlip = { ...app, patient };

  document.getElementById("slipToken").innerText =
    `Token #${app.tokenNumber || 1}`;
  document.getElementById("slipPatient").innerText = patient.name;
  document.getElementById("slipAgeGender").innerText =
    `${patient.age || "N/A"} Yrs / ${patient.gender || "N/A"}`;
  document.getElementById("slipPhone").innerText = patient.phone;
  document.getElementById("slipVillage").innerText =
    patient.village || "N/A";
  document.getElementById("slipAbha").innerText = patient.abhaId || "N/A";
  document.getElementById("slipDoctor").innerText = app.doctor;
  document.getElementById("slipRoom").innerText =
    app.roomNumber || "Room 1";
  document.getElementById("slipDateTime").innerText =
    `${app.date} (${app.time})`;

  const prescriptionSection = document.getElementById(
    "prescriptionSection",
  );
  const diagnosisEl = document.getElementById("slipDiagnosis");
  const medicinesEl = document.getElementById("slipMedicines");
  const medicines = Array.isArray(app.medicines)
    ? app.medicines.filter(Boolean)
    : [];

  if (app.diagnosis || medicines.length) {
    prescriptionSection.style.display = "block";
    diagnosisEl.innerHTML = app.diagnosis
      ? `<strong>🩺 Diagnosis:</strong> ${app.diagnosis}`
      : `<strong>🩺 Diagnosis:</strong> Not recorded`;

    medicinesEl.innerHTML = medicines.length
      ? `<ol style="margin:6px 0 0 20px; padding:0;">${medicines.map((m) => `<li style="margin:4px 0;">💊 ${m}</li>`).join("")}</ol>`
      : `<span style="color:#777;">No medicines prescribed.</span>`;
  } else {
    prescriptionSection.style.display = "none";
    diagnosisEl.innerHTML = "";
    medicinesEl.innerHTML = "";
  }

  document.getElementById("slipModal").style.display = "flex";
}

function closeSlipModal() {
  document.getElementById("slipModal").style.display = "none";
}

function printSlip() {
  window.print();
}

function shareWhatsApp() {
  if (!selectedAppointmentForSlip) return;
  const app = selectedAppointmentForSlip;
  const meds = Array.isArray(app.medicines)
    ? app.medicines.filter(Boolean)
    : [];
  const prescription =
    app.diagnosis || meds.length
      ? `\n🩺 *Diagnosis:* ${app.diagnosis || "Not recorded"}\n💊 *Medicines:* ${meds.length ? meds.join(", ") : "None"}\n`
      : "";
  const roomStr = app.roomNumber
    ? `\n🚪 *कक्ष (Room):* ${app.roomNumber}`
    : "";
  const text = `🏥 *अस्पताल ओपीडी पर्ची (Hospital OPD Slip)*\n\n🎫 *टोकन (Token):* #${app.tokenNumber || 1}\n👤 *मरीज (Patient):* ${app.patient.name}\n👨‍⚕️ *डॉक्टर (Doctor):* ${app.doctor}${roomStr}\n🗓️ *तारीख (Date):* ${app.date}\n⏱️ *समय (Time):* ${app.time}\n📞 *फ़ोन:* ${app.patient.phone}\n🏡 *गाँव:* ${app.patient.village || "N/A"}\n${prescription}\nकृपया समय पर अस्पताल पहुंचें।`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
