const { db } = require('../config/db');

// Simplified middleware for logging important user activities
const activityLogger = (action, target) => {
  return (req, res, next) => {
    // Save original res.json method
    const originalJson = res.json;
    
    // Override res.json to log activity on successful responses
    res.json = function(data) {
      // Restore original method
      res.json = originalJson;
      
      // Log activity only on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          // Store activity data directly in the database
          const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
          const timestamp = new Date().toISOString();
          
          // Create a record of the user's activity for analytics
          db.run(
            `INSERT INTO user_activity_tracking (
              user_id, user_name, action, target, 
              method, path, timestamp, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
            [
              req.user.id,
              req.user.name,
              action,
              target,
              req.method,
              req.path, 
              ipAddress
            ],
            (err) => {
              if (err) {
                console.error('Error logging user activity:', err);
              }
            }
          );
          
          // Track feature usage for analytics
          if (['view', 'create', 'update', 'delete'].includes(action)) {
            db.run(
              `INSERT INTO feature_usage (
                feature, action, user_id, timestamp
              ) VALUES (?, ?, ?, datetime('now'))`,
              [target, action, req.user.id],
              (err) => {
                if (err) {
                  console.error('Error logging feature usage:', err);
                }
              }
            );
          }
        } catch (err) {
          console.error('Error in activity logger middleware:', err);
        }
      }
      
      // Call original method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Create required tables if they don't exist
db.serialize(() => {
  // Table for tracking user activity
  db.run(`CREATE TABLE IF NOT EXISTS user_activity_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Table for tracking feature usage
  db.run(`CREATE TABLE IF NOT EXISTS feature_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
});

module.exports = activityLogger; 