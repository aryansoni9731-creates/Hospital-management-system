const Patient = require("../models/Patient");
const { rateLimit, createPatientToken } = require("../middleware/auth");

module.exports = function registerAuthRoutes(app) {
app.post("/login", rateLimit({ windowMs: 60 * 1000, max: 15, message: "Too many login attempts. Please wait 1 minute. / बहुत अधिक प्रयास, कृपया 1 मिनट बाद पुनः प्रयास करें।" }), async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required"
      });
    }

    const patient = await Patient.findOne({ phone: String(phone).trim() });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found with this phone number"
      });
    }

    const isMatch = await patient.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const requestedLanguage = req.body.language === "hi" ? "hi" : (req.body.language === "en" ? "en" : null);
    if (requestedLanguage && patient.language !== requestedLanguage) {
      patient.language = requestedLanguage;
      await patient.save();
    }

    const patientToken = createPatientToken(patient.phone);

    res.json({
      success: true,
      message: "Login successful",
      token: patientToken,
      name: patient.name,
      phone: patient.phone,
      abhaId: patient.abhaId || "",
      village: patient.village || "",
      role: patient.role || "patient",
      language: patient.language || "en"
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
app.post("/register", rateLimit({ windowMs: 60 * 1000, max: 10, message: "Too many registrations. Please wait a minute. / कृपया थोड़ी देर बाद पंजीकरण का प्रयास करें।" }), async (req, res) => {
  try {
    const { name, age, gender, dob, phone, password, email, village, abhaId, rationCard, language } = req.body;

    if (!name || !age || !gender || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const formattedPhone = String(phone).trim();
    const exists = await Patient.findOne({ phone: formattedPhone });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "A patient with this phone number already exists"
      });
    }

    const patient = new Patient({
      name,
      age: Number(age),
      gender,
      dob: dob || "",
      phone: formattedPhone,
      password,
      email: email || "",
      village: village || "",
      abhaId: abhaId || "",
      rationCard: rationCard || "",
      language: language === "hi" ? "hi" : "en",
      role: "patient"
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: "Registered successfully"
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error registering patient"
    });
  }
});

};
