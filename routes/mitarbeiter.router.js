const express = require('express');
const router = express.Router();
const mitarbeiterController = require('../controller/mitarbeiter.controller');

// 🔹 Alle Mitarbeiter abrufen
router.get('/', mitarbeiterController.getAllMitarbeiter);

// 🔹 Einzelnen Mitarbeiter abrufen
router.get('/:id', mitarbeiterController.getMitarbeiterById);

// 🔹 Mitarbeiter erstellen
router.post('/', mitarbeiterController.createMitarbeiter);

// 🔹 Mitarbeiter aktualisieren
router.put('/:id', mitarbeiterController.updateMitarbeiter);

// 🔹 Mitarbeiter löschen
router.delete('/:id', mitarbeiterController.deleteMitarbeiter);

module.exports = router;
