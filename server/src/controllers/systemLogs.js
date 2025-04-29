const { db } = require('../config/db');

// @desc    Get user engagement metrics
// @route   GET /api/admin/analytics/engagement
// @access  Private/Admin
exports.getUserEngagement = async (req, res, next) => {
  try {
    console.log('Getting user engagement metrics');
    
    const metrics = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          strftime('%Y-%m-%d', u.createdAt) as date,
          COUNT(*) as newUsers,
          (SELECT COUNT(*) FROM tasks WHERE strftime('%Y-%m-%d', createdAt) = strftime('%Y-%m-%d', u.createdAt)) as tasksCreated
        FROM users u
        GROUP BY strftime('%Y-%m-%d', u.createdAt)
        ORDER BY date DESC
        LIMIT 30
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Error fetching engagement metrics:', err);
          return reject(err);
        }
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    console.error('Analytics error:', err);
    next(err);
  }
};

// @desc    Get productivity metrics
// @route   GET /api/admin/analytics/productivity
// @access  Private/Admin
exports.getProductivityMetrics = async (req, res, next) => {
  try {
    const metrics = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          u.id as userId,
          u.name as userName,
          COUNT(t.id) as totalTasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
          ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(t.id), 2) as completionRate,
          ROUND(AVG(julianday(CASE WHEN t.status = 'completed' THEN t.updatedAt ELSE NULL END) - julianday(t.createdAt)), 2) as avgCompletionDays
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY completionRate DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get time series metrics for user/task growth
// @route   GET /api/admin/analytics/growth
// @access  Private/Admin
exports.getGrowthMetrics = async (req, res, next) => {
  try {
    const period = req.query.period || 'monthly';
    let timeFormat;
    
    switch(period) {
      case 'daily':
        timeFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        timeFormat = '%Y-%W';
        break;
      case 'monthly':
      default:
        timeFormat = '%Y-%m';
    }
    
    const metrics = await new Promise((resolve, reject) => {
      const sql = `
        WITH dates AS (
          SELECT strftime('${timeFormat}', createdAt) as period FROM users
          UNION
          SELECT strftime('${timeFormat}', createdAt) as period FROM tasks
          UNION
          SELECT strftime('${timeFormat}', createdAt) as period FROM clients
          UNION
          SELECT strftime('${timeFormat}', createdAt) as period FROM organizations
        )
        SELECT 
          d.period,
          (SELECT COUNT(*) FROM users WHERE strftime('${timeFormat}', createdAt) = d.period) as newUsers,
          (SELECT COUNT(*) FROM tasks WHERE strftime('${timeFormat}', createdAt) = d.period) as newTasks,
          (SELECT COUNT(*) FROM clients WHERE strftime('${timeFormat}', createdAt) = d.period) as newClients,
          (SELECT COUNT(*) FROM organizations WHERE strftime('${timeFormat}', createdAt) = d.period) as newOrganizations
        FROM dates d
        GROUP BY d.period
        ORDER BY d.period DESC
        LIMIT 24
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user retention metrics
// @route   GET /api/admin/analytics/retention
// @access  Private/Admin
exports.getRetentionMetrics = async (req, res, next) => {
  try {
    const retentionData = await new Promise((resolve, reject) => {
      // Find users who have created tasks in different time periods
      const sql = `
        WITH 
        cohort AS (
          SELECT 
            u.id,
            u.name,
            strftime('%Y-%m', u.createdAt) as join_month
          FROM users u
        ),
        user_activity AS (
          SELECT 
            t.user_id,
            strftime('%Y-%m', t.createdAt) as activity_month
          FROM tasks t
          GROUP BY t.user_id, activity_month
        )
        SELECT 
          c.join_month,
          COUNT(DISTINCT c.id) as cohort_size,
          a.activity_month,
          COUNT(DISTINCT a.user_id) as active_users,
          ROUND(COUNT(DISTINCT a.user_id) * 100.0 / COUNT(DISTINCT c.id), 2) as retention_rate
        FROM cohort c
        LEFT JOIN user_activity a ON c.id = a.user_id AND a.activity_month >= c.join_month
        GROUP BY c.join_month, a.activity_month
        ORDER BY c.join_month DESC, a.activity_month ASC
        LIMIT 100
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        
        // Process the raw data into cohort analysis format
        const cohorts = {};
        rows.forEach(row => {
          if (!cohorts[row.join_month]) {
            cohorts[row.join_month] = {
              cohort_size: row.cohort_size,
              retention: []
            };
          }
          
          if (row.activity_month) {
            cohorts[row.join_month].retention.push({
              activity_month: row.activity_month,
              active_users: row.active_users,
              retention_rate: row.retention_rate
            });
          }
        });
        
        resolve(cohorts);
      });
    });

    res.status(200).json({
      success: true,
      data: retentionData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get service utilization metrics
// @route   GET /api/admin/analytics/services
// @access  Private/Admin
exports.getServiceUtilization = async (req, res, next) => {
  try {
    const serviceData = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          s.name as service_name,
          s.category,
          COUNT(t.id) as usage_count,
          COUNT(DISTINCT t.client_id) as client_count,
          COUNT(DISTINCT t.user_id) as user_count,
          ROUND(AVG(t.priority = 'high'), 2) as high_priority_ratio
        FROM services s
        LEFT JOIN tasks t ON t.title LIKE '%' || s.name || '%' OR t.description LIKE '%' || s.name || '%'
        GROUP BY s.id
        ORDER BY usage_count DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

    res.status(200).json({
      success: true,
      data: serviceData
    });
  } catch (err) {
    next(err);
  }
}; 