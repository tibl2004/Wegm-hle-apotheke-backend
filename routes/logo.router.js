// routes/logo.routes.js
const express = require("express");
const router = express.Router();
const logoController = require("../controller/logo.controller");

// GET aktuelles Logo
router.get("/current", logoController.getCurrentLogo);

// POST Logo hochladen → Admin only
router.post(
  "/",
  logoController.authenticateToken,
  logoController.uploadMiddleware.single("logo"),
  logoController.uploadLogo
);

// DELETE Logo → Admin only
router.delete(
  "/:id",
  logoController.authenticateToken,
  logoController.deleteLogo
);

module.exports = router;
