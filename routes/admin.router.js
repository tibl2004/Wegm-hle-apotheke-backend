const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");

// ==========================
// 🔹 Admin erstellen (nur einmal)
// ==========================
// POST /api/admin/create
router.post("/create", adminController.createAdmin);

// ==========================
// 🔹 Admin-Profil abrufen
// GET /api/admin/profile
router.get("/profile", adminController.authenticateToken, adminController.getProfile);

// ==========================
// 🔹 Admin-Profil aktualisieren
// PUT /api/admin/profile
// Body: { username?, password?, email? }
router.put("/profile", adminController.authenticateToken, adminController.updateProfile);

module.exports = router;
