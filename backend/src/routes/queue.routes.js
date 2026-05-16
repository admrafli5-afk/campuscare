const express = require('express');

const queueController = require('../controllers/queue.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/public-status', queueController.getPublicQueueStatus);

router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['student']),
  queueController.registerQueue
);

router.get(
  '/my-current',
  authMiddleware,
  roleMiddleware(['student']),
  queueController.getMyCurrentQueue
);

router.get(
  '/today',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  queueController.getTodayQueues
);

router.post(
  '/check-in',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  queueController.checkInQueue
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  queueController.updateQueueStatus
);

module.exports = router;