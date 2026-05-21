const express = require('express');

const medicineController = require('../controllers/medicine.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicineController.getMedicines
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  medicineController.createMedicine
);

router.get(
  '/low-stock',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicineController.getLowStockMedicines
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicineController.getMedicineById
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  medicineController.updateMedicine
);

router.patch(
  '/:id/stock',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  medicineController.updateMedicineStock
);

router.get(
  '/:id/logs',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  medicineController.getMedicineStockLogs
);

module.exports = router;