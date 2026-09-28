const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { requirePatientAuth } = require("../middleware/auth");

module.exports = function registerPatientRoutes(app) {
  app.get("/patient/me", requirePatientAuth, async (req, res) => {
    res.json({
      success: true,
      patient: {
        name: req.patient.name,
        phone: req.patient.phone,
        language: req.patient.language || "en",
        role: req.patient.role || "patient"
      }
    });
  });

  app.patch("/patient/language", requirePatientAuth, async (req, res) => {
    try {
      const language = req.body?.language === "hi" ? "hi" : (req.body?.language === "en" ? "en" : null);
      if (!language) return res.status(400).json({ success: false, message: "Language must be en or hi." });
      req.patient.language = language;
      await req.patient.save();
      res.json({ success: true, language });
    } catch (err) {
      console.error("Language preference error:", err);
      res.status(500).json({ success: false, message: "Unable to save language preference." });
    }
  });

  app.get("/report/:phone", requirePatientAuth, async (req, res) => {
    try {
      const requestedPhone = String(req.params.phone).trim();
      const phone = req.patient.phone;
      if (requestedPhone !== phone) {
        return res.status(403).json({ success: false, message: "You can only access your own medical records." });
      }

      const patient = await Patient.findOne({ phone });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found"
        });
      }

      const appointments = await Appointment.find({ phone }).sort({ createdAt: -1 });

      res.json({
        success: true,
        patient: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          dob: patient.dob,
          phone: patient.phone,
          email: patient.email,
          village: patient.village,
          abhaId: patient.abhaId || "",
          rationCard: patient.rationCard || ""
        },
        appointments
      });

    } catch (err) {
      console.error("Report error:", err);
      res.status(500).json({
        success: false,
        message: "Server error fetching report"
      });
    }
  });

};
