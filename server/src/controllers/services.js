const Service = require('../models/Service');

// @desc    Получить все услуги
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    let filter = { createdBy: req.user.id };
    
    // Добавляем фильтр по категории
    if (category) {
      filter.category = category;
    }
    
    // Добавляем фильтр по статусу
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const services = await Service.find(filter);
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить одну услугу
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Услуга не найдена'
      });
    }

    // Проверяем, принадлежит ли услуга текущему пользователю
    if (service.createdBy !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой услуге'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Создать услугу
// @route   POST /api/services
// @access  Private
exports.createService = async (req, res, next) => {
  try {
    // Добавляем ID пользователя к данным услуги
    req.body.createdBy = req.user.id;
    
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Обновить услугу
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Услуга не найдена'
      });
    }

    // Проверяем, принадлежит ли услуга текущему пользователю
    if (service.createdBy !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой услуге'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Удалить услугу
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Услуга не найдена'
      });
    }

    // Проверяем, принадлежит ли услуга текущему пользователю
    if (service.createdBy !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой услуге'
      });
    }

    await Service.deleteOne.call(service);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Изменить статус активности услуги
// @route   PATCH /api/services/:id/toggle-status
// @access  Private
exports.toggleServiceStatus = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Услуга не найдена'
      });
    }

    // Проверяем, принадлежит ли услуга текущему пользователю
    if (service.createdBy !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой услуге'
      });
    }

    // Переключаем статус услуги
    service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: !service.isActive },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    next(err);
  }
}; 