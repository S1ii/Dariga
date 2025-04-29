const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Получить все задачи
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    // Получаем все задачи из базы данных, а не только текущего пользователя
    const tasks = await Task.findAll();
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить одну задачу
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }
    
    // Убираем проверку принадлежности задачи пользователю
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Создать задачу
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    // Добавляем ID пользователя к данным задачи
    req.body.user_id = req.user.id;
    
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Обновить задачу
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }
    
    // Добавлена проверка на наличие поля title перед обновлением задачи
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Поле title обязательно для обновления задачи'
      });
    }
    
    // Убираем проверку принадлежности задачи пользователю
    // Убираем проверку на изменение владельца
    task = await Task.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Удалить задачу
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }
    
    // Убираем проверку принадлежности задачи пользователю
    const result = await Task.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить задачи по статусу
// @route   GET /api/tasks/status/:status
// @access  Private
exports.getTasksByStatus = async (req, res, next) => {
  try {
    // Получаем задачи по статусу для всех пользователей
    const tasks = await Task.findByStatusAll(req.params.status);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Получить сводку по задачам
// @route   GET /api/tasks/summary
// @access  Private
exports.getTasksSummary = async (req, res, next) => {
  try {
    // Получаем общую сводную статистику по задачам для всех пользователей
    const summary = await Task.getSummaryAll();
    
    // Формируем и возвращаем результат
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};