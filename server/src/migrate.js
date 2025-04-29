const { db } = require('./config/db');

const migrate = async () => {
  console.log('Начало миграции базы данных...');

  // Проверяем существующие колонки в таблице clients
  db.all("PRAGMA table_info(clients)", [], (err, columns) => {
    if (err) {
      console.error('Ошибка при проверке таблицы clients:', err);
      return;
    }

    const hasUserIdColumn = columns.some(col => col.name === 'user_id');
    
    if (!hasUserIdColumn) {
      // Добавляем колонку user_id в таблицу clients
      db.run(`ALTER TABLE clients ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении user_id в таблицу clients:', err);
        } else {
          console.log('Колонка user_id добавлена в таблицу clients');
        }
      });
    } else {
      console.log('Колонка user_id уже существует в таблице clients');
    }
  });

  // Проверяем существующие колонки в таблице organizations
  db.all("PRAGMA table_info(organizations)", [], (err, columns) => {
    if (err) {
      console.error('Ошибка при проверке таблицы organizations:', err);
      return;
    }

    const hasUserIdColumn = columns.some(col => col.name === 'user_id');
    
    if (!hasUserIdColumn) {
      // Добавляем колонку user_id в таблицу organizations
      db.run(`ALTER TABLE organizations ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении user_id в таблицу organizations:', err);
        } else {
          console.log('Колонка user_id добавлена в таблицу organizations');
        }
      });
    } else {
      console.log('Колонка user_id уже существует в таблице organizations');
    }
  });

  // Проверяем существующие колонки в таблице tasks
  db.all("PRAGMA table_info(tasks)", [], (err, columns) => {
    if (err) {
      console.error('Ошибка при проверке таблицы tasks:', err);
      return;
    }

    const hasUserIdColumn = columns.some(col => col.name === 'user_id');
    const hasClientIdColumn = columns.some(col => col.name === 'client_id');
    const hasOrganizationIdColumn = columns.some(col => col.name === 'organization_id');
    
    if (!hasUserIdColumn) {
      // Добавляем колонку user_id в таблицу tasks
      db.run(`ALTER TABLE tasks ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении user_id в таблицу tasks:', err);
        } else {
          console.log('Колонка user_id добавлена в таблицу tasks');
        }
      });
    } else {
      console.log('Колонка user_id уже существует в таблице tasks');
    }

    if (!hasClientIdColumn) {
      // Добавляем колонку client_id в таблицу tasks
      db.run(`ALTER TABLE tasks ADD COLUMN client_id INTEGER`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении client_id в таблицу tasks:', err);
        } else {
          console.log('Колонка client_id добавлена в таблицу tasks');
        }
      });
    } else {
      console.log('Колонка client_id уже существует в таблице tasks');
    }

    if (!hasOrganizationIdColumn) {
      // Добавляем колонку organization_id в таблицу tasks
      db.run(`ALTER TABLE tasks ADD COLUMN organization_id INTEGER`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении organization_id в таблицу tasks:', err);
        } else {
          console.log('Колонка organization_id добавлена в таблицу tasks');
        }
      });
    } else {
      console.log('Колонка organization_id уже существует в таблице tasks');
    }
  });

  // Проверяем существующие колонки в таблице services
  db.all("PRAGMA table_info(services)", [], (err, columns) => {
    if (err) {
      console.error('Ошибка при проверке таблицы services:', err);
      return;
    }

    const hasUserIdColumn = columns.some(col => col.name === 'user_id');
    
    if (!hasUserIdColumn) {
      // Добавляем колонку user_id в таблицу services
      db.run(`ALTER TABLE services ADD COLUMN user_id INTEGER DEFAULT 1`, (err) => {
        if (err) {
          console.error('Ошибка при добавлении user_id в таблицу services:', err);
        } else {
          console.log('Колонка user_id добавлена в таблицу services');
        }
      });
    } else {
      console.log('Колонка user_id уже существует в таблице services');
    }
  });

  // Создаем таблицу для уведомлений, если она не существует
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      related_id TEXT,
      related_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы notifications:', err);
    } else {
      console.log('Таблица notifications создана или уже существует');
    }
  });

  // Создаем таблицу для активностей, если она не существует
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
    } else {
      console.log('Таблица activities создана или уже существует');
    }
  });

  // Создаем таблицу для системных логов, если она не существует
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
    } else {
      console.log('Таблица system_logs создана или уже существует');
    }
  });

  console.log('Миграция завершена');
};

migrate().catch(err => {
  console.error('Ошибка при выполнении миграции:', err);
  process.exit(1);
});