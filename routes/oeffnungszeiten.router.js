const express = require("express");
const router = express.Router();
const oeffnungszeitenController = require("../controller/oeffnungszeiten.controller");

// 🔒 Middleware: Token prüfen
const authenticate = oeffnungszeitenController.authenticateToken;

// ➕ Öffnungszeiten erstellen (nur Vorstand)
router.post("/", authenticate, oeffnungszeitenController.createOeffnungszeiten);

// 🔄 Öffnungszeiten aktualisieren (nur Vorstand)
router.put("/:id", authenticate, oeffnungszeitenController.updateOeffnungszeiten);

// ❌ Öffnungszeiten löschen (nur Vorstand)
router.delete("/:id", authenticate, oeffnungszeitenController.deleteOeffnungszeiten);

// 📖 Öffnungszeiten abrufen (öffentlich oder authentifiziert)
router.get("/", oeffnungszeitenController.getOeffnungszeiten);

module.exports = router;
