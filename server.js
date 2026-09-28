require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDatabase } = require("./config/database");

const { ensurePortalPassword, ensureDefaultDoctors, ensureDefaultMedicines } = require("./services/bootstrap");
const registerPublicRoutes = require("./routes/publicRoutes");
const registerAuthRoutes = require("./routes/authRoutes");
const registerAppointmentRoutes = require("./routes/appointmentRoutes");
const registerDoctorRoutes = require("./routes/doctorRoutes");
const registerPatientRoutes = require("./routes/patientRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ui.html"));
});

registerPublicRoutes(app);
registerAuthRoutes(app);
registerAppointmentRoutes(app);
registerDoctorRoutes(app);
registerPatientRoutes(app);

async function startServer() {
  try {
    await connectDatabase();

    await ensurePortalPassword();
    await ensureDefaultDoctors();
    await ensureDefaultMedicines();

    app.listen(PORT, () => {
      console.log(`MONGODB CONNECTED`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/ `);
    });
  } catch (error) {
    console.error("❌ Startup error:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
