const { db } = require('../config/db');

// Миграция для пересоздания таблицы organizations с новыми полями
function runMigration() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Начинаем транзакцию
      db.run('BEGIN TRANSACTION', err => {
        if (err) {
          console.error('Ошибка при начале транзакции:', err);
          return reject(err);
        }
        
        // 1. Создаем временную таблицу
        db.run(`CREATE TABLE organizations_temp (
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
        )`, err => {
          if (err) {
            console.error('Ошибка при создании временной таблицы:', err);
            db.run('ROLLBACK');
            return reject(err);
          }
          
          // 2. Копируем данные из старой таблицы во временную
          db.run(`INSERT INTO organizations_temp (id, name, address, contactPerson, phone, email, status, user_id, createdAt, updatedAt)
                  SELECT id, name, address, contactPerson, phone, email, status, user_id, createdAt, updatedAt FROM organizations`, err => {
            if (err) {
              console.error('Ошибка при копировании данных:', err);
              db.run('ROLLBACK');
              return reject(err);
            }
            
            // 3. Удаляем старую таблицу
            db.run('DROP TABLE organizations', err => {
              if (err) {
                console.error('Ошибка при удалении старой таблицы:', err);
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // 4. Переименовываем временную таблицу
              db.run('ALTER TABLE organizations_temp RENAME TO organizations', err => {
                if (err) {
                  console.error('Ошибка при переименовании таблицы:', err);
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                // 5. Завершаем транзакцию
                db.run('COMMIT', err => {
                  if (err) {
                    console.error('Ошибка при завершении транзакции:', err);
                    db.run('ROLLBACK');
                    return reject(err);
                  }
                  
                  console.log('Миграция успешно выполнена. Таблица organizations пересоздана с новыми полями.');
                  resolve();
                });
              });
            });
          });
        });
      });
    });
  });
}

// Запускаем миграцию
runMigration()
  .then(() => {
    console.log('Миграция завершена успешно.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Ошибка при выполнении миграции:', err);
    process.exit(1);
  }); 