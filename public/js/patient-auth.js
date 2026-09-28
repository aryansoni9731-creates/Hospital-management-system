(function () {
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  const token = localStorage.getItem("patientToken");

  function logoutPatient() {
    localStorage.removeItem("user");
    localStorage.removeItem("patientToken");
    sessionStorage.clear();
    window.location.href = "language.html";
  }

  window.patientLogout = logoutPatient;
  window.getPatientToken = () => localStorage.getItem("patientToken") || "";
  window.patientFetch = (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    const t = localStorage.getItem("patientToken");
    if (t) headers.set("Authorization", `Bearer ${t}`);
    return fetch(url, { ...options, headers });
  };

  if (!user || !token) {
    window.location.replace("login.html");
    return;
  }

  if (user.language === "hi" || user.language === "en") {
    localStorage.setItem("preferredLanguage", user.language);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.id = "patient-control-bar";
    bar.style.cssText = "position:fixed;right:14px;top:14px;z-index:10000;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.96);padding:6px;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.14);font-family:Segoe UI,Arial,sans-serif";
    bar.innerHTML = `
      <button type="button" data-lang="en" style="border:0;border-radius:8px;padding:6px 10px;cursor:pointer;background:#4caf50;color:#fff">English</button>
      <button type="button" data-lang="hi" style="border:0;border-radius:8px;padding:6px 10px;cursor:pointer;background:#4caf50;color:#fff">हिंदी</button>
      <button type="button" id="patient-logout-button" style="border:0;border-radius:8px;padding:6px 10px;cursor:pointer;background:#d32f2f;color:#fff;font-weight:600">🚪 <span>Logout</span></button>`;
    document.body.appendChild(bar);

    const current = localStorage.getItem("preferredLanguage") === "hi" ? "hi" : "en";
    bar.querySelectorAll("[data-lang]").forEach(btn => {
      if (btn.dataset.lang === current) btn.style.background = "#2e7d32";
      btn.addEventListener("click", async () => {
        localStorage.setItem("preferredLanguage", btn.dataset.lang);
        const u = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
        u.language = btn.dataset.lang;
        localStorage.setItem("user", JSON.stringify(u));
        try {
          const t = localStorage.getItem("patientToken");
          await fetch("/patient/language", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
            body: JSON.stringify({ language: btn.dataset.lang })
          });
        } catch (e) { console.warn("Language preference could not be synced.", e); }
        location.reload();
      });
    });

    bar.querySelector("#patient-logout-button").addEventListener("click", logoutPatient);
  });
})();
