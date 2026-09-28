const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const { requirePortalAccess } = require("../middleware/auth");

module.exports = function registerDoctorRoutes(app) {
  app.get("/doctor/queue", requirePortalAccess, async (req, res) => {
    try {
      const { doctor, date } = req.query;

      if (!doctor || !date) {
        return res.status(400).json({
          success: false,
          message: "doctor and date query parameters are required"
        });
      }

      const escapedDoc = doctor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\./g, '\\.?');
      const docRegex = new RegExp(`^${escapedDoc}$`, "i");

      const appointments = await Appointment.find({
        doctor: { $regex: docRegex },
        date: String(date).trim()
      }).sort({ tokenNumber: 1, createdAt: 1 });

      const enrichedAppointments = await Promise.all(
        appointments.map(async (app) => {
          let patient = null;
          if (app.phone) {
            try {
              patient = await Patient.findOne({ phone: String(app.phone).trim() });
            } catch (e) {
              console.error("Patient find error in queue:", e);
            }
          }
          return {
            _id: app._id,
            tokenNumber: app.tokenNumber || 1,
            name: app.name || (patient ? patient.name : "Patient"),
            phone: app.phone || "",
            doctor: app.doctor,
            date: app.date,
            time: app.time,
            status: app.status || "Pending",
            diagnosis: app.diagnosis || "",
            medicines: Array.isArray(app.medicines) ? app.medicines : [],
            age: patient && patient.age !== undefined ? patient.age : "N/A",
            gender: patient && patient.gender ? patient.gender : "N/A",
            village: patient && patient.village ? patient.village : "N/A",
            abhaId: patient && patient.abhaId ? patient.abhaId : "N/A",
            roomNumber: app.roomNumber || "Room 1"
          };
        })
      );

      res.json({
        success: true,
        doctor,
        date,
        totalPatients: enrichedAppointments.length,
        appointments: enrichedAppointments
      });

    } catch (err) {
      console.error("Doctor queue error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Error fetching doctor queue"
      });
    }
  });

  app.patch("/doctor/queue/status", requirePortalAccess, async (req, res) => {
    try {
      const { appointmentId, status } = req.body || {};
      const allowed = ["Pending", "In Consultation", "Completed", "Cancelled"];
      if (!appointmentId || !allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "appointmentId and a valid status are required." });
      }
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true }
      );
      if (!appointment) return res.status(404).json({ success: false, message: "Appointment record not found." });
      res.json({ success: true, appointment });
    } catch (err) {
      console.error("Queue status error:", err);
      res.status(500).json({ success: false, message: "Error updating queue status." });
    }
  });

  app.post("/doctor/prescribe", requirePortalAccess, async (req, res) => {
    try {
      const { appointmentId, medicines, diagnosis } = req.body;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          message: "appointmentId is required"
        });
      }

      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment record not found"
        });
      }

      appointment.medicines = Array.isArray(medicines) ? medicines : (medicines ? [medicines] : []);
      appointment.diagnosis = diagnosis || "";
      appointment.status = "Completed";

      await appointment.save();

      res.json({
        success: true,
        message: "Prescription saved and appointment completed successfully",
        appointment
      });

    } catch (err) {
      console.error("Prescribe error:", err);
      res.status(500).json({
        success: false,
        message: "Error saving prescription"
      });
    }
  });

};
