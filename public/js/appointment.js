let selectedBooking = null;
let lastBookedAppointment = null;
let doctorsList = [];

const dateInput = document.getElementById("appointmentDate");
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;
dateInput.min = today;

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("कृपया पहले लॉगिन करें (Please login first)");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
  initDoctorsAndSlots();
});


async function initDoctorsAndSlots() {
  const container = document.getElementById("doctorsContainer");
  try {
    const res = await fetch("/api/doctors");
    const data = await res.json();

    if (
      res.ok &&
      data.success &&
      Array.isArray(data.doctors) &&
      data.doctors.length > 0
    ) {
      doctorsList = data.doctors;
      renderDoctorCards(doctorsList);
      await loadAllDoctorSlots();
    } else {
      container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #c62828; background: white; border-radius: 16px;">
              ⚠️ डॉक्टर उपलब्ध नहीं हैं। कृपया बाद में प्रयास करें। (No doctors currently available).
            </div>
          `;
    }
  } catch (err) {
    console.error("Error loading doctors:", err);
    container.innerHTML = `
          <div style="text-align: center; padding: 30px; color: #c62828; background: white; border-radius: 16px;">
            ⚠️ डॉक्टर डेटा लोड करने में समस्या हुई। सर्वर कनेक्शन जांचें।
          </div>
        `;
  }
}

function renderDoctorCards(doctors) {
  const container = document.getElementById("doctorsContainer");
  container.innerHTML = doctors
    .map((doc) => {
      const displayName = doc.nameHi
        ? `${doc.nameHi} (${doc.name})`
        : doc.name;
      const displaySpec = doc.specializationHi
        ? `${doc.specializationHi} / ${doc.specialization}`
        : doc.specialization;
      const room = doc.roomNumber || "Room 1";
      const slotsJson = JSON.stringify(
        doc.slots || ["10:00 AM", "11:00 AM", "12:00 PM"],
      );

      return `
          <div class="doctor-card" data-doctor="${doc.name}" data-room="${room}">
            <div class="doctor-header-row">
              <div>
                <div class="doctor-name">👨‍⚕️ ${displayName}</div>
                <div class="specialization">${displaySpec}</div>
              </div>
              <span class="room-badge">🚪 ${room}</span>
            </div>
            <div class="slots-title">उपलब्ध समय और खाली स्लॉट (Available Time & Slots):</div>
            <div class="slots-grid" data-slots='${slotsJson}'>
              <div style="font-size: 13px; color: #777; padding: 6px;">स्लॉट लोड हो रहे हैं... (Loading slots...)</div>
            </div>
          </div>
        `;
    })
    .join("");
}

async function loadAllDoctorSlots() {
  cancelSelection();
  const date = dateInput.value;
  if (!date) return;

  const doctorCards = document.querySelectorAll(".doctor-card");

  for (const card of doctorCards) {
    const doctor = card.dataset.doctor;
    const room = card.dataset.room || "Room 1";
    const slotsContainer = card.querySelector(".slots-grid");
    const slotTimes = JSON.parse(slotsContainer.dataset.slots || "[]");

    try {
      const res = await fetch(
        `/slots?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`,
      );
      const data = await res.json();
      const slotCounts = data.slotCounts || {};
      const maxSlots = data.maxSlots || 5;

      slotsContainer.innerHTML = slotTimes
        .map((time) => {
          const booked = slotCounts[time] || 0;
          const remaining = Math.max(0, maxSlots - booked);
          const isFull = remaining <= 0;

          let badgeClass = "badge-available";
          let badgeText = `${remaining} slots left`;

          if (remaining === 0) {
            badgeClass = "badge-full";
            badgeText = "🔴 Full";
          } else if (remaining <= 2) {
            badgeClass = "badge-limited";
            badgeText = `⚠️ ${remaining} left`;
          } else {
            badgeText = `🟢 ${remaining} left`;
          }

          return `
              <div class="slot-card ${isFull ? "disabled" : ""}"
                   data-doctor="${doctor}"
                   data-room="${room}"
                   data-time="${time}"
                   data-remaining="${remaining}"
                   onclick="selectSlotCard(this, '${doctor}', '${time}', ${remaining}, '${room}')">
                <span class="slot-time">${time}</span>
                <span class="slot-badge ${badgeClass}">${badgeText}</span>
              </div>
            `;
        })
        .join("");
    } catch (err) {
      console.error(`Error loading slots for ${doctor}:`, err);
      slotsContainer.innerHTML = `<div style="color: red; font-size: 13px;">Error loading slots</div>`;
    }
  }
}

function selectSlotCard(cardElem, doctor, time, remaining, roomNumber) {
  if (remaining <= 0) {
    alert(
      "यह स्लॉट पूरा भर चुका है (This slot is full. Please choose another time).",
    );
    return;
  }

  document
    .querySelectorAll(".slot-card")
    .forEach((el) => el.classList.remove("selected"));
  cardElem.classList.add("selected");

  const date = dateInput.value;

  selectedBooking = { doctor, date, time, remaining, roomNumber };

  document.getElementById("summaryDoctor").innerText = doctor;
  document.getElementById("summaryRoom").innerText =
    roomNumber || "Room 1";
  document.getElementById("summaryDate").innerText = date;
  document.getElementById("summaryTime").innerText = time;
  document.getElementById("summaryRemaining").innerText =
    `${remaining} / 5 slots available`;
  document.getElementById("summaryPatient").innerText = user.name;
  document.getElementById("summaryPhone").innerText = user.phone;

  document.getElementById("confirmationPanel").style.display = "block";
}

function cancelSelection() {
  selectedBooking = null;
  document
    .querySelectorAll(".slot-card")
    .forEach((el) => el.classList.remove("selected"));
  const panel = document.getElementById("confirmationPanel");
  if (panel) panel.style.display = "none";
}

async function confirmBooking() {
  if (!selectedBooking) {
    alert("कृपया पहले एक स्लॉट चुनें (Please select a slot first)");
    return;
  }

  const btn = document.getElementById("confirmBtn");
  btn.disabled = true;
  btn.innerText = "Booking...";

  try {
    const res = await patientFetch("/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctor: selectedBooking.doctor,
        date: selectedBooking.date,
        time: selectedBooking.time,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      lastBookedAppointment = data.appointment;
      cancelSelection();
      await loadAllDoctorSlots();
      showSlipModal(data.appointment);
    } else {
      alert(`❌ ${data.message || "Booking failed"}`);
    }
  } catch (err) {
    console.error("Booking error:", err);
    alert("सर्वर त्रुटि (Server communication error)");
  } finally {
    btn.disabled = false;
    btn.innerText = "बुक करें (Confirm & Book)";
  }
}

function showSlipModal(app) {
  document.getElementById("slipToken").innerText =
    `Token #${app.tokenNumber || 1}`;
  document.getElementById("slipPatient").innerText = app.name;
  document.getElementById("slipAgeGender").innerText =
    `${app.age || "N/A"} Yrs / ${app.gender || "N/A"}`;
  document.getElementById("slipPhone").innerText = app.phone;
  document.getElementById("slipVillage").innerText = app.village || "N/A";
  document.getElementById("slipAbha").innerText = app.abhaId || "N/A";
  document.getElementById("slipDoctor").innerText = app.doctor;
  document.getElementById("slipRoom").innerText =
    app.roomNumber || "Room 1";
  document.getElementById("slipDateTime").innerText =
    `${app.date} (${app.time})`;

  document.getElementById("slipModal").style.display = "flex";
}

function closeSlipModal() {
  document.getElementById("slipModal").style.display = "none";
}

function printSlip() {
  window.print();
}

function shareWhatsApp() {
  if (!lastBookedAppointment) return;
  const app = lastBookedAppointment;
  const roomStr = app.roomNumber
    ? `\n🚪 *कक्ष (Room):* ${app.roomNumber}`
    : "";
  const text = `🏥 *अस्पताल ओपीडी पर्ची (Hospital OPD Slip)*\n\n🎫 *टोकन (Token):* #${app.tokenNumber || 1}\n👤 *मरीज (Patient):* ${app.name}\n👨‍⚕️ *डॉक्टर (Doctor):* ${app.doctor}${roomStr}\n🗓️ *तारीख (Date):* ${app.date}\n⏱️ *समय (Time):* ${app.time}\n📞 *फ़ोन:* ${app.phone}\n🏡 *गाँव:* ${app.village || "N/A"}\n\nकृपया समय पर अस्पताल पहुंचें।`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
