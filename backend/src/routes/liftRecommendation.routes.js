const express = require('express');

const liftRecommendationController = require('../controllers/liftRecommendation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.createLiftRecommendation
);

router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  liftRecommendationController.getMyLiftRecommendations
);

router.get(
  '/student/:student_id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.getLiftRecommendationsByStudent
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
  liftRecommendationController.getLiftRecommendationById
);

router.patch(
  '/:id/submit',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.submitLiftRecommendation
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.approveLiftRecommendation
);

router.patch(
  '/:id/reject',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.rejectLiftRecommendation
);

module.exports = router;