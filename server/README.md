# CRM Server

Бэкенд-часть приложения для управления взаимоотношениями с клиентами.

## Технологии

- Node.js
- Express.js
- SQLite3
- JWT для аутентификации
- bcryptjs для хеширования паролей

## Установка

```bash
npm install
```

## Конфигурация

1. Создайте файл `.env` в корневой папке сервера со следующими переменными:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

2. База данных SQLite автоматически инициализируется при первом запуске в директории `db/database.sqlite`

## Запуск сервера

```bash
# Режим разработки с автоперезагрузкой
npm run dev

# Продакшн режим
npm start
```

Сервер запустится по адресу: `http://localhost:5000`

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/logout` - Выход из системы

### Пользователи

- `GET /api/users/profile` - Получение профиля текущего пользователя
- `PUT /api/users/profile` - Обновление профиля пользователя
- `PUT /api/users/change-password` - Изменение пароля

### Клиенты

- `GET /api/clients` - Получение списка клиентов
- `GET /api/clients/:id` - Получение информации о клиенте
- `POST /api/clients` - Создание нового клиента
- `PUT /api/clients/:id` - Обновление информации о клиенте
- `DELETE /api/clients/:id` - Удаление клиента

### Задачи

- `GET /api/tasks` - Получение списка задач
- `GET /api/tasks/:id` - Получение информации о задаче
- `POST /api/tasks` - Создание новой задачи
- `PUT /api/tasks/:id` - Обновление задачи
- `DELETE /api/tasks/:id` - Удаление задачи

### Организации

- `GET /api/organizations` - Получение списка организаций
- `GET /api/organizations/:id` - Получение информации об организации
- `POST /api/organizations` - Создание новой организации
- `PUT /api/organizations/:id` - Обновление информации об организации
- `DELETE /api/organizations/:id` - Удаление организации

### Администрирование

- `GET /api/admin/users` - Получение списка пользователей (только для админов)
- `GET /api/admin/stats` - Получение статистики системы
- `GET /api/admin/activity` - Получение активности системы
- `GET /api/admin/users/performance` - Получение показателей эффективности пользователей

## Структура проекта

```
server/
├── db/                   # Директория с базой данных SQLite
├── src/                  # Исходный код
│   ├── config/           # Конфигурационные файлы
│   ├── controllers/      # Контроллеры для обработки запросов
│   ├── middleware/       # Промежуточные обработчики
│   ├── models/           # Модели данных
│   ├── routes/           # Маршруты API
│   └── index.js          # Точка входа приложения
├── .env                  # Переменные окружения
└── package.json          # Зависимости и скрипты
```

## Тестирование

```bash
npm test
```

# Server Documentation

## Services API Endpoints

The Services API provides endpoints for managing services in the system.

### Base URL

```
/api/services
```

### Endpoints

#### Get All Services

Retrieves a list of all services, with optional filtering by category and active status.

- **URL**: `/api/services`
- **Method**: `GET`
- **Query Parameters**:
  - `category` (optional): Filter services by category
  - `isActive` (optional): Filter services by active status (`true` or `false`)
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "service_id_1",
        "name": "Service 1",
        "description": "Description of service 1",
        "price": 5000,
        "currency": "RUB",
        "duration": "1 hour",
        "category": "Consultation",
        "isActive": true,
        "createdBy": "user_id",
        "createdAt": "2023-01-01T12:00:00.000Z",
        "updatedAt": "2023-01-01T12:00:00.000Z"
      },
      {
        "_id": "service_id_2",
        "name": "Service 2",
        "description": "Description of service 2",
        "price": 10000,
        "currency": "RUB",
        "duration": "2 hours",
        "category": "Support",
        "isActive": false,
        "createdBy": "user_id",
        "createdAt": "2023-01-02T12:00:00.000Z",
        "updatedAt": "2023-01-02T12:00:00.000Z"
      }
    ]
  }
  ```

#### Get Service by ID

Retrieves a specific service by its ID.

- **URL**: `/api/services/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "service_id_1",
      "name": "Service 1",
      "description": "Description of service 1",
      "price": 5000,
      "currency": "RUB",
      "duration": "1 hour",
      "category": "Consultation",
      "isActive": true,
      "createdBy": "user_id",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
  }
  ```

#### Create Service

Creates a new service.

- **URL**: `/api/services`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "New Service",
    "description": "Description of new service",
    "price": 5000,
    "currency": "RUB",
    "duration": "1 hour",
    "category": "Consultation"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "new_service_id",
      "name": "New Service",
      "description": "Description of new service",
      "price": 5000,
      "currency": "RUB",
      "duration": "1 hour",
      "category": "Consultation",
      "isActive": true,
      "createdBy": "user_id",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z"
    }
  }
  ```

#### Update Service

Updates an existing service.

- **URL**: `/api/services/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Updated Service",
    "description": "Updated description",
    "price": 6000,
    "currency": "RUB",
    "duration": "1.5 hours",
    "category": "Consultation"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "service_id",
      "name": "Updated Service",
      "description": "Updated description",
      "price": 6000,
      "currency": "RUB",
      "duration": "1.5 hours",
      "category": "Consultation",
      "isActive": true,
      "createdBy": "user_id",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T13:00:00.000Z"
    }
  }
  ```

#### Delete Service

Deletes a service.

- **URL**: `/api/services/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

#### Toggle Service Status

Toggles the active status of a service (active/inactive).

- **URL**: `/api/services/:id/toggle-status`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "service_id",
      "name": "Service",
      "description": "Description",
      "price": 5000,
      "currency": "RUB",
      "duration": "1 hour",
      "category": "Consultation",
      "isActive": false,
      "createdBy": "user_id",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T14:00:00.000Z"
    }
  }
  ```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common error codes:
- `404`: Resource not found
- `403`: Not authorized to access the resource
- `400`: Bad request (invalid input data)
- `500`: Server error 