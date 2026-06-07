const express = require("express");

const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.get(
  "/clinic",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ]),
  dashboardController.getClinicDashboard
);

// PUBLIC untuk mobile, tidak perlu token
router.get(
  "/clinic/status",
  dashboardController.getClinicStatus
);

router.patch(
  "/clinic/status",
  authMiddleware,
  roleMiddleware([
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ]),
  dashboardController.updateClinicStatus
);

module.exports = router;