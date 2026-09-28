(function () {
  const LANG_KEY = "preferredLanguage";

  const dict = {
    "Hospital Dashboard": { en: "Hospital Dashboard", hi: "अस्पताल डैशबोर्ड" },
    "Welcome": { en: "Welcome", hi: "स्वागत है" },
    "Manage everything in one place": { en: "Manage everything in one place", hi: "सभी सुविधाएँ एक ही जगह प्रबंधित करें" },
    "Logout": { en: "Logout", hi: "लॉगआउट" },
    "Login": { en: "Login", hi: "लॉगिन" },
    "Login as patient": { en: "Login as patient", hi: "मरीज के रूप में लॉगिन करें" },
    "Register Patient": { en: "Register Patient", hi: "मरीज पंजीकरण" },
    "Add new patient details": { en: "Add new patient details", hi: "नए मरीज की जानकारी जोड़ें" },
    "Book Appointment": { en: "Book Appointment", hi: "अपॉइंटमेंट बुक करें" },
    "Schedule your visit": { en: "Schedule your visit", hi: "अपनी मुलाकात निर्धारित करें" },
    "View Reports": { en: "View Reports", hi: "रिपोर्ट देखें" },
    "Check your reports": { en: "Check your reports", hi: "अपनी रिपोर्ट देखें" },
    "Medicine Info": { en: "Medicine Info", hi: "दवा की जानकारी" },
    "Listen to dosage & info": { en: "Listen to dosage & info", hi: "खुराक और जानकारी सुनें" },
    "Doctor OPD Portal": { en: "Doctor OPD Portal", hi: "डॉक्टर ओपीडी पोर्टल" },
    "Queue & Prescriptions": { en: "Queue & Prescriptions", hi: "कतार और प्रिस्क्रिप्शन" },
    "Open": { en: "Open", hi: "खोलें" },
    "Open Portal": { en: "Open Portal", hi: "पोर्टल खोलें" },
    "Emergency Help": { en: "Emergency Help", hi: "आपातकालीन सहायता" },
    "© 2026 Hospital System": { en: "© 2026 Hospital System", hi: "© 2026 अस्पताल प्रणाली" },

    "Patient Login / मरीज लॉगिन": { en: "Patient Login", hi: "मरीज लॉगिन" },
    "Patient Registration / मरीज पंजीकरण": { en: "Patient Registration", hi: "मरीज पंजीकरण" },
    "Patient Registration": { en: "Patient Registration", hi: "मरीज पंजीकरण" },
    "मरीज पंजीकरण": { en: "Patient Registration", hi: "मरीज पंजीकरण" },
    "New user?": { en: "New user?", hi: "नए उपयोगकर्ता हैं?" },
    "Register here": { en: "Register here", hi: "यहाँ पंजीकरण करें" },
    "Phone Number (10 digits)": { en: "Phone Number (10 digits)", hi: "फोन नंबर (10 अंक)" },
    "Password": { en: "Password", hi: "पासवर्ड" },
    "Please enter both phone number and password": { en: "Please enter both phone number and password", hi: "कृपया फोन नंबर और पासवर्ड दोनों दर्ज करें" },
    "Please enter a valid 10-digit phone number": { en: "Please enter a valid 10-digit phone number", hi: "कृपया सही 10 अंकों का फोन नंबर दर्ज करें" },
    "Logging in...": { en: "Logging in...", hi: "लॉगिन हो रहा है..." },
    "Server communication error. Please try again.": { en: "Server communication error. Please try again.", hi: "सर्वर से संपर्क में समस्या हुई। कृपया फिर प्रयास करें।" },

    "Appointment Booking": { en: "Appointment Booking", hi: "अपॉइंटमेंट बुकिंग" },
    "📅 Appointment Booking / अपॉइंटमेंट बुकिंग": { en: "📅 Appointment Booking", hi: "📅 अपॉइंटमेंट बुकिंग" },
    "🗓️ अपॉइंटमेंट की तारीख चुनें (Select Date):": { en: "🗓️ Select Appointment Date:", hi: "🗓️ अपॉइंटमेंट की तारीख चुनें:" },
    "नियम (Rule):": { en: "Rule:", hi: "नियम:" },
    "उपलब्ध समय और खाली स्लॉट (Available Time & Slots):": { en: "Available Time & Slots:", hi: "उपलब्ध समय और खाली स्लॉट:" },
    "General Physician / सामान्य चिकित्सक": { en: "General Physician", hi: "सामान्य चिकित्सक" },
    "Child Specialist / बाल रोग विशेषज्ञ": { en: "Child Specialist", hi: "बाल रोग विशेषज्ञ" },
    "Bone Specialist / हड्डी रोग विशेषज्ञ": { en: "Bone Specialist", hi: "हड्डी रोग विशेषज्ञ" },
    "📝 बुकिंग सारांश (Confirm Booking)": { en: "📝 Booking Summary", hi: "📝 बुकिंग सारांश" },
    "Doctor:": { en: "Doctor:", hi: "डॉक्टर:" },
    "Date:": { en: "Date:", hi: "तारीख:" },
    "Time:": { en: "Time:", hi: "समय:" },
    "Slots Left:": { en: "Slots Left:", hi: "खाली स्लॉट:" },
    "Patient:": { en: "Patient:", hi: "मरीज:" },
    "Phone:": { en: "Phone:", hi: "फोन:" },
    "रद्द करें (Cancel)": { en: "Cancel", hi: "रद्द करें" },
    "बुक करें (Confirm & Book)": { en: "Confirm & Book", hi: "पुष्टि करें और बुक करें" },
    "⬅ Back to Dashboard": { en: "⬅ Back to Dashboard", hi: "⬅ डैशबोर्ड पर वापस जाएँ" },

    "Emergency": { en: "Emergency", hi: "आपातकाल" },
    "🆘 आपातकाल (Emergency Services)": { en: "🆘 Emergency Services", hi: "🆘 आपातकालीन सेवाएँ" },
    "🚑 एम्बुलेंस (Ambulance)": { en: "🚑 Ambulance", hi: "🚑 एम्बुलेंस" },
    "📞 कॉल करें (Call 108)": { en: "📞 Call 108", hi: "📞 108 पर कॉल करें" },
    "👨‍⚕️ ड्यूटी डॉक्टर (Duty Doctor)": { en: "👨‍⚕️ Duty Doctor", hi: "👨‍⚕️ ड्यूटी डॉक्टर" },
    "📞 डॉक्टर को कॉल करें": { en: "📞 Call Doctor", hi: "📞 डॉक्टर को कॉल करें" },
    "☎️ स्वास्थ्य हेल्पलाइन (Health Helpline)": { en: "☎️ Health Helpline", hi: "☎️ स्वास्थ्य हेल्पलाइन" },
    "📞 कॉल करें (Call 104)": { en: "📞 Call 104", hi: "📞 104 पर कॉल करें" },

    "Patient Medical Reports & OPD Slips": { en: "Patient Medical Reports & OPD Slips", hi: "मरीज की मेडिकल रिपोर्ट और ओपीडी पर्चियाँ" },
    "📄 मेडिकल रिपोर्ट व पर्ची (Medical Reports & OPD Slips)": { en: "📄 Medical Reports & OPD Slips", hi: "📄 मेडिकल रिपोर्ट व पर्ची" },
    "Search Reports & OPD Slips": { en: "Search Reports & OPD Slips", hi: "रिपोर्ट और ओपीडी पर्ची खोजें" },
    "खोजें (Search)": { en: "Search", hi: "खोजें" },
    "🗓️ अपॉइंटमेंट व ओपीडी पर्ची इतिहास (OPD History)": { en: "🗓️ Appointment & OPD Slip History", hi: "🗓️ अपॉइंटमेंट व ओपीडी पर्ची इतिहास" },
    "🏥 सामुदायिक स्वास्थ्य केंद्र (Hospital OPD Slip)": { en: "🏥 Community Health Center (Hospital OPD Slip)", hi: "🏥 सामुदायिक स्वास्थ्य केंद्र (अस्पताल ओपीडी पर्ची)" },
    "मरीज ओपीडी पर्ची व टोकन रसीद": { en: "Patient OPD Slip & Token Receipt", hi: "मरीज ओपीडी पर्ची व टोकन रसीद" },
    "कतार टोकन संख्या (OPD Token)": { en: "Queue Token Number (OPD Token)", hi: "कतार टोकन संख्या (ओपीडी टोकन)" },
    "मरीज (Patient):": { en: "Patient:", hi: "मरीज:" },
    "उम्र / लिंग:": { en: "Age / Sex:", hi: "उम्र / लिंग:" },
    "फ़ोन (Phone):": { en: "Phone:", hi: "फोन:" },
    "गाँव / शहर:": { en: "Village / City:", hi: "गाँव / शहर:" },
    "डॉक्टर (Doctor):": { en: "Doctor:", hi: "डॉक्टर:" },
    "Room / कक्ष:": { en: "Room:", hi: "कक्ष:" },
    "कमरा / कक्ष (Room):": { en: "Room:", hi: "कक्ष:" },
    "🚪 कमरा / कक्ष (Room):": { en: "🚪 Room:", hi: "🚪 कक्ष:" },
    "तारीख व समय:": { en: "Date & Time:", hi: "तारीख व समय:" },
    "🖨️ पर्ची प्रिंट करें (Print)": { en: "🖨️ Print Slip", hi: "🖨️ पर्ची प्रिंट करें" },
    "📱 WhatsApp पर भेजें": { en: "📱 Send on WhatsApp", hi: "📱 WhatsApp पर भेजें" },
    "बंद करें (Close)": { en: "Close", hi: "बंद करें" },
    "बंद करें (Close & View Dashboard)": { en: "Close & View Dashboard", hi: "बंद करें और डैशबोर्ड देखें" },

    "Patient Medicine & Prescription Guide": { en: "Patient Medicine & Prescription Guide", hi: "मरीज की दवा और प्रिस्क्रिप्शन गाइड" },
    "💊 मरीज दवा केंद्र (Patient Medicine Center)": { en: "💊 Patient Medicine Center", hi: "💊 मरीज दवा केंद्र" },
    "👤 Welcome, Patient": { en: "👤 Welcome, Patient", hi: "👤 स्वागत है, मरीज" },
    "🔊 आज की दवाइयाँ सुनें (Listen Summary)": { en: "🔊 Listen Today's Medicines", hi: "🔊 आज की दवाइयाँ सुनें" },
    "📑 मेरी लिखी हुई दवाइयाँ (My Prescriptions)": { en: "📑 My Prescriptions", hi: "📑 मेरी लिखी हुई दवाइयाँ" },
    "⏰ दैनिक समय सारिणी (Daily Schedule)": { en: "⏰ Daily Schedule", hi: "⏰ दैनिक समय सारिणी" },
    "🔍 अस्पताल दवा निर्देशिका (Medicine Directory)": { en: "🔍 Hospital Medicine Directory", hi: "🔍 अस्पताल दवा निर्देशिका" },
    "🩺 डॉक्टर द्वारा लिखी गई दवाइयाँ (Doctor Prescriptions)": { en: "🩺 Doctor Prescriptions", hi: "🩺 डॉक्टर द्वारा लिखी गई दवाइयाँ" },
    "⏰ आज की खुराक दिनचर्या (Today's Dosage Routine)": { en: "⏰ Today's Dosage Routine", hi: "⏰ आज की खुराक दिनचर्या" },
    "अपनी दवा लेने के बाद चेकबॉक्स पर टिक करें (Check off medicines as you take them).": { en: "Check off medicines as you take them.", hi: "अपनी दवा लेने के बाद चेकबॉक्स पर टिक करें।" },
    "सुबह (Morning)": { en: "Morning", hi: "सुबह" },
    "दोपहर (Afternoon)": { en: "Afternoon", hi: "दोपहर" },
    "रात (Night)": { en: "Night", hi: "रात" },
    "दोपहर के भोजन के बाद / After Lunch": { en: "After Lunch", hi: "दोपहर के भोजन के बाद" },
    "रात के भोजन के बाद / After Dinner": { en: "After Dinner", hi: "रात के भोजन के बाद" },
    "🔍 अस्पताल सामान्य दवा गाइड (Hospital Medicine Guide)": { en: "🔍 Hospital Medicine Guide", hi: "🔍 अस्पताल सामान्य दवा गाइड" },
    "सभी (All)": { en: "All", hi: "सभी" },
    "🌡️ बुखार (Fever)": { en: "🌡️ Fever", hi: "🌡️ बुखार" },
    "🤧 सर्दी-खांसी (Cold & Cough)": { en: "🤧 Cold & Cough", hi: "🤧 सर्दी-खांसी" },
    "⚡ दर्द (Pain Relief)": { en: "⚡ Pain Relief", hi: "⚡ दर्द से राहत" },
    "💊 एंटीबायोटिक (Antibiotic)": { en: "💊 Antibiotic", hi: "💊 एंटीबायोटिक" },
    "🤢 गैस-एसिडिटी (Acidity & Stomach)": { en: "🤢 Acidity & Stomach", hi: "🤢 गैस-एसिडिटी" },
    "🌿 विटामिन्स (Vitamins)": { en: "🌿 Vitamins", hi: "🌿 विटामिन्स" },
    "दवा रिकॉर्ड लोड हो रहे हैं... (Loading prescriptions...)": { en: "Loading prescriptions...", hi: "दवा रिकॉर्ड लोड हो रहे हैं..." },

    "नाम (Full Name) *": { en: "Full Name *", hi: "नाम *" },
    "उम्र (Age) *": { en: "Age *", hi: "उम्र *" },
    "लिंग (Gender) *": { en: "Gender *", hi: "लिंग *" },
    "-- लिंग चुनें (Select) --": { en: "-- Select Gender --", hi: "-- लिंग चुनें --" },
    "पुरुष (Male)": { en: "Male", hi: "पुरुष" },
    "महिला (Female)": { en: "Female", hi: "महिला" },
    "अन्य (Other)": { en: "Other", hi: "अन्य" },
    "जन्म तिथि (Date of Birth)": { en: "Date of Birth", hi: "जन्म तिथि" },
    "फ़ोन नंबर (Phone Number - 10 digits) *": { en: "Phone Number (10 digits) *", hi: "फ़ोन नंबर (10 अंक) *" },
    "पासवर्ड (Password) *": { en: "Password *", hi: "पासवर्ड *" },
    "गाँव / शहर (Village / City) *": { en: "Village / City *", hi: "गाँव / शहर *" },
    "आयुष्मान भारत ABHA ID (Optional)": { en: "Ayushman Bharat ABHA ID (Optional)", hi: "आयुष्मान भारत ABHA ID (वैकल्पिक)" },
    "राशन कार्ड संख्या / BPL Card (Optional)": { en: "Ration Card / BPL Card Number (Optional)", hi: "राशन कार्ड संख्या / BPL कार्ड (वैकल्पिक)" },
    "ईमेल (E-mail - Optional)": { en: "E-mail (Optional)", hi: "ईमेल (वैकल्पिक)" },
    "सबमिट करें (Register)": { en: "Register", hi: "सबमिट करें" },
    "पहले से खाता है? लॉगिन करें (Login)": { en: "Already have an account? Login", hi: "पहले से खाता है? लॉगिन करें" },
    "उदा. Ramesh Kumar": { en: "e.g. Ramesh Kumar", hi: "उदा. Ramesh Kumar" },
    "10 अंकों का मोबाइल नंबर": { en: "10-digit mobile number", hi: "10 अंकों का मोबाइल नंबर" },
    "सुरक्षित पासवर्ड बनाएं": { en: "Create a secure password", hi: "सुरक्षित पासवर्ड बनाएं" },
    "उदा. Rampur": { en: "e.g. Rampur", hi: "उदा. Rampur" },
    "14 अंकों की ABHA ID (यदि उपलब्ध हो)": { en: "14-digit ABHA ID (if available)", hi: "14 अंकों की ABHA ID (यदि उपलब्ध हो)" },
    "राशन कार्ड / BPL कार्ड नंबर": { en: "Ration Card / BPL Card number", hi: "राशन कार्ड / BPL कार्ड नंबर" },
    "name@example.com": { en: "name@example.com", hi: "name@example.com" },

    "Choose Your Language": { en: "Choose Your Language", hi: "अपनी भाषा चुनें" },
    "You can change your language later.": { en: "You can change your language later.", hi: "आप बाद में अपनी भाषा बदल सकते हैं।" }
  };

  function getLanguage() {
    return localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
  }

  function preserveWhitespace(original, replacement) {
    const leading = (original.match(/^\s*/) || [""])[0];
    const trailing = (original.match(/\s*$/) || [""])[0];
    return leading + replacement + trailing;
  }

  function translateText(text) {
    if (!text || !text.trim()) return text;

    const normalized = text.replace(/\s+/g, " ").trim();

    if (dict[normalized]) {
      return preserveWhitespace(text, dict[normalized][getLanguage()]);
    }

    // Dynamic dashboard greeting.
    let m = normalized.match(/^Welcome,\s*(.+)$/i);
    if (m) {
      return preserveWhitespace(text, getLanguage() === "hi" ? `स्वागत है, ${m[1]}` : `Welcome, ${m[1]}`);
    }


    m = normalized.match(/^(.*?)\s*\(([^()]*)\)(.*)$/);
    if (m && /[\u0900-\u097F]/.test(m[1] + m[2]) && /[A-Za-z]/.test(m[1] + m[2])) {
      const a = m[1].trim();
      const b = m[2].trim();
      const suffix = m[3] || "";
      const hi = /[\u0900-\u097F]/.test(a) ? a : b;
      const en = /[A-Za-z]/.test(a) ? a : b;
      return preserveWhitespace(text, (getLanguage() === "hi" ? hi : en) + suffix);
    }

    // Generic "English / Hindi".
    if (normalized.includes(" / ")) {
      const parts = normalized.split(" / ");
      if (parts.length === 2 && /[\u0900-\u097F]/.test(normalized) && /[A-Za-z]/.test(normalized)) {
        const hi = parts.find(p => /[\u0900-\u097F]/.test(p)) || parts[1];
        const en = parts.find(p => /[A-Za-z]/.test(p)) || parts[0];
        return preserveWhitespace(text, getLanguage() === "hi" ? hi.trim() : en.trim());
      }
    }

    return text;
  }

  function translateElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG"].includes(el.tagName)) return;
    if (el.hasAttribute("data-no-translate")) return;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      if (el.placeholder) el.placeholder = translateText(el.placeholder);
      if (el.title) el.title = translateText(el.title);
      return;
    }

    if (el.tagName === "OPTION") {
      el.textContent = translateText(el.textContent);
      return;
    }

    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = translateText(node.nodeValue);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        translateElement(node);
      }
    }

    if (el.title) el.title = translateText(el.title);
  }

  function applyLanguage() {
    const current = getLanguage();
    document.documentElement.lang = current;
    translateElement(document.body);
    document.title = translateText(document.title);
  }

  window.HospitalLanguage = {
    get: getLanguage,
    apply: applyLanguage,
    set: function (language) {
      localStorage.setItem(LANG_KEY, language === "hi" ? "hi" : "en");
      window.location.reload();
    }
  };

  document.addEventListener("DOMContentLoaded", applyLanguage);


  document.addEventListener("DOMContentLoaded", function () {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node);
          } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            node.nodeValue = translateText(node.nodeValue);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
  window.chooseLanguage = function (language) {
    localStorage.setItem("preferredLanguage", language === "hi" ? "hi" : "en");
    window.location.href = "login.html";
  };
})();
