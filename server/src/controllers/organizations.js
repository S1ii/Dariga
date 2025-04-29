const Organization = require('../models/Organization');

// @desc    Получить все организации
// @route   GET /api/organizations
// @access  Private
exports.getOrganizations = async (req, res, next) => {
  try {
    // Находим все организации пользователя
    const organizations = await Organization.findByUser(req.user.id);
    
    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить одну организацию
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Организация не найдена'
      });
    }
    
    // Проверяем, принадлежит ли организация текущему пользователю
    if (organization.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой организации'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Создать организацию
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res, next) => {
  try {
    // Добавляем ID пользователя к данным организации
    req.body.user_id = req.user.id;
    
    const organization = await Organization.create(req.body);

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Обновить организацию
// @route   PUT /api/organizations/:id
// @access  Private
exports.updateOrganization = async (req, res, next) => {
  try {
    let organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Организация не найдена'
      });
    }
    
    // Проверяем, принадлежит ли организация текущему пользователю
    if (organization.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой организации'
      });
    }
    
    // Убеждаемся, что пользователь не пытается изменить владельца
    if (req.body.user_id && req.body.user_id !== organization.user_id && req.user.role !== 'admin') {
      delete req.body.user_id;
    }

    organization = await Organization.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Удалить организацию
// @route   DELETE /api/organizations/:id
// @access  Private
exports.deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Организация не найдена'
      });
    }
    
    // Проверяем, принадлежит ли организация текущему пользователю
    if (organization.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой организации'
      });
    }

    const result = await Organization.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Поиск организаций
// @route   GET /api/organizations/search/:query
// @access  Private
exports.searchOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.search(req.params.query, req.user.id);
    
    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить организации по статусу
// @route   GET /api/organizations/status/:status
// @access  Private
exports.getOrganizationsByStatus = async (req, res, next) => {
  try {
    const organizations = await Organization.findByStatus(req.params.status, req.user.id);
    
    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (err) {
    next(err);
  }
}; 