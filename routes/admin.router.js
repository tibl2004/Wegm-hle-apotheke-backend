const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const upload = require('../middlewares/upload');

router.post('/create', upload.single('foto'), adminController.createAdmin);
router.put('/update/:id', upload.single('foto'), adminController.updateAdmin);
router.get('/', adminController.getAllAdmins);
router.get('/:id', adminController.getAdminById);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
