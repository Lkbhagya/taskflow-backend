const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(requireAuth);

router.get('/', requireRole('ADMIN'), userController.listUsers);
router.get('/:id', userController.getUser);
router.put('/:id/role', requireRole('ADMIN'), userController.updateUserRole);

module.exports = router;
