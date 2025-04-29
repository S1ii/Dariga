const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
} = require('../controllers/services');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Защищаем все маршруты
router.use(protect);

// Основные маршруты
router.route('/')
  .get(getServices)
  .post(createService);

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

// Специальные маршруты
router.patch('/:id/toggle-status', toggleServiceStatus);

module.exports = router; 