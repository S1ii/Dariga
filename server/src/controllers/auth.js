const User = require('../models/User');

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создаем пользователя
    const user = await User.create({
      name,
      email,
      password,
      role: 'user' // По умолчанию роль пользователя
    });

    // Отправляем ответ с токеном
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Вход пользователя
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Проверяем наличие email и пароля
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Введите email и пароль'
      });
    }

    // Находим пользователя (с паролем)
    const user = await User.findOneWithPassword(email);

    // Проверяем существование пользователя
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные'
      });
    }

    // Проверяем соответствие пароля
    const isMatch = await User.matchPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные'
      });
    }

    // Отправляем ответ с токеном
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Получение информации о текущем пользователе
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Выход пользователя / очистка куки
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Успешный выход из системы'
    });
  } catch (err) {
    next(err);
  }
};

// Функция для создания токена и отправки ответа
const sendTokenResponse = (user, statusCode, res) => {
  // Создаем токен
  const token = User.getSignedJwtToken(user.id);

  // Получаем данные пользователя без пароля
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
}; 