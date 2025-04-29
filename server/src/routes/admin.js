const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  getUserStats,
  getSystemActivity,
  getUserPerformance,
  getSettings,
  updateSettings
} = require('../controllers/admin');
const {
  getProductivityMetrics,
  getServiceUtilization
} = require('../controllers/systemLogs');
const {
  getUserActivities,
  getUserActivityById,
  createUserActivity
} = require('../controllers/userActivity');

const router = express.Router();

// Protect all routes and authorize only admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/users')
  .get(activityLogger('view', 'users'), getUsers)
  .post(activityLogger('create', 'user'), createUser);

// Performance route - должен быть до route с :id для избежания конфликта
router.get('/users/performance', activityLogger('view', 'user-performance'), getUserPerformance);

// User specific routes
router.route('/users/:id')
  .put(activityLogger('update', 'user'), updateUser)
  .delete(activityLogger('delete', 'user'), deleteUser);

router.get('/users/:id/stats', activityLogger('view', 'user-stats'), getUserStats);

// Statistics routes
router.get('/stats', activityLogger('view', 'system-stats'), getSystemStats);
router.get('/activity', activityLogger('view', 'system-activity'), getSystemActivity);

// User activity routes
router.get('/user-activities', activityLogger('view', 'user-activities'), getUserActivities);
router.get('/users/:id/activity', activityLogger('view', 'user-activity'), getUserActivityById);
router.post('/activity', activityLogger('create', 'activity'), createUserActivity);

// Analytics routes
router.get('/analytics/productivity', activityLogger('view', 'analytics-productivity'), getProductivityMetrics);
router.get('/analytics/services', activityLogger('view', 'analytics-services'), getServiceUtilization);

// Settings routes
router.route('/settings')
  .get(activityLogger('view', 'settings'), getSettings)
  .put(activityLogger('update', 'settings'), updateSettings);

module.exports = router; 