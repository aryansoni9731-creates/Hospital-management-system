const user = JSON.parse(localStorage.getItem("user"));

if (!user || !localStorage.getItem("patientToken")) {
  alert("Please login first");
  window.location.href = "login.html";
} else {
  document.getElementById("welcomeText").innerText =
    "Welcome, " + user.name;

  const loginCard = document.querySelector(".login-card");
  if (loginCard) loginCard.style.display = "none";

  checkUpcomingAppointment();
}

async function checkUpcomingAppointment() {
  if (!user || !user.phone) return;
  try {
    const res = await patientFetch(
      `/report/${encodeURIComponent(user.phone)}`,
    );
    const data = await res.json();
    if (
      res.ok &&
      data.success &&
      Array.isArray(data.appointments) &&
      data.appointments.length > 0
    ) {
      const active = data.appointments.find(
        (a) => a.status === "Pending" || a.status === "In Consultation",
      );
      if (active) {
        const card = document.getElementById("activeTokenCard");
        document.getElementById("activeTokenNum").innerText =
          `Token #${active.tokenNumber || 1}`;
        document.getElementById("activeDoctorRoom").innerText =
          `👨‍⚕️ ${active.doctor} | 🚪 ${active.roomNumber || "Room 1"}`;
        document.getElementById("activeDateTime").innerText =
          `🗓️ ${active.date} (${active.time})`;

        const badge = document.getElementById("activeStatusBadge");
        if (active.status === "In Consultation") {
          badge.innerText = "🔵 जांच चल रही है (In Consultation)";
          badge.style.background = "#e3f2fd";
          badge.style.color = "#1565c0";
        } else {
          badge.innerText = "🟡 प्रतीक्षारत (Waiting)";
          badge.style.background = "#fff3e0";
          badge.style.color = "#e65100";
        }
        card.style.display = "block";
      }
    }
  } catch (e) {
    console.warn("Could not check upcoming appointments:", e);
  }
}

function go(page) {
  window.location.href = page;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .catch((err) => console.log("SW registration failed:", err));
}
