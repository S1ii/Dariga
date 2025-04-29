const { db } = require('../config/db');

// Миграция для добавления новых полей в таблицу organizations
function runMigration() {
  return new Promise((resolve, reject) => {
    // Проверяем, существуют ли уже колонки
    db.all("PRAGMA table_info(organizations)", [], (err, columns) => {
      if (err) {
        return reject(err);
      }
      
      const columnNames = columns.map(column => column.name);
      const columnsToAdd = [];
      
      if (!columnNames.includes('type')) {
        columnsToAdd.push("ALTER TABLE organizations ADD COLUMN type TEXT DEFAULT 'ООО'");
      }
      
      if (!columnNames.includes('industry')) {
        columnsToAdd.push("ALTER TABLE organizations ADD COLUMN industry TEXT");
      }
      
      if (!columnNames.includes('employees')) {
        columnsToAdd.push("ALTER TABLE organizations ADD COLUMN employees INTEGER DEFAULT 0");
      }
      
      if (columnsToAdd.length === 0) {
        console.log('Все колонки уже существуют в таблице organizations.');
        return resolve();
      }
      
      // Выполняем миграции
      db.serialize(() => {
        // SQLite поддерживает только одну ALTER TABLE операцию за раз
        columnsToAdd.forEach(sql => {
          db.run(sql, [], err => {
            if (err) {
              console.error('Ошибка при добавлении колонки:', sql, err);
            }
          });
        });
        
        console.log('Миграция успешно выполнена. Добавлены новые поля в таблицу organizations.');
        resolve();
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