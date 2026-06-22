const express = require('express');
const router = express.Router();

const liftRecommendationController = require('../controllers/liftRecommendation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ==========================================
// RUTE STATIS (Wajib di Atas Rute Dinamis :id)
// ==========================================

// 1. GET Semua Rekomendasi Lift untuk Tabel Dashboard Admin Web
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.getAllLiftRecommendations
);

// 2. GET Hari Ini (Untuk mencocokkan prapemanggilan frontend agar tidak crash masuk ke :id)
router.get(
  '/today',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.getAllLiftRecommendations
);

// 3. GET Rekomendasi Medis Milik Mahasiswa yang Sedang Login (Untuk Aplikasi Mobile)
router.get(
  '/me',
  authMiddleware,
  roleMiddleware(['student']),
  liftRecommendationController.getMyLiftRecommendations
);

// 4. POST Buat Rekomendasi Baru (Diizinkan untuk Mahasiswa via HP & Staf via Web Admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['student', 'clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.createLiftRecommendation
);

// ==========================================
// RUTE DINAMIS / PARAMETER KATEGORI
// ==========================================

// 5. GET Daftar Rekomendasi Berdasarkan ID Mahasiswa (Untuk Riwayat Pasien di Web)
router.get(
  '/student/:student_id',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.getLiftRecommendationsByStudent
);

// 6. GET Detail Rekomendasi Berdasarkan ID Rekomendasi Utama
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['student', 'clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.getLiftRecommendationById
);

// 7. PATCH Update Status Dinamis dari Web Dashboard (Setujui, Aktifkan, Selesai, Batalkan)
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.updateLiftStatus
);

// 8. PATCH Mengajukan Validasi Rekomendasi dari Status 'draft' menjadi 'waiting_validation'
router.patch(
  '/:id/submit',
  authMiddleware,
  roleMiddleware(['clinic_staff', 'clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.submitLiftRecommendation
);

// 9. PATCH Menyetujui Rekomendasi Lift (Akses Khusus Tingkat Admin/Supervisor)
router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.approveLiftRecommendation
);

// 10. PATCH Menolak Validasi Rekomendasi Lift (Akses Khusus Tingkat Admin/Supervisor)
router.patch(
  '/:id/reject',
  authMiddleware,
  roleMiddleware(['clinic_admin', 'supervisor', 'super_admin']),
  liftRecommendationController.rejectLiftRecommendation
);

module.exports = router;