const express = require('express');

const medicalHistoryController = require('../controllers/medicalHistory.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/me/medical-history',
  authMiddleware,
  roleMiddleware(['student']),
  medicalHistoryController.getMyMedicalHistory
);

router.get(
  '/:id/medical-history',
  authMiddleware,
  roleMiddleware([
    'clinic_staff',
    'clinic_admin',
    'supervisor',
    'student_affairs',
    'super_admin',
  ]),
  medicalHistoryController.getStudentMedicalHistory
);

module.exports = router;medicalHistory.routes