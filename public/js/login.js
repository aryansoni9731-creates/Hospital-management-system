function togglePasswordVisibility() {
      const pwInput = document.getElementById("password");
      if (pwInput.type === "password") {
        pwInput.type = "text";
      } else {
        pwInput.type = "password";
      }
    }

    async function login() {
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const btn = document.getElementById("loginBtn");

      if (!phone || !password) {
        alert("Please enter both phone number and password");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number");
        return;
      }

      btn.disabled = true;
      btn.innerText = "Logging in...";

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ phone, password, language: localStorage.getItem("preferredLanguage") || "en" })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          localStorage.setItem("user", JSON.stringify({
            name: data.name,
            phone: data.phone,
            language: data.language || localStorage.getItem("preferredLanguage") || "en",
            role: data.role || "patient"
          }));
          if (data.token) localStorage.setItem("patientToken", data.token);
          localStorage.setItem("preferredLanguage", data.language || localStorage.getItem("preferredLanguage") || "en");
          window.location.href = "ui.html";
        } else {
          alert(data.message || "Login failed");
        }

      } catch (err) {
        console.error("Login request failed:", err);
        alert("Server communication error. Please try again.");
      } finally {
        btn.disabled = false;
        btn.innerText = "Login";
      }
    }

    // Support Enter key submission
    document.addEventListener("keypress", (e) => {
      if (e.key === "Enter") login();
    });
