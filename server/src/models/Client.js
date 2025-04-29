const { db } = require('../config/db');

const Client = {
  // Получить всех клиентов
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clients ORDER BY name', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Получить клиентов пользователя
  findByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clients WHERE user_id = ? ORDER BY name', [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Найти клиента по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
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
  
  // Создать нового клиента
  create: (clientData) => {
    return new Promise((resolve, reject) => {
      const { name, email, phone, address, notes, user_id } = clientData;
      
      const sql = `INSERT INTO clients (name, email, phone, address, notes, user_id) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [name, email, phone, address, notes, user_id], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получить созданного клиента
        Client.findById(this.lastID)
          .then(client => resolve(client))
          .catch(err => reject(err));
      });
    });
  },
  
  // Обновить клиента
  update: (id, clientData) => {
    return new Promise((resolve, reject) => {
      const { name, email, phone, address, notes } = clientData;
      
      const sql = `UPDATE clients 
                   SET name = ?, email = ?, phone = ?, address = ?, notes = ?,
                       updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;
      
      db.run(sql, [name, email, phone, address, notes, id], function(err) {
        if (err) {
          return reject(err);
        }
        
        if (this.changes === 0) {
          return resolve(null); // Клиент не найден
        }
        
        // Получить обновленного клиента
        Client.findById(id)
          .then(client => resolve(client))
          .catch(err => reject(err));
      });
    });
  },
  
  // Удалить клиента
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        
        resolve({ id, deleted: this.changes > 0 });
      });
    });
  },
  
  // Поиск клиентов по имени или email
  search: (query, userId) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${query}%`;
      const sql = `
        SELECT * FROM clients 
        WHERE user_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) 
        ORDER BY name
      `;
      
      db.all(sql, [userId, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  // Поиск клиентов по имени или email (глобально)
  searchAll: (query) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${query}%`;
      const sql = `
        SELECT * FROM clients 
        WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ?) 
        ORDER BY name
      `;
      
      db.all(sql, [searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
};

module.exports = Client;