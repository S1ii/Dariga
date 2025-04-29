const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

// Роуты
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const organizationsRoutes = require('./routes/organizations');
const servicesRoutes = require('./routes/services');
const tasksRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(express.json());

// Настройка CORS для разрешения запросов с фронтенда
app.use(cors({
  origin: 'http://localhost:3000', // URL фронтенда
  credentials: true // для поддержки cookies и заголовков авторизации
}));


// Логирование в режиме разработки
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Обработка ошибок
app.use(errorHandler);

// Простой маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API сервер CRM работает'
  });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ресурс не найден'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен в режиме ${process.env.NODE_ENV} на порту ${PORT}`);
});

// Обработка отказа сервера
process.on('unhandledRejection', (err, promise) => {
  console.log(`Ошибка: ${err.message}`);
  // Закрытие сервера и выход из процесса
  server.close(() => process.exit(1));
});