const express = require('express');
const medicalRecordController = require('../controllers/medicalRecord.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// RUTE MOBILE MAHASISWA (Wajib di atas)
router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  medicalRecordController.getMyMedicalRecords
);

// RUTE WEB KLINIK
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicalRecordController.createMedicalRecord
);

router.get(
  '/student/:student_id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicalRecordController.getMedicalRecordsByStudent
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin', ]),
  medicalRecordController.getMedicalRecordById
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicalRecordController.updateMedicalRecord
);

module.exports = router;