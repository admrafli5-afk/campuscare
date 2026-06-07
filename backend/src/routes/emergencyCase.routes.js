const express = require("express");

const emergencyCaseController = require("../controllers/emergencyCase.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ]),
  emergencyCaseController.createEmergencyCase
);

router.get(
  "/today",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "student_affairs",
    "super_admin",
  ]),
  emergencyCaseController.getTodayEmergencyCases
);

router.patch(
  "/:id/identity",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ]),
  emergencyCaseController.updateEmergencyIdentity
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ]),
  emergencyCaseController.updateEmergencyStatus
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "student_affairs",
    "super_admin",
  ]),
  emergencyCaseController.getEmergencyCaseById
);

module.exports = router;