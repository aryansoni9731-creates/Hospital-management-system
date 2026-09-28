const crypto = require("crypto");
const Patient = require("../models/Patient");

const rateLimitStore = new Map();

function rateLimit({ windowMs = 60 * 1000, max = 20, message = "Too many attempts, please try again in a minute." }) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "global";
    const now = Date.now();
    const entry = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    } else {
      entry.count++;
    }

    rateLimitStore.set(ip, entry);

    if (entry.count > max) {
      return res.status(429).json({ success: false, message });
    }

    next();
  };
}

const PORTAL_KEY = "doctorPortal";
const PORTAL_TOKEN_TTL_MS = 4 * 60 * 60 * 1000;
const PORTAL_SECRET = process.env.PORTAL_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const PATIENT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PATIENT_SECRET = process.env.PATIENT_SESSION_SECRET || crypto.randomBytes(32).toString("hex");

function createPortalToken() {
  const expiresAt = Date.now() + PORTAL_TOKEN_TTL_MS;
  const payload = `${PORTAL_KEY}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", PORTAL_SECRET).update(payload).digest("hex");
  return `${expiresAt}.${signature}`;
}

function verifyPortalToken(token) {
  if (!token || typeof token !== "string") return false;

  const [expiresAt, signature] = token.split(".");
  const expiry = Number(expiresAt);
  if (!expiry || expiry < Date.now() || !signature) return false;

  const payload = `${PORTAL_KEY}.${expiry}`;
  const expected = crypto.createHmac("sha256", PORTAL_SECRET).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function createPatientToken(phone) {
  const expiresAt = Date.now() + PATIENT_TOKEN_TTL_MS;
  const payload = `patient.${phone}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", PATIENT_SECRET).update(payload).digest("hex");
  return `${phone}.${expiresAt}.${signature}`;
}

function verifyPatientToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [phone, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!phone || !/^\d{10}$/.test(phone) || !expiresAt || expiresAt < Date.now() || !signature) {
    return null;
  }

  const payload = `patient.${phone}.${expiresAt}`;
  const expected = crypto.createHmac("sha256", PATIENT_SECRET).update(payload).digest("hex");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  return { phone, expiresAt };
}

function getPatientToken(req) {
  const auth = req.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return req.get("X-Patient-Token") || "";
}

async function requirePatientAuth(req, res, next) {
  try {
    const tokenData = verifyPatientToken(getPatientToken(req));
    if (!tokenData) {
      return res.status(401).json({ success: false, message: "Patient login required. / मरीज लॉगिन आवश्यक है।" });
    }

    const patient = await Patient.findOne({ phone: tokenData.phone });
    if (!patient) {
      return res.status(401).json({ success: false, message: "Patient account not found. / मरीज खाता नहीं मिला।" });
    }

    req.patient = patient;
    next();
  } catch (error) {
    console.error("Patient authentication error:", error);
    res.status(500).json({ success: false, message: "Authentication error." });
  }
}

function requirePortalAccess(req, res, next) {
  const token = req.get("X-Doctor-Access-Token") || req.query.access;
  if (!verifyPortalToken(token)) {
    return res.status(401).json({ success: false, message: "Doctor/official portal access required. / अधिकृत डॉक्टर पोर्टल एक्सेस आवश्यक है।" });
  }
  next();
}

module.exports = {
  PORTAL_KEY,
  PORTAL_TOKEN_TTL_MS,
  rateLimit,
  createPortalToken,
  verifyPortalToken,
  createPatientToken,
  verifyPatientToken,
  getPatientToken,
  requirePatientAuth,
  requirePortalAccess
};
