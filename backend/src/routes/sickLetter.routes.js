const express = require('express');

const sickLetterController = require('../controllers/sickLetter.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  sickLetterController.createSickLetter
);

router.patch(
  '/:id/submit-validation',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  sickLetterController.submitValidation
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  sickLetterController.approveSickLetter
);

router.patch(
  '/:id/reject',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  sickLetterController.rejectSickLetter
);

router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  sickLetterController.getMySickLetters
);

router.get(
  '/student-affairs',
  authMiddleware,
  roleMiddleware(['student_affairs', 'super_admin']),
  sickLetterController.getStudentAffairsSickLetters
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['student', 'clinic_staff', 'clinic_admin', 'supervisor', 'student_affairs', 'super_admin']),
  sickLetterController.getSickLetterById
);

module.exports = router;