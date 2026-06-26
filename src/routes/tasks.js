const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use(requireAuth);

router.get('/', taskController.listTasks);
router.get('/stats', taskController.getStats);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
