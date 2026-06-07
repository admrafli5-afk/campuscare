const express = require('express');

const auditLogController = require('../controllers/auditLog.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  auditLogController.getAuditLogs
);

module.exports = router;