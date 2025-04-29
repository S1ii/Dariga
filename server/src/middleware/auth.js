const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Защита маршрутов
exports.protect = async (req, res, next) => {
  let token;

  // Проверяем наличие токена в заголовке
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Извлекаем токен из заголовка
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Если токен в куки
    token = req.cookies.token;
  }

  // Проверяем наличие токена
  if (!token) {
    console.log('No token found, access denied');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key123');

    // Находим пользователя по id из токена
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('User not found with ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Ограничение доступа по ролям
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Проверяем наличие роли пользователя в списке разрешенных
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
}; 