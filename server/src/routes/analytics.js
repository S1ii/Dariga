const express = require('express');
const { analyticsPlaceholder } = require('../controllers/analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Защищаем все маршруты
router.use(protect);

// Все маршруты аналитики перенаправляются на заглушку
router.get('/dashboard', analyticsPlaceholder);
router.get('/tasks-by-month', analyticsPlaceholder);
router.get('/client-stats', analyticsPlaceholder);
// Обрабатываем все остальные пути в аналитике
router.get('*', analyticsPlaceholder);

module.exports = router; 