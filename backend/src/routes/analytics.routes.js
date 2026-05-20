const express = require('express');

const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware([
    'clinic_staff',
    'clinic_admin',
    'supervisor',
    'student_affairs',
    'super_admin',
  ]),
  analyticsController.getDashboardAnalytics
);

module.exports = router;