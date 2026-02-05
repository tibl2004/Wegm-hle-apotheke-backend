const express = require('express');
const router = express.Router();
const funktionController = require('../controller/funktion.controller');

// 🔹 Funktionen-Routen
router.get('/', funktionController.getAllFunktionen);           // Alle Funktionen
router.get('/:id', funktionController.getFunktionById);        // Einzelne Funktion
router.post('/', funktionController.createFunktion);           // Neue Funktion erstellen
router.put('/:id', funktionController.updateFunktion);         // Funktion aktualisieren
router.delete('/:id', funktionController.deleteFunktion);      // Funktion löschen


module.exports = router;
