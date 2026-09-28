const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  age: { type: Number, required: true, min: 0, max: 120 },

  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"]
  },

  dob: {
    type: String,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/
  },

  password: {
    type: String,
    required: true
  },

  email: {
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  village: { type: String, trim: true },


  abhaId: {
    type: String,
    trim: true,
    default: ""
  },

  rationCard: {
    type: String,
    trim: true,
    default: ""
  },


  role: {
    type: String,
    enum: ["patient", "doctor", "official"],
    default: "patient"
  },

  language: {
    type: String,
    enum: ["en", "hi"],
    default: "en"
  }

}, { timestamps: true });

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


patientSchema.methods.comparePassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return this.password === enteredPassword;
};

module.exports = mongoose.model("Patient", patientSchema);