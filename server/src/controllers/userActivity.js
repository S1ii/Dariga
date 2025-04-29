const { db } = require('../config/db');

// @desc    Get all user activities
// @route   GET /api/admin/user-activities
// @access  Private/Admin
exports.getUserActivities = async (req, res, next) => {
  try {
    const activities = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          u.id as userId,
          u.name as userName,
          u.updatedAt as lastLogin,
          u.role,
          COUNT(a.id) as actionsCount,
          MAX(a.created_at) as lastActionAt
        FROM users u
        LEFT JOIN (
          SELECT user_id, id, created_at 
          FROM system_logs
          WHERE created_at > datetime('now', '-30 day')
        ) a ON u.id = a.user_id
        GROUP BY u.id
        ORDER BY u.updatedAt DESC`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user activity by user ID
// @route   GET /api/admin/users/:id/activity
// @access  Private/Admin
exports.getUserActivityById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, name, email, role, updatedAt as lastLogin
         FROM users
         WHERE id = ?`,
        [userId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('User not found'));
          resolve(row);
        }
      );
    });
    
    const activities = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          l.id,
          l.action as type,
          l.resource_type as resourceType,
          l.resource_id as resourceId,
          l.details as description,
          l.details,
          l.created_at as timestamp,
          l.ip_address as ipAddress
        FROM system_logs l
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT 100`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          
          const mappedActivities = rows.map(row => ({
            id: row.id,
            type: row.type || 'action',
            description: row.description || `Action on ${row.resourceType}`,
            details: row.details,
            timestamp: row.timestamp,
            ipAddress: row.ipAddress
          }));
          
          resolve(mappedActivities || []);
        }
      );
    });
    
    // Get activity summary by date
    const summary = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          date(created_at) as date, 
          COUNT(*) as count
        FROM system_logs
        WHERE user_id = ?
        GROUP BY date(created_at)
        ORDER BY date DESC
        LIMIT 30`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        activities,
        summary
      }
    });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(err);
  }
};

// @desc    Create user activity log
// @route   POST /api/admin/activity
// @access  Private/Admin
exports.createUserActivity = async (req, res, next) => {
  try {
    const { userId, action, resourceType, resourceId, details } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO system_logs (user_id, action, resource_type, resource_id, details, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [userId, action, resourceType, resourceId, details, ipAddress],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        userId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}; 