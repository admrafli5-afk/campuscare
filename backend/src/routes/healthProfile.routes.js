const express = require('express');
const router = express.Router();
const { getMyHealthProfile, updateMyHealthProfile } = require('../controllers/healthProfile.controller');
const { protect } = require('../middleware/auth.middleware'); // Sesuaikan path middleware auth Anda

// Semua rute di bawah ini wajib login
router.use(protect);

router.route('/me')
    .get(getMyHealthProfile)
    .put(updateMyHealthProfile);

module.exports = router;