const { db } = require('../config/db');
const SystemLog = require('../models/SystemLog');
const UserActivity = require('../models/UserActivity');

// Функция для создания таблиц логов, если они не существуют
const setupLogTables = async () => {
  console.log('Настройка системы логирования...');
  
  try {
    // Создаем таблицу для системных логов, если она не существует
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')) NOT NULL,
          message TEXT NOT NULL,
          source TEXT NOT NULL,
          details TEXT,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы system_logs:', err);
          reject(err);
        } else {
          console.log('Таблица system_logs создана или уже существует');
          resolve();
        }
      });
    });
    
    // Создаем таблицу для активностей, если она не существует
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          user_name TEXT NOT NULL,
          user_avatar TEXT,
          action TEXT NOT NULL,
          target TEXT NOT NULL,
          target_type TEXT,
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы activities:', err);
          reject(err);
        } else {
          console.log('Таблица activities создана или уже существует');
          resolve();
        }
      });
    });
    
    // Создаем начальные системные логи
    await SystemLog.createLog({
      level: 'info',
      message: 'Система логирования инициализирована',
      source: 'system',
      details: { timestamp: new Date().toISOString() }
    });
    
    console.log('Система логирования успешно настроена');
    return true;
  } catch (error) {
    console.error('Ошибка при настройке системы логирования:', error);
    return false;
  }
};

// Запускаем настройку, если скрипт вызван напрямую
if (require.main === module) {
  setupLogTables()
    .then(success => {
      if (success) {
        console.log('Настройка системы логирования завершена успешно');
        process.exit(0);
      } else {
        console.error('Настройка системы логирования завершилась с ошибками');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Неожиданная ошибка при настройке системы логирования:', err);
      process.exit(1);
    });
}

module.exports = setupLogTables; 