const { db } = require('../config/db');

const UserActivity = {
  // Получение активности пользователей
  getUserActivities: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          u.id as userId,
          u.name as userName,
          u.department,
          u.position,
          MAX(a.created_at) as lastLogin,
          COUNT(a.id) as actionsCount
        FROM users u
        LEFT JOIN activities a ON u.id = a.user_id
        GROUP BY u.id
        ORDER BY lastLogin DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Error in getUserActivities:', err);
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  },
  
  // Получение активности конкретного пользователя
  getUserActivity: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          a.*,
          u.name as user_name
        FROM activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          console.error('Error in getUserActivity:', err);
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  },
  
  // Создание записи активности
  createActivity: (activityData) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO activities (
          user_id,
          user_name,
          user_avatar,
          action,
          target,
          target_type,
          details
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        activityData.userId,
        activityData.userName,
        activityData.userAvatar || null,
        activityData.action,
        activityData.target,
        activityData.targetType || null,
        activityData.details ? JSON.stringify(activityData.details) : null
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Error inserting activity:', err);
          return reject(err);
        }
        resolve({ id: this.lastID, ...activityData });
      });
    });
  }
};

module.exports = UserActivity; 