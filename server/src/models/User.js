const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = {
  // Получить всех пользователей
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, createdAt, updatedAt FROM users', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Найти пользователя по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },
  
  // Найти пользователя по email (без пароля)
  findOne: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },
  
  // Найти пользователя по email (с паролем для проверки)
  findOneWithPassword: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },
  
  // Создать нового пользователя
  create: async (userData) => {
    const { name, email, password, role = 'user' } = userData;
    
    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name, email, password, role) 
                   VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [name, email, hashedPassword, role], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получаем созданного пользователя (без пароля)
        User.findById(this.lastID)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  },
  
  // Обновить пользователя
  update: async (id, userData) => {
    const { name, email, password, role } = userData;
    
    let hashedPassword;
    if (password) {
      // Если обновляется пароль, хэшируем его
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    return new Promise((resolve, reject) => {
      let sql, params;
      
      if (password) {
        // Обновляем все поля включая пароль
        sql = `UPDATE users 
               SET name = ?, email = ?, password = ?, role = ?, updatedAt = CURRENT_TIMESTAMP 
               WHERE id = ?`;
        params = [name, email, hashedPassword, role, id];
      } else {
        // Обновляем только имя, email и роль
        sql = `UPDATE users 
               SET name = ?, email = ?, role = ?, updatedAt = CURRENT_TIMESTAMP 
               WHERE id = ?`;
        params = [name, email, role, id];
      }
      
      db.run(sql, params, function(err) {
        if (err) {
          return reject(err);
        }
        
        if (this.changes === 0) {
          return resolve(null); // Пользователь не найден
        }
        
        // Получаем обновленного пользователя
        User.findById(id)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  },
  
  // Удалить пользователя
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        
        resolve({ id, deleted: this.changes > 0 });
      });
    });
  },
  
  // Проверка соответствия пароля
  matchPassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },
  
  // Создание JWT токена
  getSignedJwtToken: (userId) => {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'secret_key123',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  },
  
  // Получение статистики пользователя
  getUserStats: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM tasks WHERE userId = ?) as totalTasks,
          (SELECT COUNT(*) FROM tasks WHERE userId = ? AND status = 'completed') as completedTasks,
          (SELECT COUNT(*) FROM tasks WHERE userId = ? AND status = 'in_progress') as inProgressTasks,
          (SELECT COUNT(*) FROM tasks WHERE userId = ? AND status = 'pending') as pendingTasks
      `;
      
      db.get(sql, [userId, userId, userId, userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },

  // Получение активности пользователя
  getUserActivity: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          t.createdAt as date,
          COUNT(*) as activityCount
        FROM tasks t
        WHERE t.userId = ?
        GROUP BY date(t.createdAt)
        ORDER BY date DESC
        LIMIT 7
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
};

module.exports = User; 