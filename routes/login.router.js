const express = require("express");
const router = express.Router();
const loginController = require("../controller/login.controller");

router.post("/", loginController.login);

router.post(
  "/change-password",
  loginController.authenticateToken,
  loginController.changePassword
);

module.exports = router;
