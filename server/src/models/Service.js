const { db } = require('../config/db');

const Service = {
  // Найти все услуги пользователя с возможностью фильтрации
  find: (filter = {}) => {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM services WHERE 1=1';
      const params = [];
      
      // Фильтр по создателю (пользователю)
      if (filter.createdBy) {
        sql += ' AND user_id = ?';
        params.push(filter.createdBy);
      }
      
      // Фильтр по категории
      if (filter.category) {
        sql += ' AND category = ?';
        params.push(filter.category);
      }
      
      // Фильтр по статусу активности
      if (filter.isActive !== undefined) {
        sql += ' AND is_active = ?';
        params.push(filter.isActive ? 1 : 0);
      }
      
      // Сортировка по имени
      sql += ' ORDER BY name ASC';
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        
        // Преобразуем результаты, чтобы совпадали с ожидаемым MongoDB форматом
        const services = rows.map(row => ({
          _id: row.id.toString(),
          name: row.name,
          description: row.description,
          price: row.price,
          currency: row.currency || 'KZT',
          duration: row.duration,
          category: row.category,
          isActive: Boolean(row.is_active),
          createdBy: row.user_id.toString(),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        }));
        
        resolve(services);
      });
    });
  },
  
  // Найти услугу по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        
        if (!row) {
          return resolve(null);
        }
        
        // Преобразуем результат, чтобы соответствовал ожидаемому MongoDB формату
        const service = {
          _id: row.id.toString(),
          name: row.name,
          description: row.description,
          price: row.price,
          currency: row.currency || 'KZT',
          duration: row.duration,
          category: row.category,
          isActive: Boolean(row.is_active),
          createdBy: row.user_id.toString(),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
        
        resolve(service);
      });
    });
  },
  
  // Создать новую услугу
  create: (serviceData) => {
    return new Promise((resolve, reject) => {
      const { name, description, price, currency, duration, category, createdBy } = serviceData;
      
      const sql = `INSERT INTO services 
                  (name, description, price, currency, duration, category, user_id, is_active) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [
        name,
        description,
        price,
        currency || 'KZT',
        duration || '',
        category || '',
        createdBy,
        1 // isActive = true по умолчанию
      ], function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получаем созданную услугу
        Service.findById(this.lastID)
          .then(service => resolve(service))
          .catch(err => reject(err));
      });
    });
  },
  
  // Обновить услугу
  findByIdAndUpdate: (id, updateData, options = {}) => {
    return new Promise((resolve, reject) => {
      // Собираем данные для обновления
      const updates = [];
      const params = [];
      
      if (updateData.name !== undefined) {
        updates.push('name = ?');
        params.push(updateData.name);
      }
      
      if (updateData.description !== undefined) {
        updates.push('description = ?');
        params.push(updateData.description);
      }
      
      if (updateData.price !== undefined) {
        updates.push('price = ?');
        params.push(updateData.price);
      }
      
      if (updateData.currency !== undefined) {
        updates.push('currency = ?');
        params.push(updateData.currency);
      }
      
      if (updateData.duration !== undefined) {
        updates.push('duration = ?');
        params.push(updateData.duration);
      }
      
      if (updateData.category !== undefined) {
        updates.push('category = ?');
        params.push(updateData.category);
      }
      
      if (updateData.isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(updateData.isActive ? 1 : 0);
      }
      
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      
      // Если нет обновлений, вернуть текущую услугу
      if (updates.length === 1) {
        return Service.findById(id)
          .then(service => resolve(service))
          .catch(err => reject(err));
      }
      
      // Добавляем id в конец параметров
      params.push(id);
      
      const sql = `UPDATE services SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(sql, params, function(err) {
        if (err) {
          return reject(err);
        }
        
        // Получаем обновленную услугу
        Service.findById(id)
          .then(service => resolve(service))
          .catch(err => reject(err));
      });
    });
  },
  
  // Удалить услугу
  deleteOne: function() {
    const id = this._id;
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ success: true });
      });
    });
  }
};

module.exports = Service;