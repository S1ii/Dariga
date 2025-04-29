const { db } = require('../config/db');

const Task = {
  // Получить все задачи
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Получить задачи пользователя
  findByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Найти задачу по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return resolve(null);
        }
        resolve(row);
      });
    });
  },
  
  // Найти задачи по статусу
  findByStatus: (status, userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE status = ? AND user_id = ? ORDER BY dueDate', [status, userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Найти задачи по статусу для всех пользователей
  findByStatusAll: (status) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE status = ? ORDER BY dueDate', [status], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Создать новую задачу
  create: (taskData) => {
    return new Promise((resolve, reject) => {
      const { title, description, status, priority, dueDate, assignedTo, user_id, client_id, organization_id } = taskData;
      
      const sql = `INSERT INTO tasks (
        title, description, status, priority, dueDate, assignedTo, user_id, client_id, organization_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [
        title, 
        description, 
        status || 'pending', 
        priority || 'medium', 
        dueDate || new Date().toISOString().split('T')[0], 
        assignedTo || 'Вы',
        user_id,
        client_id || null,
        organization_id || null
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получить созданную задачу
        Task.findById(this.lastID)
          .then(task => resolve(task))
          .catch(err => reject(err));
      });
    });
  },
  
  // Обновить задачу
  update: (id, taskData) => {
    return new Promise((resolve, reject) => {
      const { title, description, status, priority, dueDate, assignedTo, client_id, organization_id } = taskData;
      
      // Добавлена проверка на наличие title перед выполнением SQL-запроса в методе update
      if (!title) {
        return reject(new Error('Title is required'));
      }

      const sql = `UPDATE tasks 
                   SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, assignedTo = ?,
                       client_id = ?, organization_id = ?, updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;
      
      db.run(sql, [
        title, 
        description, 
        status, 
        priority, 
        dueDate, 
        assignedTo,
        client_id || null,
        organization_id || null,
        id
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        if (this.changes === 0) {
          return resolve(null); // Задача не найдена
        }
        
        // Получить обновленную задачу
        Task.findById(id)
          .then(task => resolve(task))
          .catch(err => reject(err));
      });
    });
  },
  
  // Удалить задачу
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        
        resolve({ id, deleted: this.changes > 0 });
      });
    });
  },
  
  // Получить количество задач по статусу
  countByStatus: (status, userId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM tasks WHERE status = ? AND user_id = ?', [status, userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row.count);
      });
    });
  },
  
  // Получить сводную статистику по задачам
  getSummary: (userId) => {
    return new Promise((resolve, reject) => {
      // SQL запрос для получения статистики по статусам
      const statusQuery = `
        SELECT status, COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? OR assignedTo = ? 
        GROUP BY status
      `;
      
      // SQL запрос для получения статистики по приоритетам
      const priorityQuery = `
        SELECT priority, COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? OR assignedTo = ? 
        GROUP BY priority
      `;
      
      // Начинаем транзакцию для выполнения нескольких запросов
      db.serialize(() => {
        let summary = {
          total: 0,
          byStatus: {
            pending: 0,
            'in-progress': 0,
            completed: 0
          },
          byPriority: {
            high: 0,
            medium: 0,
            low: 0
          }
        };
        
        // Получаем статистику по статусам
        db.all(statusQuery, [userId, userId], (err, statusRows) => {
          if (err) {
            return reject(err);
          }
          
          // Заполняем статистику по статусам
          statusRows.forEach(row => {
            summary.byStatus[row.status] = row.count;
            summary.total += row.count;
          });
          
          // Получаем статистику по приоритетам
          db.all(priorityQuery, [userId, userId], (err, priorityRows) => {
            if (err) {
              return reject(err);
            }
            
            // Заполняем статистику по приоритетам
            priorityRows.forEach(row => {
              summary.byPriority[row.priority] = row.count;
            });
            
            resolve(summary);
          });
        });
      });
    });
  },
  
  // Получить сводную статистику по задачам для всех пользователей
  getSummaryAll: () => {
    return new Promise((resolve, reject) => {
      // SQL запрос для получения статистики по статусам
      const statusQuery = `
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
      `;
      
      // SQL запрос для получения статистики по приоритетам
      const priorityQuery = `
        SELECT priority, COUNT(*) as count 
        FROM tasks 
        GROUP BY priority
      `;
      
      // Начинаем транзакцию для выполнения нескольких запросов
      db.serialize(() => {
        let summary = {
          total: 0,
          byStatus: {
            pending: 0,
            'in-progress': 0,
            completed: 0
          },
          byPriority: {
            high: 0,
            medium: 0,
            low: 0
          }
        };
        
        // Получаем статистику по статусам
        db.all(statusQuery, [], (err, statusRows) => {
          if (err) {
            return reject(err);
          }
          
          // Заполняем статистику по статусам
          statusRows.forEach(row => {
            summary.byStatus[row.status] = row.count;
            summary.total += row.count;
          });
          
          // Получаем статистику по приоритетам
          db.all(priorityQuery, [], (err, priorityRows) => {
            if (err) {
              return reject(err);
            }
            
            // Заполняем статистику по приоритетам
            priorityRows.forEach(row => {
              summary.byPriority[row.priority] = row.count;
            });
            
            resolve(summary);
          });
        });
      });
    });
  },
};

module.exports = Task;