const { db } = require('../config/db');

const Organization = {
  // Получить все организации
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM organizations ORDER BY name', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Получить организации пользователя
  findByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM organizations WHERE user_id = ? ORDER BY name', [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Найти организацию по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM organizations WHERE id = ?', [id], (err, row) => {
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
  
  // Создать новую организацию
  create: (orgData) => {
    return new Promise((resolve, reject) => {
      const { name, address, contactPerson, phone, email, status, type, industry, employees, user_id } = orgData;
      
      const sql = `INSERT INTO organizations (name, address, contactPerson, phone, email, status, type, industry, employees, user_id) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [
        name, 
        address, 
        contactPerson, 
        phone, 
        email, 
        status || 'active',
        type || 'ООО',
        industry || '',
        employees || 0,
        user_id
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получить созданную организацию
        Organization.findById(this.lastID)
          .then(org => resolve(org))
          .catch(err => reject(err));
      });
    });
  },
  
  // Обновить организацию
  update: (id, orgData) => {
    return new Promise((resolve, reject) => {
      const { name, address, contactPerson, phone, email, status, type, industry, employees } = orgData;
      
      const sql = `UPDATE organizations 
                   SET name = ?, address = ?, contactPerson = ?, phone = ?, email = ?, status = ?,
                       type = ?, industry = ?, employees = ?, updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;
      
      db.run(sql, [
        name, 
        address, 
        contactPerson, 
        phone, 
        email, 
        status, 
        type || 'ООО',
        industry || '',
        employees || 0,
        id
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        if (this.changes === 0) {
          return resolve(null); // Организация не найдена
        }
        
        // Получить обновленную организацию
        Organization.findById(id)
          .then(org => resolve(org))
          .catch(err => reject(err));
      });
    });
  },
  
  // Удалить организацию
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM organizations WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        
        resolve({ id, deleted: this.changes > 0 });
      });
    });
  },
  
  // Найти организации по статусу
  findByStatus: (status, userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM organizations WHERE status = ? AND user_id = ? ORDER BY name', [status, userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },
  
  // Поиск организаций по названию или контактным данным
  search: (query, userId) => {
    return new Promise((resolve, reject) => {
      const searchPattern = `%${query}%`;
      const sql = `
        SELECT * FROM organizations 
        WHERE user_id = ? AND (name LIKE ? OR contactPerson LIKE ? OR email LIKE ? OR phone LIKE ?) 
        ORDER BY name
      `;
      
      db.all(sql, [userId, searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
};

module.exports = Organization; 