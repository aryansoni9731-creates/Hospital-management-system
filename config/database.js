const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hospitalDB";

async function connectDatabase() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Connected");
}

module.exports = { connectDatabase };
