const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksSummary
} = require('../controllers/tasks');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Защищаем все маршруты
router.use(protect);

// Специальные маршруты
router.get('/summary', getTasksSummary);

// Основные маршруты
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router; 