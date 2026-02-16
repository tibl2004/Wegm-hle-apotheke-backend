const express = require("express");
const router = express.Router();
const dienstleistungenController = require("../controller/dienstleistungen.controller");

// 🔹 Öffentlich: Alle Dienstleistungen (nur id, titel, bild)
router.get("/", dienstleistungenController.getAll);

// 🔹 Öffentlich: Dienstleistung nach ID (alle Details)
router.get("/:id", dienstleistungenController.getById);

// 🔹 Admin only: Dienstleistung erstellen (+ Bild)
router.post(
  "/",
  dienstleistungenController.authenticateToken,
  dienstleistungenController.uploadMiddleware.single("bild"),
  dienstleistungenController.create[1]
);

// 🔹 Admin only: Dienstleistung bearbeiten (+ optionales neues Bild)
router.put(
  "/:id",
  dienstleistungenController.authenticateToken,
  dienstleistungenController.uploadMiddleware.single("bild"),
  dienstleistungenController.update[1]
);

// 🔹 Admin only: Dienstleistung löschen
router.delete(
  "/:id",
  dienstleistungenController.authenticateToken,
  dienstleistungenController.delete
);

module.exports = router;
