const Client = require('../models/Client');

// @desc    Получить всех клиентов
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res, next) => {
  try {
    // Находим всех клиентов системы
    const clients = await Client.findAll();
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить одного клиента
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Клиент не найден'
      });
    }
    
    // Убираем проверку принадлежности клиента пользователю
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Создать клиента
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res, next) => {
  try {
    // Добавляем ID пользователя к данным клиента
    req.body.user_id = req.user.id;
    
    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Обновить клиента
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Клиент не найден'
      });
    }
    
    // Убираем проверку принадлежности клиента пользователю и ограничение на изменение владельца
    client = await Client.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Удалить клиента
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Клиент не найден'
      });
    }
    
    // Убираем проверку принадлежности клиента пользователю
    const result = await Client.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Поиск клиентов
// @route   GET /api/clients/search/:query
// @access  Private
exports.searchClients = async (req, res, next) => {
  try {
    // Ищем клиентов по всей системе, а не только для текущего пользователя
    const clients = await Client.searchAll(req.params.query);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (err) {
    next(err);
  }
};