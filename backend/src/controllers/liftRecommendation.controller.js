const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { generateLiftRecommendationNumber, getDefaultLiftRecommendationText } = require('../services/liftRecommendation.service');

// Fungsi Utama untuk Dashboard Admin
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

async function createLiftRecommendation(req, res) {
  try {
    const { student_id, nim, health_check_id, medical_record_id, reason, medical_condition, recommendation_text, start_date, end_date, status } = req.body;
    
    if ((!student_id && !nim) || !reason || !medical_condition) {
      return errorResponse(res, 'NIM/Student ID, alasan, dan kondisi medis wajib diisi', [], 400);
    }

    let finalStudentId = student_id;
    if (nim && !finalStudentId) {
      const [studentRows] = await pool.query(`SELECT id FROM students WHERE nim = ? LIMIT 1`, [nim]);
      if (studentRows.length > 0) finalStudentId = studentRows[0].id;
    }

    if (!finalStudentId) return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);

    const recommendationNumber = await generateLiftRecommendationNumber();
    const finalRecommendationText = recommendation_text || getDefaultLiftRecommendationText();
    const finalStatus = status || 'draft'; 

    const [result] = await pool.query(
      `INSERT INTO lift_recommendations (recommendation_number, student_id, health_check_id, medical_record_id, created_by, reason, medical_condition, recommendation_text, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recommendationNumber, finalStudentId, health_check_id || null, medical_record_id || null, req.user.id, reason, medical_condition, finalRecommendationText, start_date || null, end_date || null, finalStatus]
    );

    return successResponse(res, 'Rekomendasi berhasil dibuat', { id: result.insertId, status: finalStatus }, 201);
  } catch (error) {
    return errorResponse(res, 'Gagal membuat rekomendasi', [error.message], 500);
  }
}

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

async function getMyLiftRecommendations(req, res) { 
    try {
    const [sRows] = await pool.query(`SELECT id FROM students WHERE user_id = ? LIMIT 1`, [req.user.id]);
    if (sRows.length === 0) return errorResponse(res, 'Mahasiswa tidak ditemukan', [], 404);
    const [rows] = await pool.query(`SELECT * FROM lift_recommendations WHERE student_id = ? ORDER BY created_at DESC`, [sRows[0].id]);
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

// INI BAGIAN PALING PENTING YANG BIKIN ERROR "MUST BE A FUNCTION"
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