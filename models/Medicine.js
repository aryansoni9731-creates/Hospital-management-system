const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Fever", "Cold", "Antibiotic", "Acidity", "Pain", "Vitamins", "Other"],
    default: "Other"
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  purposeHi: {
    type: String,
    required: true,
    trim: true
  },
  timing: {
    type: String,
    required: true,
    trim: true
  },
  timingHi: {
    type: String,
    required: true,
    trim: true
  },
  icons: {
    type: String,
    default: "🌅 🌙"
  },
  warning: {
    type: String,
    default: ""
  },
  warningHi: {
    type: String,
    default: ""
  },
  voiceTextHi: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Medicine", medicineSchema);
