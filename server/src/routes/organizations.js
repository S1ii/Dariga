const express = require('express');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  searchOrganizations,
  getOrganizationsByStatus
} = require('../controllers/organizations');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Защищаем все маршруты
router.use(protect);

// Маршруты с параметрами должны идти перед маршрутами с динамическими параметрами
router.route('/search/:query')
  .get(searchOrganizations);

router.route('/status/:status')
  .get(getOrganizationsByStatus);

router.route('/')
  .get(getOrganizations)
  .post(createOrganization);

router.route('/:id')
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

module.exports = router; 