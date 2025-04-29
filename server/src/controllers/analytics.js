const { db } = require('../config/db');

// @desc    Заглушка для аналитики - функционал будет добавлен позже
// @route   GET /api/analytics/*
// @access  Private
exports.analyticsPlaceholder = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Функционал аналитики находится в разработке и будет добавлен в ближайшее время',
    data: null
  });
}; 