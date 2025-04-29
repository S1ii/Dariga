const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Убедимся, что директория для базы данных существует
const dbDir = path.join(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Создаем соединение с базой данных
const dbPath = path.join(__dirname, '../../db/database.sqlite');

// Создаем экземпляр базы данных
const db = new sqlite3.Database(dbPath);

// Включаем режим внешних ключей для обеспечения целостности данных
db.run('PRAGMA foreign_keys = ON');

// Инициализация базы данных
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Создаем таблицу пользователей
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user',
        resetPasswordToken TEXT,
        resetPasswordExpire TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Создаем таблицу клиентов
      db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        user_id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Создаем таблицу организаций
      db.run(`CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        contactPerson TEXT,
        phone TEXT,
        email TEXT,
        status TEXT CHECK(status IN ('active', 'archived')) DEFAULT 'active',
        type TEXT DEFAULT 'ООО',
        industry TEXT,
        employees INTEGER DEFAULT 0,
        user_id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Создаем таблицу задач
      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        dueDate DATE,
        assignedTo TEXT,
        user_id INTEGER NOT NULL,
        client_id INTEGER,
        organization_id INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
      )`);

      // Создаем таблицу услуг
      db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        currency TEXT DEFAULT 'KZT',
        category TEXT,
        user_id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Создаем таблицу активностей
      db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        action TEXT NOT NULL,
        target TEXT,
        target_type TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Создаем таблицу системных логов
      db.run(`CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        source TEXT,
        details TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )`);

      // Initialize settings table if it doesn't exist
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'", [], (err, row) => {
        if (err) {
          console.error('Error checking settings table:', err);
          return;
        }
        
        if (!row) {
          console.log('Creating settings table...');
          db.run(`
            CREATE TABLE settings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              siteTitle TEXT NOT NULL DEFAULT 'CRM System',
              siteDescription TEXT NOT NULL DEFAULT 'Управление задачами и клиентами',
              contactEmail TEXT NOT NULL DEFAULT 'admin@example.com',
              enableRegistration INTEGER NOT NULL DEFAULT 1,
              requireEmailVerification INTEGER NOT NULL DEFAULT 0,
              sessionTimeout INTEGER NOT NULL DEFAULT 60,
              maxLoginAttempts INTEGER NOT NULL DEFAULT 5,
              enableDarkMode INTEGER NOT NULL DEFAULT 0,
              maintenanceMode INTEGER NOT NULL DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, [], (err) => {
            if (err) {
              console.error('Error creating settings table:', err);
              return;
            }
            
            // Insert default settings
            db.run(`
              INSERT INTO settings (
                siteTitle, siteDescription, contactEmail, 
                enableRegistration, requireEmailVerification, 
                sessionTimeout, maxLoginAttempts, 
                enableDarkMode, maintenanceMode
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              'CRM System',
              'Управление задачами и клиентами',
              'admin@example.com',
              1, 0, 60, 5, 0, 0
            ], (err) => {
              if (err) {
                console.error('Error inserting default settings:', err);
              } else {
                console.log('Default settings inserted successfully');
              }
            });
          });
        }
      });

      resolve();
    });
  });
}

// Инициализируем базу данных при запуске
initializeDatabase()
  .then(() => {
    console.log('База данных инициализирована');
  })
  .catch(err => {
    console.error('Ошибка при инициализации базы данных:', err);
  });

// Для обратной совместимости с существующим кодом
const connectDB = async () => {
  try {
    return db;
  } catch (error) {
    console.error(`Ошибка инициализации SQLite: ${error.message}`);
    process.exit(1);
  }
};

module.exports = db;
module.exports.db = db;
module.exports.connectDB = connectDB; 