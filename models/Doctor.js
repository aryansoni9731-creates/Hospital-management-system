const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  nameHi: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  specializationHi: {
    type: String,
    required: true,
    trim: true
  },
  roomNumber: {
    type: String,
    required: true,
    default: "Room 1"
  },
  slots: {
    type: [String],
    default: ["10:00 AM", "11:00 AM", "12:00 PM"]
  },
  active: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: "doctor-1.jpeg"
  }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
