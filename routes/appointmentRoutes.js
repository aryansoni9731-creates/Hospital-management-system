const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Counter = require("../models/Counter");
const { requirePatientAuth } = require("../middleware/auth");

module.exports = function registerAppointmentRoutes(app) {
  app.post("/book", requirePatientAuth, async (req, res) => {
    try {
      const { doctor, date, time, medicines } = req.body;
      const name = req.patient.name;
      const phone = req.patient.phone;

      if (!doctor || !date || !time) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: doctor, date, time"
        });
      }

      const formattedPhone = String(phone).trim();

      const existingAppointment = await Appointment.findOne({
        doctor,
        date,
        phone: formattedPhone
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: `You already have an appointment booked with ${doctor} on ${date} at ${existingAppointment.time} (Token #${existingAppointment.tokenNumber || 1}). Only 1 appointment per doctor per day is allowed.`
        });
      }

      const count = await Appointment.countDocuments({ doctor, date, time });
      const maxSlots = 5;

      if (count >= maxSlots) {
        return res.status(400).json({
          success: false,
          message: `No slots available for ${doctor} at ${time} on ${date}`
        });
      }

      const counterKey = `token:${doctor}:${date}`;
      const counter = await Counter.findOneAndUpdate(
        { key: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const tokenNumber = counter.seq;

      const docInfo = await Doctor.findOne({ name: doctor });
      const roomNumber = docInfo ? docInfo.roomNumber : "Room 1";

      const appointment = new Appointment({
        name,
        doctor,
        date,
        time,
        phone: formattedPhone,
        tokenNumber,
        roomNumber,
        status: "Pending",
        medicines: medicines || []
      });

      await appointment.save();

      const patient = await Patient.findOne({ phone: formattedPhone });

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment: {
          _id: appointment._id,
          name: appointment.name,
          doctor: appointment.doctor,
          date: appointment.date,
          time: appointment.time,
          phone: appointment.phone,
          tokenNumber: appointment.tokenNumber,
          roomNumber: appointment.roomNumber,
          status: appointment.status,
          age: patient ? patient.age : "",
          gender: patient ? patient.gender : "",
          village: patient ? patient.village : "",
          abhaId: patient ? patient.abhaId : ""
        }
      });

    } catch (err) {
      console.error("Booking error:", err);
      res.status(500).json({
        success: false,
        message: "Error booking appointment"
      });
    }
  });

  app.get("/slots", async (req, res) => {
    try {
      const { doctor, date, time } = req.query;

      if (!doctor || !date) {
        return res.status(400).json({
          success: false,
          message: "doctor and date query parameters are required"
        });
      }

      const maxSlots = 5;

      if (time) {
        const count = await Appointment.countDocuments({ doctor, date, time });
        return res.json({
          success: true,
          doctor,
          date,
          time,
          booked: count,
          remaining: Math.max(0, maxSlots - count)
        });
      }

      const appointments = await Appointment.find({ doctor, date }, { time: 1 });
      const slotCounts = {};
      appointments.forEach(a => {
        slotCounts[a.time] = (slotCounts[a.time] || 0) + 1;
      });

      res.json({
        success: true,
        doctor,
        date,
        slotCounts,
        maxSlots
      });

    } catch (err) {
      console.error("Slots query error:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching slots"
      });
    }
  });

};
