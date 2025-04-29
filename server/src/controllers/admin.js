const User = require('../models/User');
const { db } = require('../config/db');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Create user with provided password
    const user = await User.create({
      name,
      email,
      role,
      password
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const updatedUser = await User.update(userId, {
      name,
      email,
      role
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await User.delete(userId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    console.log('GetSystemStats called');
    
    const stats = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') as totalAdmins,
          (SELECT COUNT(*) FROM tasks) as totalTasks,
          (SELECT COUNT(*) FROM organizations) as totalOrganizations,
          (SELECT COUNT(*) FROM tasks WHERE status = 'completed') as completedTasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'in-progress') as inProgressTasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'pending') as pendingTasks,
          (SELECT COUNT(*) FROM services) as services,
          (SELECT COUNT(*) FROM users) as activeUsers
      `;
      
      db.get(sql, [], (err, row) => {
        if (err) {
          console.error('SQL error:', err);
          return reject(err);
        }
        console.log('Stats results:', row);
        resolve(row);
      });
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Stats error:', err);
    next(err);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/:id/stats
// @access  Private/Admin
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const stats = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM tasks WHERE user_id = ?) as totalTasks,
          (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'completed') as completedTasks,
          (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'in-progress') as inProgressTasks,
          (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'pending') as pendingTasks
      `;
      
      db.get(sql, [userId, userId, userId, userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
    
    const activity = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          date(t.createdAt) as date,
          COUNT(*) as activityCount
        FROM tasks t
        WHERE t.user_id = ?
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

    res.status(200).json({
      success: true,
      data: {
        stats,
        activity
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system activity
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getSystemActivity = async (req, res, next) => {
  try {
    console.log('GetSystemActivity called');
    
    const activity = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          date(t.createdAt) as date,
          COUNT(*) as activityCount
        FROM tasks t
        GROUP BY date(t.createdAt)
        ORDER BY date DESC
        LIMIT 30
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('SQL error:', err);
          return reject(err);
        }
        console.log('Activity results:', rows);
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (err) {
    console.error('Activity error:', err);
    next(err);
  }
};

// @desc    Get user performance
// @route   GET /api/admin/users/performance
// @access  Private/Admin
exports.getUserPerformance = async (req, res, next) => {
  try {
    const performance = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          u.id,
          u.name,
          COUNT(t.id) as tasksCount,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
          AVG(julianday(t.completedAt) - julianday(t.createdAt)) as avgCompletionTime
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        WHERE u.role != 'admin'
        GROUP BY u.id
        ORDER BY completedTasks DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM settings LIMIT 1`;
      
      db.get(sql, [], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row || {
          siteTitle: 'CRM System',
          siteDescription: 'Управление задачами и клиентами',
          contactEmail: 'admin@example.com',
          enableRegistration: true,
          requireEmailVerification: false,
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          enableDarkMode: false,
          maintenanceMode: false
        });
      });
    });

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    // Check if settings exist
    const existingSettings = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM settings LIMIT 1', [], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    
    if (existingSettings) {
      // Update settings
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE settings SET 
           siteTitle = ?, siteDescription = ?, contactEmail = ?, 
           enableRegistration = ?, requireEmailVerification = ?, 
           sessionTimeout = ?, maxLoginAttempts = ?, 
           enableDarkMode = ?, maintenanceMode = ?`,
          [
            settings.siteTitle,
            settings.siteDescription,
            settings.contactEmail,
            settings.enableRegistration ? 1 : 0,
            settings.requireEmailVerification ? 1 : 0,
            settings.sessionTimeout,
            settings.maxLoginAttempts,
            settings.enableDarkMode ? 1 : 0,
            settings.maintenanceMode ? 1 : 0
          ],
          function(err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    } else {
      // Create settings
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO settings (
            siteTitle, siteDescription, contactEmail, 
            enableRegistration, requireEmailVerification, 
            sessionTimeout, maxLoginAttempts, 
            enableDarkMode, maintenanceMode
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            settings.siteTitle,
            settings.siteDescription,
            settings.contactEmail,
            settings.enableRegistration ? 1 : 0,
            settings.requireEmailVerification ? 1 : 0,
            settings.sessionTimeout,
            settings.maxLoginAttempts,
            settings.enableDarkMode ? 1 : 0,
            settings.maintenanceMode ? 1 : 0
          ],
          function(err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (err) {
    next(err);
  }
}; 