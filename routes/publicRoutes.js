const path = require("path");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");
const Medicine = require("../models/Medicine");
const AccessControl = require("../models/AccessControl");
const {
  PORTAL_KEY,
  PORTAL_TOKEN_TTL_MS,
  rateLimit,
  createPortalToken,
  verifyPortalToken
} = require("../middleware/auth");

module.exports = function registerPublicRoutes(app) {
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "language.html"));
  });

  app.get("/doctor.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "doctor.html"));
  });

  app.get("/doctor/verify", (req, res) => {
    const token = req.get("X-Doctor-Access-Token") || req.query.access;
    if (!verifyPortalToken(token)) {
      return res.status(401).json({ success: false, message: "Doctor portal session expired or invalid" });
    }
    res.json({ success: true });
  });

  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await Doctor.find({ active: true }).sort({ roomNumber: 1 });
      res.json({ success: true, doctors });
    } catch (err) {
      console.error("Error fetching doctors:", err);
      res.status(500).json({ success: false, message: "Error loading doctors" });
    }
  });

  app.get("/api/medicines", async (req, res) => {
    try {
      const { category, search } = req.query;
      const filter = {};

      if (category && category !== "All") filter.category = category;
      if (search) {
        const s = String(search).trim();
        filter.$or = [
          { name: { $regex: s, $options: "i" } },
          { purpose: { $regex: s, $options: "i" } },
          { purposeHi: { $regex: s, $options: "i" } }
        ];
      }

      const medicines = await Medicine.find(filter).sort({ name: 1 });
      res.json({ success: true, medicines });
    } catch (err) {
      console.error("Error fetching medicines:", err);
      res.status(500).json({ success: false, message: "Error loading medicines" });
    }
  });

  app.post(
    "/doctor/access",
    rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      message: "Too many attempts. Please wait 1 minute. / बहुत अधिक प्रयास, कृपया 1 मिनट बाद पुनः प्रयास करें।"
    }),
    async (req, res) => {
      try {
        const { password } = req.body || {};
        if (!password) {
          return res.status(400).json({ success: false, message: "Portal password is required." });
        }

        const access = await AccessControl.findOne({ key: PORTAL_KEY });
        if (!access) {
          return res.status(503).json({ success: false, message: "Doctor Portal password is not configured yet." });
        }

        const valid = await bcrypt.compare(password, access.passwordHash);
        if (!valid) {
          return res.status(401).json({ success: false, message: "Incorrect portal password. / गलत पासवर्ड।" });
        }

        res.json({ success: true, token: createPortalToken(), expiresInMs: PORTAL_TOKEN_TTL_MS });
      } catch (err) {
        console.error("Doctor portal access error:", err);
        res.status(500).json({ success: false, message: "Unable to verify portal access." });
      }
    }
  );
};
