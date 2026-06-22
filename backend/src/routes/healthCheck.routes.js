const express = require("express");

const healthCheckController = require("../controllers/healthCheck.controller");
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
  healthCheckController.createHealthCheck
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "student_affairs",
    "super_admin",
  ]),
  healthCheckController.getAllHealthChecks
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "student_affairs",
    "super_admin",
  ]),
  healthCheckController.getAllHealthChecks
);
router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  healthCheckController.getMyHealthChecks
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
  healthCheckController.getHealthCheckById
);

module.exports = router;