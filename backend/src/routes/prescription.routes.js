const express = require('express');

const prescriptionController = require('../controllers/prescription.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  prescriptionController.createPrescription
);

router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  prescriptionController.getMyPrescriptions
);

router.get(
  '/student/:student_id',
  authMiddleware,
  roleMiddleware([
    'clinic_staff',
    'clinic_admin',
    'supervisor',
    'super_admin',
  ]),
  prescriptionController.getPrescriptionsByStudent
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware([
    'student',
    'clinic_staff',
    'clinic_admin',
    'supervisor',
    'super_admin',
  ]),
  prescriptionController.getPrescriptionById
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  prescriptionController.cancelPrescription
);

module.exports = router;