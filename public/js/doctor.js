let activeAppointment = null;
let currentMedList = [];

const urlToken = new URLSearchParams(window.location.search).get(
  "access",
);
if (urlToken) {
  sessionStorage.setItem("doctorPortalToken", urlToken);
  window.history.replaceState({}, document.title, "doctor.html");
}
if (!sessionStorage.getItem("doctorPortalToken")) {
  window.location.replace("doctor-access.html");
}
function portalHeaders(extra = {}) {
  return {
    ...extra,
    "X-Doctor-Access-Token":
      sessionStorage.getItem("doctorPortalToken") || "",
  };
}

// Initialize Date with Today
const dateInput = document.getElementById("queueDate");
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;

window.addEventListener("DOMContentLoaded", async () => {
  await initDoctorSelect();
  await loadDoctorQueue();
  await loadDoctorQuickMeds();
});


async function initDoctorSelect() {
  try {
    const res = await fetch("/api/doctors");
    const data = await res.json();
    if (
      res.ok &&
      data.success &&
      Array.isArray(data.doctors) &&
      data.doctors.length > 0
    ) {
      const sel = document.getElementById("doctorSelect");
      sel.innerHTML = data.doctors
        .map((d) => {
          const hi = d.nameHi ? `${d.nameHi} (${d.name})` : d.name;
          const spec = d.specializationHi || d.specialization;
          const room = d.roomNumber ? ` - ${d.roomNumber}` : "";
          return `<option value="${d.name}" data-room="${d.roomNumber || "Room 1"}">${hi} - ${spec}${room}</option>`;
        })
        .join("");
    }
  } catch (e) {
    console.warn("Could not load dynamic doctors in portal:", e);
  }
}


async function loadDoctorQuickMeds() {
  try {
    const res = await fetch("/api/medicines");
    const data = await res.json();
    if (
      res.ok &&
      data.success &&
      Array.isArray(data.medicines) &&
      data.medicines.length > 0
    ) {
      const container = document.querySelector(".quick-meds");
      if (container) {
        container.innerHTML = data.medicines
          .map((m) => {
            const chipLabel = m.name;
            const medVal = `${m.name} - ${m.timingHi || m.timing || "निर्देशानुसार"}`;
            return `<span class="quick-chip" onclick="addMed('${medVal.replace(/'/g, "\\'")}')">+ ${chipLabel}</span>`;
          })
          .join("");
      }
    }
  } catch (e) {
    console.warn(
      "Could not load dynamic medicines for doctor portal:",
      e,
    );
  }
}

