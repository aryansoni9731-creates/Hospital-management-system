document.getElementById("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const phone = document.getElementById("phone").value.trim();

      if (!/^[0-9]{10}$/.test(phone)) {
        alert("कृपया सही 10-अंकों का फ़ोन नंबर दर्ज करें (Enter valid 10-digit phone number)");
        return;
      }

      const btn = document.getElementById("submitBtn");
      btn.disabled = true;
      btn.innerText = "Submitting...";

      const data = {
        name: document.getElementById("name").value.trim(),
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        phone: phone,
        password: document.getElementById("password").value,
        village: document.getElementById("village").value.trim(),
        abhaId: document.getElementById("abhaId").value.trim(),
        rationCard: document.getElementById("rationCard").value.trim(),
        email: document.getElementById("email").value.trim(),
        language: localStorage.getItem("preferredLanguage") || "en"
      };

      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        alert(result.message);

        if (res.ok && result.success) {
          document.getElementById("form").reset();
          window.location.href = "login.html";
        }

      } catch (err) {
        console.error("Registration error:", err);
        alert("Server error. Please try again.");
      } finally {
        btn.disabled = false;
        btn.innerText = "सबमिट करें (Register)";
      }
    });
