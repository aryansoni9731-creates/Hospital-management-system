let liveMedicineCatalog = [];
let currentCategory = "All";
const user = (() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
})();
const todayStr = new Date().toISOString().split("T")[0];

// Check user & initialize
window.addEventListener("DOMContentLoaded", async () => {
  if (user) {
    document.getElementById("welcomeUser").innerText =
      `👤 ${user.name} का दवा डैशबोर्ड`;
    document.getElementById("userPhone").innerText =
      `📞 Registered Phone: ${user.phone}`;
    await loadPatientPrescriptions();
  } else {
    document.getElementById("welcomeUser").innerText =
      "👤 अतिथि मरीज (Guest Patient)";
    document.getElementById("userPhone").innerText =
      "लॉगिन करें अपनी दवाइयाँ देखने के लिए";
  }

  await fetchMedicineCatalog();
  loadDosageCheckboxes();
});


function switchTab(tabId, btn) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  btn.classList.add("active");
}


async function fetchMedicineCatalog() {
  const grid = document.getElementById("catalogGrid");
  grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">दवाइयों की सूची लोड हो रही है... (Loading medicine catalog...)</div>`;

  try {
    const res = await fetch("/api/medicines");
    const data = await res.json();

    if (res.ok && data.success && Array.isArray(data.medicines)) {
      liveMedicineCatalog = data.medicines;
      renderCatalog(liveMedicineCatalog);
    } else {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: #c62828;">दवाइयाँ लोड करने में समस्या हुई।</div>`;
    }
  } catch (err) {
    console.error("Catalog fetch error:", err);
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: #c62828;">सर्वर से संपर्क नहीं हो सका।</div>`;
  }
}


