const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Jika Anda menggunakan file service, pastikan baris ini tidak error. 
// Jika sebelumnya tidak pakai service, Anda bisa menyesuaikan.
const { generateLiftRecommendationNumber, getDefaultLiftRecommendationText } = require('../services/liftRecommendation.service');

// === 1. FUNGSI UNTUK MENGAMBIL SEMUA DATA (DASHBOARD ADMIN) ===
async function getAllLiftRecommendations(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        lr.*,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM lift_recommendations lr
       JOIN students s ON lr.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       ORDER BY lr.created_at DESC`
    );
    return successResponse(res, 'Semua data rekomendasi lift berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil data rekomendasi lift', [error.message], 500);
  }
}

// === 2. FUNGSI UPDATE STATUS ===
async function updateLiftStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [rows] = await pool.query(`SELECT id FROM lift_recommendations WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return errorResponse(res, 'Rekomendasi lift tidak ditemukan', [], 404);

    await pool.query(`UPDATE lift_recommendations SET status = ? WHERE id = ?`, [status, id]);
    return successResponse(res, 'Status berhasil diperbarui', { id: Number(id), status });
  } catch (error) {
    return errorResponse(res, 'Gagal update status lift', [error.message], 500);
  }
}

// === 3. FUNGSI CREATE (DENGAN AUTO-CREATE PROFILE UNTUK MENCEGAH 404) ===
async function createLiftRecommendation(req, res) {
  try {
    const { student_id, nim, reason, medical_condition, start_date, end_date, status } = req.body;
    
    if (!reason || !medical_condition) {
      return errorResponse(res, 'Alasan dan kondisi medis wajib diisi', [], 400);
    }

    let finalStudentId = student_id;

    // JIKA YANG MENGAJUKAN ADALAH MAHASISWA (DARI HP)
    if (req.user.role === 'student') {
      const [studentRows] = await pool.query(`SELECT id FROM students WHERE user_id = ? LIMIT 1`, [req.user.id]);
      
      if (studentRows.length > 0) {
        finalStudentId = studentRows[0].id;
      } else {
        // [SUPER FIX] Jika profil student belum ada di DB, buatkan secara otomatis agar tidak 404!
        const randomNim = 'AUTO-' + Math.floor(Math.random() * 10000);
        const [newStudent] = await pool.query(
          `INSERT INTO students (user_id, nim, study_program) VALUES (?, ?, 'Sistem Informasi')`,
          [req.user.id, randomNim]
        );
        finalStudentId = newStudent.insertId;
        console.log(`[INFO] Profil student otomatis dibuat dengan ID: ${finalStudentId}`);
      }
    } 
    // JIKA YANG MENGAJUKAN ADALAH ADMIN/STAF (DARI WEB)
    else if (nim && !finalStudentId) {
      const [studentRows] = await pool.query(`SELECT id FROM students WHERE nim = ? LIMIT 1`, [nim]);
      if (studentRows.length > 0) {
        finalStudentId = studentRows[0].id;
      }
    }

    // Jika admin salah masukin NIM
    if (!finalStudentId) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan berdasarkan NIM tersebut', [], 404);
    }

    // Eksekusi Pembuatan Lift
    const recommendationNumber = await generateLiftRecommendationNumber();
    const finalRecommendationText = getDefaultLiftRecommendationText ? getDefaultLiftRecommendationText() : 'Rekomendasi Lift';
    const finalStatus = status || 'draft'; 

    const [result] = await pool.query(
      `INSERT INTO lift_recommendations 
       (recommendation_number, student_id, created_by, reason, medical_condition, recommendation_text, start_date, end_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recommendationNumber, finalStudentId, req.user.id, reason, medical_condition, finalRecommendationText, start_date || null, end_date || null, finalStatus
      ]
    );

    return successResponse(res, 'Rekomendasi berhasil dibuat', { id: result.insertId, status: finalStatus }, 201);
  } catch (error) {
    console.error("Error saat create:", error);
    return errorResponse(res, 'Gagal membuat rekomendasi', [error.message], 500);
  }
}

// === 4. FUNGSI GET DATA MILIK MAHASISWA (DENGAN ANTI 404) ===
async function getMyLiftRecommendations(req, res) { 
  try {
    const [sRows] = await pool.query(`SELECT id FROM students WHERE user_id = ? LIMIT 1`, [req.user.id]);
    
    // [SUPER FIX] Jika mahasiswa belum punya profil, kembalikan array kosong, JANGAN 404.
    if (sRows.length === 0) {
      return successResponse(res, 'Belum ada data', []);
    }

    const [rows] = await pool.query(`SELECT * FROM lift_recommendations WHERE student_id = ? ORDER BY created_at DESC`, [sRows[0].id]);
    return successResponse(res, 'Berhasil', rows);
  } catch (error) { 
    return errorResponse(res, 'Gagal', [error.message], 500); 
  }
}

// === FUNGSI BAWAAN LAINNYA ===
async function getLiftRecommendationById(req, res) { 
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT lr.*, student_user.name AS student_name, s.nim, s.study_program, s.class_name, s.room, creator.name AS created_by_name, approver.name AS approved_by_name FROM lift_recommendations lr JOIN students s ON lr.student_id = s.id JOIN users student_user ON s.user_id = student_user.id JOIN users creator ON lr.created_by = creator.id LEFT JOIN users approver ON lr.approved_by = approver.id WHERE lr.id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return errorResponse(res, 'Data tidak ditemukan', [], 404);
    return successResponse(res, 'Detail berhasil diambil', rows[0]);
  } catch (error) { return errorResponse(res, 'Gagal', [error.message], 500); }
}

async function getLiftRecommendationsByStudent(req, res) { 
  try {
    const { student_id } = req.params;
    const [rows] = await pool.query(`SELECT lr.*, creator.name AS created_by_name, approver.name AS approved_by_name FROM lift_recommendations lr JOIN users creator ON lr.created_by = creator.id LEFT JOIN users approver ON lr.approved_by = approver.id WHERE lr.student_id = ? ORDER BY lr.created_at DESC`, [student_id]);
    return successResponse(res, 'Berhasil', rows);
  } catch (error) { return errorResponse(res, 'Gagal', [error.message], 500); }
}

async function submitLiftRecommendation(req, res) { 
  try {
    const { id } = req.params;
    await pool.query(`UPDATE lift_recommendations SET status = 'waiting_validation' WHERE id = ?`, [id]);
    return successResponse(res, 'Berhasil', {id: Number(id)});
  } catch (error) { return errorResponse(res, 'Gagal', [error.message], 500); }
}

async function approveLiftRecommendation(req, res) { 
  try {
    const { id } = req.params;
    await pool.query(`UPDATE lift_recommendations SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?`, [req.user.id, id]);
    return successResponse(res, 'Berhasil', {id: Number(id)});
  } catch (error) { return errorResponse(res, 'Gagal', [error.message], 500); }
}

async function rejectLiftRecommendation(req, res) { 
  try {
    const { id } = req.params;
    await pool.query(`UPDATE lift_recommendations SET status = 'rejected', approved_by = ?, rejection_reason = ? WHERE id = ?`, [req.user.id, req.body.rejection_reason, id]);
    return successResponse(res, 'Berhasil', {id: Number(id)});
  } catch (error) { return errorResponse(res, 'Gagal', [error.message], 500); }
}

module.exports = {
  getAllLiftRecommendations, 
  updateLiftStatus, 
  createLiftRecommendation,
  getLiftRecommendationById,
  getLiftRecommendationsByStudent,
  getMyLiftRecommendations,
  submitLiftRecommendation,
  approveLiftRecommendation,
  rejectLiftRecommendation,
};