async function loadDoctorQueue() {
  const doctor = document.getElementById("doctorSelect").value;
  const date = dateInput.value;
  const tbody = document.getElementById("queueTbody");

  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 25px; color: #777;">लोड हो रहा है...</td></tr>`;

  try {
    const res = await fetch(
      `/doctor/queue?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`,
      { headers: portalHeaders() },
    );

    if (res.status === 401) {
      sessionStorage.removeItem("doctorPortalToken");
      window.location.replace("doctor-access.html");
      return;
    }

    if (!res.ok) {
      const errData = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #d32f2f; padding: 20px;">
            ⚠️ त्रुटि (${res.status}): ${errData.message || "Failed to load queue"}. <br>
            <small style="color: #666;">सुनिश्चित करें कि नोड सर्वर चल रहा है (Make sure Node server is running on port 3000).</small>
          </td></tr>`;
      return;
    }

    const data = await res.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #d32f2f; padding: 20px;">${data.message || "Error loading queue"}</td></tr>`;
      return;
    }

    const list = data.appointments || [];
    document.getElementById("totalPatients").innerText = list.length;
    document.getElementById("pendingCount").innerText = list.filter(
      (a) => a.status === "Pending" || a.status === "In Consultation",
    ).length;
    document.getElementById("completedCount").innerText = list.filter(
      (a) => a.status === "Completed",
    ).length;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: #666;">ℹ️ इस तारीख के लिए कोई मरीज कतार में नहीं है (No patients booked for ${doctor} on ${date}).</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((app) => {
        const isDone = app.status === "Completed";
        const isConsulting = app.status === "In Consultation";
        const statusHtml = isDone
          ? `<span class="status-badge status-completed">🟢 पूर्ण (Done)</span>`
          : isConsulting
            ? `<span class="status-badge status-pending">🔵 जांच चल रही है (In Consultation)</span>`
            : `<span class="status-badge status-pending">🟡 प्रतीक्षारत (Waiting)</span>`;

        const btnText = isDone
          ? "✏️ नुस्खा बदलें (Edit)"
          : "🩺 जांचें व लिखें (Examine)";

        return `
            <tr>
              <td><span class="token-badge">Token #${app.tokenNumber}</span></td>
              <td><strong>${app.name}</strong></td>
              <td>${app.age} Yrs / ${app.gender}</td>
              <td>${app.village || "N/A"}</td>
              <td>
                <div>📞 ${app.phone}</div>
                <small style="color: #666;">ABHA: ${app.abhaId || "N/A"}</small>
              </td>
              <td>
                <div>${app.time}</div>
                <small style="color: #1b5e20; font-weight: 600;">🚪 ${app.roomNumber || "Room 1"}</small>
              </td>
              <td>${statusHtml}</td>
              <td>
                ${!isDone ? `<button class="btn-action" onclick='setQueueStatus("${app._id}", "In Consultation")'>▶️ जांच शुरू करें</button>` : ""}
                <button class="btn-action" onclick='openExamineModal(${JSON.stringify(app)})'>
                  ${btnText}
                </button>
              </td>
            </tr>
          `;
      })
      .join("");
  } catch (err) {
    console.error("Queue load error:", err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #d32f2f; padding: 20px;">
          ⚠️ सर्वर संचार त्रुटि (Server connection error). <br>
          <small style="color: #666;">कृपया सुनिश्चित करें कि आप <strong>http://localhost:3000/doctor.html</strong> पर हैं और सर्वर चालू है।</small>
        </td></tr>`;
  }
}

async function setQueueStatus(appointmentId, status) {
  try {
    const res = await fetch("/doctor/queue/status", {
      method: "PATCH",
      headers: portalHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ appointmentId, status }),
    });
    if (res.status === 401) {
      sessionStorage.removeItem("doctorPortalToken");
      window.location.replace("doctor-access.html");
      return;
    }
    const data = await res.json();
    if (!res.ok || !data.success)
      return alert(data.message || "Unable to update queue status.");
    loadDoctorQueue();
  } catch (err) {
    console.error(err);
    alert("Server connection error.");
  }
}

function openExamineModal(app) {
  activeAppointment = app;
  currentMedList = Array.isArray(app.medicines) ? [...app.medicines] : [];

  document.getElementById("modalPatientSummary").innerHTML = `
        <div><strong>👤 मरीज (Name):</strong> ${app.name} (Token #${app.tokenNumber})</div>
        <div><strong>🎂 उम्र / लिंग:</strong> ${app.age} Yrs / ${app.gender}</div>
        <div><strong>📞 फ़ोन (Phone):</strong> ${app.phone}</div>
        <div><strong>🚪 कमरा / कक्ष (Room):</strong> ${app.roomNumber || "Room 1"}</div>
        <div><strong>🏡 गाँव (Village):</strong> ${app.village || "N/A"}</div>
        <div><strong>🆔 ABHA ID:</strong> ${app.abhaId || "N/A"}</div>
        <div><strong>⏱️ Slot Time:</strong> ${app.time}</div>
      `;

  document.getElementById("diagInput").value = app.diagnosis || "";
  document.getElementById("customMedInput").value = "";
  renderPrescribedTags();

  document.getElementById("prescribeModal").style.display = "flex";
}

function closeModal() {
  activeAppointment = null;
  document.getElementById("prescribeModal").style.display = "none";
}

function addMed(medName) {
  if (!currentMedList.includes(medName)) {
    currentMedList.push(medName);
    renderPrescribedTags();
  }
}

function addCustomMed() {
  const input = document.getElementById("customMedInput");
  const val = input.value.trim();
  if (val) {
    addMed(val);
    input.value = "";
  }
}

function removeMed(index) {
  currentMedList.splice(index, 1);
  renderPrescribedTags();
}

function renderPrescribedTags() {
  const container = document.getElementById("prescribedTags");
  if (currentMedList.length === 0) {
    container.innerHTML = `<span style="color: #888; font-size: 13px;">कोई दवाई नहीं जोड़ी गई (No medicines added yet)</span>`;
    return;
  }

  container.innerHTML = currentMedList
    .map(
      (med, idx) => `
        <span class="med-tag-item">
          💊 ${med}
          <span class="med-tag-remove" onclick="removeMed(${idx})">✕</span>
        </span>
      `,
    )
    .join("");
}

async function savePrescription() {
  if (!activeAppointment) return;

  const diagnosis = document.getElementById("diagInput").value.trim();
  const btn = document.getElementById("savePrescriptionBtn");
  btn.disabled = true;
  btn.innerText = "Saving...";

  try {
    const res = await fetch("/doctor/prescribe", {
      method: "POST",
      headers: portalHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        appointmentId: activeAppointment._id,
        diagnosis: diagnosis,
        medicines: currentMedList,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(
        "✅ पर्ची और दवाइयाँ सफलतापूर्वक सहेजी गईं (Prescription saved successfully)!",
      );
      closeModal();
      await loadDoctorQueue();
    } else {
      alert(`❌ ${data.message || "Error saving prescription"}`);
    }
  } catch (err) {
    console.error("Prescribe save error:", err);
    alert("सर्वर त्रुटि (Server communication error)");
  } finally {
    btn.disabled = false;
    btn.innerText = "💾 नुस्खा सहेजें व पूरा करें (Save & Complete)";
  }
}
