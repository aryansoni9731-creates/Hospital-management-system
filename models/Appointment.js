const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  doctor: {
    type: String,
    required: true,
    trim: true
  },

  // 📅 Appointment Date (e.g., "YYYY-MM-DD")
  date: {
    type: String,
    required: true,
    trim: true
  },

  // ⏱ Appointment Time Slot (e.g., "10:00 AM")
  time: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },

  // 🎫 OPD Queue Token Number for the day
  tokenNumber: {
    type: Number,
    default: 1
  },

  // 🩺 Clinic Status
  status: {
    type: String,
    enum: ["Pending", "In Consultation", "Completed", "Cancelled"],
    default: "Pending"
  },

  // 📝 Doctor Diagnosis & Clinical Notes
  diagnosis: {
    type: String,
    default: ""
  },

  // 💊 Prescribed medicines
  medicines: {
    type: [String],
    default: []
  },

  // 🚪 Doctor consultation room (e.g., "Room 1", "Room 2")
  roomNumber: {
    type: String,
    default: "Room 1"
  }

}, { timestamps: true });

// 🔍 Indices for performance and slot querying
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });
appointmentSchema.index({ doctor: 1, date: 1, phone: 1 });
appointmentSchema.index({ doctor: 1, date: 1, tokenNumber: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);