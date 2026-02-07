const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");

// 🔹 Öffentlich: Kontakt abrufen (GET)
router.get("/", contactController.get);

// 🔹 Admin only: Kontakt erstellen
router.post("/", contactController.authenticateToken, contactController.create);

// 🔹 Admin only: Kontakt bearbeiten
router.put("/", contactController.authenticateToken, contactController.update);

// 🔹 Admin only: Kontakt löschen
router.delete("/", contactController.authenticateToken, contactController.delete);

module.exports = router;