function renderCatalog(list) {
  const grid = document.getElementById("catalogGrid");
  if (!list || list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">कोई दवाई नहीं मिली (No medicines match your search).</div>`;
    return;
  }

  grid.innerHTML = list
    .map((item) => {
      const isInStock = item.inStock !== false;
      const stockBadge = isInStock
        ? `<span class="stock-badge stock-in">🟢 उपलब्ध (In Stock)</span>`
        : `<span class="stock-badge stock-out">🔴 अनुपलब्ध (Out of Stock)</span>`;

      const purposeText = item.purposeHi
        ? `${item.purposeHi} (${item.purpose})`
        : item.purpose;
      const timingText = item.timingHi || item.timing;
      const warningText = item.warningHi || item.warning;
      const voice = (
        item.voiceTextHi ||
        item.voiceText ||
        `${item.name}. ${item.purpose}`
      ).replace(/'/g, "\\'");

      return `
          <div class="catalog-card">
            <div>
              <div class="catalog-name">
                <span>${item.name}</span>
                ${stockBadge}
              </div>
              <div class="catalog-purpose">🩺 ${purposeText}</div>
              <div class="catalog-timing">⏱️ <strong>खुराक (Dosage):</strong> ${timingText} ${item.icons ? "(" + item.icons + ")" : ""}</div>
              ${warningText ? `<div class="catalog-warning">⚠️ <strong>सावधानी:</strong> ${warningText}</div>` : ""}
            </div>
            <button class="audio-btn" style="margin-top: 12px; width: 100%; justify-content: center;" onclick="speakText('${voice}')">
              🔊 जानकारी सुनें (Listen Guide)
            </button>
          </div>
        `;
    })
    .join("");
}


function filterCategory(cat, chipElem) {
  currentCategory = cat;
  document
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  chipElem.classList.add("active");
  filterMedicines();
}

// Search filter
function filterMedicines() {
  const q = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filtered = liveMedicineCatalog.filter((item) => {
    const matchesCat =
      currentCategory === "All" || item.category === currentCategory;
    const name = (item.name || "").toLowerCase();
    const purpose = (item.purpose || "").toLowerCase();
    const purposeHi = (item.purposeHi || "").toLowerCase();
    const timing = (item.timing || "").toLowerCase();
    const timingHi = (item.timingHi || "").toLowerCase();

    const matchesQuery =
      !q ||
      name.includes(q) ||
      purpose.includes(q) ||
      purposeHi.includes(q) ||
      timing.includes(q) ||
      timingHi.includes(q);
    return matchesCat && matchesQuery;
  });

  renderCatalog(filtered);
}


async function loadPatientPrescriptions() {
  const container = document.getElementById("prescriptionsContainer");
  if (!user || !user.phone) {
    container.innerHTML = `<div class="empty-state">अपनी दवाइयाँ देखने के लिए कृपया <a href="login.html">लॉगिन करें</a>।</div>`;
    return;
  }

  try {
    const res = await patientFetch(
      `/report/${encodeURIComponent(user.phone)}`,
    );
    const data = await res.json();

    if (
      !res.ok ||
      !data.success ||
      !data.appointments ||
      data.appointments.length === 0
    ) {
      container.innerHTML = `
            <div class="empty-state">
              📋 <strong>अभी तक कोई लिखी हुई दवाई नहीं है</strong><br>
              (No prescribed medicines recorded yet.)<br><br>
              <a href="appointment.html" style="color: #2e7d32; font-weight: bold;">📅 नया अपॉइंटमेंट बुक करें</a>
            </div>
          `;
      return;
    }


    const appointmentsWithMeds = data.appointments.filter(
      (a) => a.medicines && a.medicines.length > 0,
    );

    if (appointmentsWithMeds.length === 0) {
      container.innerHTML = `
            <div class="empty-state">
              📋 डॉक्टर ने आपके अपॉइंटमेंट में अभी कोई दवाई नहीं जोड़ी है।<br>
              नीचे दी गई सामान्य दवा निर्देशिका से जानकारी प्राप्त कर सकते हैं।
            </div>
          `;
      return;
    }

    populatePersonalRoutine(appointmentsWithMeds[0]);

    container.innerHTML = appointmentsWithMeds
      .map((app) => {
        const medsList = app.medicines
          .map((med) => {
            const voiceText =
              `${user.name} जी, डॉक्टर ${app.doctor} ने आपके लिए ${med} लिखी है। इसे निर्देशानुसार समय पर लें।`.replace(
                /'/g,
                "\\'",
              );
            return `
              <div class="med-item">
                <div class="med-details">
                  <h4>💊 ${med}</h4>
                  <p>🗓️ Prescribed on: ${app.date || "Recent visit"} | ⏱️ Time: ${app.time} ${app.roomNumber ? "| 🚪 " + app.roomNumber : ""}</p>
                </div>
                <button class="audio-btn" onclick="speakText('${voiceText}')">
                  🔊 सुनें (Listen)
                </button>
              </div>
            `;
          })
          .join("");

        return `
            <div class="prescription-card">
              <div class="prescription-header">
                <span class="doc-name">👨‍⚕️ ${app.doctor} ${app.roomNumber ? "(" + app.roomNumber + ")" : ""}</span>
                <span class="app-date">📅 Visit Date: ${app.date || "N/A"} (${app.time})</span>
              </div>
              <div>${medsList}</div>
            </div>
          `;
      })
      .join("");
  } catch (err) {
    console.error("Failed to load prescriptions:", err);
    container.innerHTML = `<div class="empty-state" style="color: red;">दवाइयाँ लोड करने में समस्या हुई। कृपया दोबारा प्रयास करें।</div>`;
  }
}

function populatePersonalRoutine(latestApp) {
  if (
    !latestApp ||
    !Array.isArray(latestApp.medicines) ||
    latestApp.medicines.length === 0
  )
    return;

  const morningList = document.getElementById("morningMeds");
  const afternoonList = document.getElementById("afternoonMeds");
  const nightList = document.getElementById("nightMeds");

  const morning = [];
  const afternoon = [];
  const night = [];

  latestApp.medicines.forEach((m) => {
    const lower = m.toLowerCase();
    let placed = false;
    if (
      lower.includes("खाली पेट") ||
      lower.includes("सुबह") ||
      lower.includes("morning") ||
      lower.includes("1-0-1") ||
      lower.includes("1-1-1") ||
      lower.includes("1-0-0")
    ) {
      morning.push(m);
      placed = true;
    }
    if (
      lower.includes("दोपहर") ||
      lower.includes("afternoon") ||
      lower.includes("lunch") ||
      lower.includes("1-1-1") ||
      lower.includes("0-1-0")
    ) {
      afternoon.push(m);
      placed = true;
    }
    if (
      lower.includes("रात") ||
      lower.includes("night") ||
      lower.includes("dinner") ||
      lower.includes("1-0-1") ||
      lower.includes("1-1-1") ||
      lower.includes("0-0-1")
    ) {
      night.push(m);
      placed = true;
    }
    if (!placed) {
      morning.push(m);
      night.push(m);
    }
  });

  const renderItems = (items, prefix) => {
    if (items.length === 0)
      return `<div style="font-size:13px; color:#888; padding:4px;">इस समय के लिए कोई विशेष दवाई नहीं है।</div>`;
    return items
      .map((med, idx) => {
        const key = `routine_${user?.phone || "g"}_${todayStr}_${prefix}_${idx}`;
        return `
            <div class="schedule-med-item">
              <span style="font-weight: 500;">💊 ${med}</span>
              <input type="checkbox" id="${key}" onchange="saveDosageState('${key}', this.checked)">
            </div>
          `;
      })
      .join("");
  };

  if (morningList && morning.length > 0)
    morningList.innerHTML = renderItems(morning, "m");
  if (afternoonList && afternoon.length > 0)
    afternoonList.innerHTML = renderItems(afternoon, "a");
  if (nightList && night.length > 0)
    nightList.innerHTML = renderItems(night, "n");

  loadDosageCheckboxes();
}

function saveDosageState(key, checked) {
  localStorage.setItem(key, checked ? "true" : "false");
}

function loadDosageCheckboxes() {
  document
    .querySelectorAll(".schedule-med-list input[type='checkbox']")
    .forEach((cb) => {
      if (cb.id) {
        const val = localStorage.getItem(cb.id);
        cb.checked = val === "true";
      }
    });
}

function speakText(text) {
  if (!window.speechSynthesis) {
    alert("Speech synthesis is not supported on your browser.");
    return;
  }
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.rate = 0.92;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function speakSummary() {
  const userName = user ? user.name : "मरीज";
  const summaryText = `नमस्ते ${userName} जी, अपने समय पर दवाइयां लेना याद रखें। सुबह नाश्ते के बाद और खाली पेट की दवा समय पर लें। दोपहर और रात को भोजन के बाद दवा लें। किसी भी परेशानी पर तुरंत 108 या ड्यूटी डॉक्टर से संपर्क करें।`;
  speakText(summaryText);
}
