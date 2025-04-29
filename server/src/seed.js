const { db } = require('./config/db');
const bcrypt = require('bcryptjs');

// Функция для хеширования пароля
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Создание таблицы пользователей, если она не существует
const createUsersTable = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Создание тестового пользователя
const createTestUser = async () => {
  const hashedPassword = await hashPassword('password123');
  
  return new Promise((resolve, reject) => {
    // Сначала удаляем существующего пользователя чтобы избежать дубликатов и проблем
    db.run('DELETE FROM users WHERE email = ?', ['admin@example.com'], (err) => {
      if (err) {
        console.error('Ошибка при удалении существующего пользователя:', err);
      }
      
      // Создаем тестового пользователя
      const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, ['Admin User', 'admin@example.com', hashedPassword, 'admin'], function(err) {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Тестовый пользователь создан с ID: ${this.lastID}`);
        resolve();
      });
    });
  });
};

// Выполнение сидирования данных
const seed = async () => {
  try {
    // Создаем таблицы, если они не существуют
    await createUsersTable();
    
    // Создаем тестового пользователя
    await createTestUser();
    
    console.log('Сидирование базы данных завершено успешно');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при сидировании базы данных:', error);
    process.exit(1);
  }
};

// Запускаем сидирование
seed(); 