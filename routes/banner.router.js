const express = require("express");
const router = express.Router();
const bannerController = require("../controller/banner.controller");

// GET aktuelles Banner
router.get("/current", bannerController.getCurrentBanner);

// POST Banner hochladen → Admin only
router.post(
  "/",
  bannerController.authenticateToken,
  bannerController.uploadMiddleware.single("banner"),
  bannerController.uploadBanner
);

// DELETE Banner → Admin only
router.delete(
  "/:id",
  bannerController.authenticateToken,
  bannerController.deleteBanner
);

module.exports = router;
