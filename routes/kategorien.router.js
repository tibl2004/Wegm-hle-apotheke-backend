const express = require("express");
const router = express.Router();
const kategorienController = require("../controller/kategorien.controller");

// 🔹 Öffentlich: Alle Kategorien + Unterpunkte abrufen
router.get("/", kategorienController.getAll);

// 🔹 Admin only: Kategorie erstellen
router.post("/", kategorienController.authenticateToken, kategorienController.createKategorie);

// 🔹 Admin only: Kategorie löschen
router.delete("/:id", kategorienController.authenticateToken, kategorienController.deleteKategorie);

// 🔹 Admin only: Unterpunkt erstellen
router.post("/unterpunkt", kategorienController.authenticateToken, kategorienController.createUnterpunkt);

// 🔹 Admin only: Unterpunkt löschen
router.delete("/unterpunkt/:id", kategorienController.authenticateToken, kategorienController.deleteUnterpunkt);

module.exports = router;
