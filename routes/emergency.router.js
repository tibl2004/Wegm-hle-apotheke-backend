const express = require('express');
const router = express.Router();
const emergencyController = require('../controller/emergency.controller');

router.get("/", emergencyController.getAll);
router.post("/", emergencyController.authenticateToken, emergencyController.create);
router.put("/order", emergencyController.authenticateToken, emergencyController.updateOrder);
router.put("/:id", emergencyController.authenticateToken, emergencyController.update);
router.delete("/:id", emergencyController.authenticateToken, emergencyController.delete);


module.exports = router;
