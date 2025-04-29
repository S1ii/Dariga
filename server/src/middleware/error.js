const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Лог ошибки в консоль для разработчика
  console.log(err.stack);

  // Ошибка Mongoose при неверном ID
  if (err.name === 'CastError') {
    const message = 'Ресурс не найден';
    error = { message, success: false };
    return res.status(404).json(error);
  }

  // Ошибка дубликата ключа Mongoose
  if (err.code === 11000) {
    const message = 'Такое значение уже существует';
    error = { message, success: false };
    return res.status(400).json(error);
  }

  // Ошибка валидации Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, success: false };
    return res.status(400).json(error);
  }

  // Определяем статус ошибки или устанавливаем 500 (Внутренняя ошибка сервера)
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Ошибка сервера'
  });
};

module.exports = errorHandler; 