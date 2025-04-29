# CRM System

Полноценная система управления взаимоотношениями с клиентами (CRM) с веб-интерфейсом.

## Возможности

- Управление клиентами
- Управление организациями
- Управление задачами с функциональностью drag-and-drop
- Управление услугами
- Панель администратора
- Аналитика и визуализация данных
- Многоязычный интерфейс (русский, английский, казахский)
- Адаптивный дизайн для мобильных устройств и десктопа

## Технический стек

### Клиентская часть
- React 19
- TypeScript
- Material UI 7
- React Router 7
- Recharts для визуализации данных
- Tailwind CSS
- Axios для HTTP-запросов
- DnD Kit для drag-and-drop функциональности

### Серверная часть
- Node.js
- Express.js
- SQLite3
- JWT для аутентификации
- bcryptjs для хеширования паролей

## Структура проекта

```
/
├── client/               # Клиентская часть (React)
│   ├── public/           # Статические файлы
│   ├── src/              # Исходный код
│   │   ├── components/   # Переиспользуемые компоненты
│   │   ├── context/      # React контексты
│   │   ├── hooks/        # Пользовательские хуки
│   │   ├── pages/        # Компоненты страниц
│   │   ├── services/     # Сервисы для работы с API
│   │   ├── theme/        # Настройки темы
│   │   ├── locales/      # Файлы локализации
│   │   └── App.tsx       # Корневой компонент
├── server/               # Серверная часть (Node.js)
│   ├── db/               # База данных SQLite
│   ├── src/              # Исходный код
│   │   ├── config/       # Конфигурационные файлы
│   │   ├── controllers/  # Контроллеры для обработки запросов
│   │   ├── middleware/   # Промежуточные обработчики
│   │   ├── models/       # Модели данных
│   │   ├── routes/       # Маршруты API
│   │   └── index.js      # Точка входа приложения
```

## Установка и запуск

### Требования
- Node.js 18+
- npm 10+

### Клиентская часть

```bash
# Переход в директорию клиента
cd client

# Установка зависимостей
npm install

# Создание .env файла
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

### Серверная часть

```bash
# Переход в директорию сервера
cd server

# Установка зависимостей
npm install

# Создание .env файла
echo "PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development" > .env

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение информации о текущем пользователе

### Клиенты
- `GET /api/clients` - Получение списка клиентов
- `GET /api/clients/:id` - Получение информации о клиенте
- `POST /api/clients` - Создание нового клиента
- `PUT /api/clients/:id` - Обновление информации о клиенте
- `DELETE /api/clients/:id` - Удаление клиента

### Организации
- `GET /api/organizations` - Получение списка организаций
- `GET /api/organizations/:id` - Получение информации об организации
- `POST /api/organizations` - Создание новой организации
- `PUT /api/organizations/:id` - Обновление информации об организации
- `DELETE /api/organizations/:id` - Удаление организации

### Услуги
- `GET /api/services` - Получение списка услуг
- `GET /api/services/:id` - Получение информации об услуге
- `POST /api/services` - Создание новой услуги
- `PUT /api/services/:id` - Обновление информации об услуге
- `DELETE /api/services/:id` - Удаление услуги
- `PATCH /api/services/:id/toggle-status` - Переключение статуса услуги

### Задачи
- `GET /api/tasks` - Получение списка задач
- `GET /api/tasks/:id` - Получение информации о задаче
- `POST /api/tasks` - Создание новой задачи
- `PUT /api/tasks/:id` - Обновление задачи
- `DELETE /api/tasks/:id` - Удаление задачи

### Аналитика
- `GET /api/analytics/dashboard` - Получение данных для дашборда
- `GET /api/analytics/sales` - Получение данных по продажам
- `GET /api/analytics/clients` - Получение аналитики по клиентам

### Администрирование
- `GET /api/admin/users` - Получение списка пользователей
- `GET /api/admin/stats` - Получение статистики системы
- `GET /api/admin/activity` - Получение активности системы
- `GET /api/admin/users/performance` - Получение показателей эффективности пользователей

## Тестирование

### Клиент
```bash
cd client
npm test
```

### Сервер
```bash
cd server
npm test
```

## Лицензия

[MIT](LICENSE) 