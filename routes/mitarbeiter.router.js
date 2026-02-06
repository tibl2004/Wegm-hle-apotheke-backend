const express = require("express");
const router = express.Router();

const mitarbeiterController = require("../controller/mitarbeiter.controller");

// ===============================
// 👩‍⚕️ MITARBEITER ROUTES (CRUD)
// ===============================

// 📥 GET – alle Mitarbeiter
router.get("/", mitarbeiterController.getAll);

// ➕ POST – Mitarbeiter erstellen (mit optionalem Foto)
router.post("/", mitarbeiterController.create);

// ✏️ PUT – Mitarbeiter updaten (optional neues Foto)
router.put("/:id", mitarbeiterController.update);

// ❌ DELETE – Mitarbeiter + Foto löschen
router.delete("/:id", mitarbeiterController.delete);

module.exports = router;
