const { db } = require('../config/db');

const SystemLog = {
  // Получение всех системных логов
  getLogs: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          l.*,
          u.name as user_name
        FROM system_logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.level) {
        sql += ' AND l.level = ?';
        params.push(filters.level);
      }
      
      if (filters.source) {
        sql += ' AND l.source = ?';
        params.push(filters.source);
      }
      
      if (filters.startDate) {
        sql += ' AND l.created_at >= ?';
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        sql += ' AND l.created_at <= ?';
        params.push(filters.endDate);
      }
      
      sql += ' ORDER BY l.created_at DESC';
      
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error in getLogs:', err);
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  },
  
  // Создание системного лога
  createLog: (logData) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO system_logs (
          level,
          message,
          source,
          details,
          user_id
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        logData.level,
        logData.message,
        logData.source || null,
        logData.details ? JSON.stringify(logData.details) : null,
        logData.userId || null
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error inserting system log:', err);
          return reject(err);
        }
        resolve({ id: this.lastID, ...logData });
      });
    });
  },
  
  // Очистка логов
  clearLogs: (options = {}) => {
    return new Promise((resolve, reject) => {
      let sql = 'DELETE FROM system_logs WHERE 1=1';
      const params = [];
      
      if (options.level) {
        sql += ' AND level = ?';
        params.push(options.level);
      }
      
      if (options.olderThan) {
        sql += ' AND created_at < ?';
        params.push(options.olderThan);
      }
      
      db.run(sql, params, function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ affected: this.changes });
      });
    });
  }
};

module.exports = SystemLog; 