const express = require("express");
const router = express.Router();

const oeffnungszeitenController = require("../controller/oeffnungszeiten.controller");

// ===============================
// 🔓 PUBLIC ROUTES
// ===============================

// Öffnungszeiten (komprimiert für Website)
router.get(
  "/",
  oeffnungszeitenController.getOeffnungszeiten
);


// ===============================
// 🔐 PROTECTED ROUTES (JWT)
// ===============================

// Alle Öffnungszeiten für Admin-Bearbeitung
router.get(
  "/edit",
  oeffnungszeitenController.authenticateToken,
  oeffnungszeitenController.getOeffzeitenForEdit
);

// Zeitblock hinzufügen
router.post(
  "/",
  oeffnungszeitenController.authenticateToken,
  oeffnungszeitenController.addZeitblock
);

// Zeitblock aktualisieren
router.put(
  "/:id",
  oeffnungszeitenController.authenticateToken,
  oeffnungszeitenController.updateZeitblock
);

// Zeitblock löschen
router.delete(
  "/:id",
  oeffnungszeitenController.authenticateToken,
  oeffnungszeitenController.deleteZeitblock
);

module.exports = router;
