const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { createAuditLog, getRequestMeta } = require('../services/auditLog.service');

async function createMedicalRecord(req, res) {
  try {
    const {
      student_id, queue_id, health_check_id, subjective, objective,
      assessment, plan, diagnosis, treatment, doctor_notes, status,
    } = req.body;

    if (!student_id || !subjective || !objective || !assessment || !plan) {
      return errorResponse(res, 'Wajib isi: student_id, subjective, objective, assessment, plan', [], 400);
    }

    const finalStatus = status || 'draft';
    const allowedStatus = ['draft', 'final', 'cancelled'];
    if (!allowedStatus.includes(finalStatus)) return errorResponse(res, 'Status tidak valid', [], 400);

    const [studentRows] = await pool.query(`SELECT id FROM students WHERE id = ? LIMIT 1`, [student_id]);
    if (studentRows.length === 0) return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);

    const [result] = await pool.query(
      `INSERT INTO medical_records
       (student_id, queue_id, health_check_id, doctor_id, subjective, objective, assessment, plan, diagnosis, treatment, doctor_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, queue_id || null, health_check_id || null, req.user.id, subjective, objective, assessment, plan, diagnosis || null, treatment || null, doctor_notes || null, finalStatus]
    );

    if (queue_id && finalStatus === 'final') {
      await pool.query(`UPDATE queues SET status = 'completed', completed_at = NOW() WHERE id = ?`, [queue_id]);
    }

    const requestMeta = getRequestMeta(req);
    await createAuditLog({
      userId: req.user.id, action: 'CREATE_MEDICAL_RECORD', module: 'medical_record', targetId: result.insertId,
      description: `Membuat medical record untuk mahasiswa ID ${student_id}`,
      metadata: { student_id, status: finalStatus }, ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });

    return successResponse(res, 'Medical record berhasil dibuat', { id: result.insertId, status: finalStatus }, 201);
  } catch (error) {
    return errorResponse(res, 'Gagal membuat medical record', [error.message], 500);
  }
}

// FUNGSI UTAMA UNTUK HP FLUTTER
async function getMyMedicalRecords(req, res) {
  try {
    const [studentRows] = await pool.query(`SELECT id FROM students WHERE user_id = ? LIMIT 1`, [req.user.id]);
    if (studentRows.length === 0) return successResponse(res, 'Belum ada riwayat', []);

    // KUNCI KEBERHASILAN: Penamaan kolom ini sudah disamakan 100% dengan file Model Dart Anda
    const [rows] = await pool.query(
      `SELECT
        mr.id,
        'health_check' AS type,
        'Pemeriksaan Klinik' AS title,
        doctor_user.name AS doctor_name,
        COALESCE(q.queue_number, '-') AS queue_number,
        COALESCE(hc.complaint, '-') AS complaint,
        COALESCE(mr.subjective, '-') AS chief_complaint,
        COALESCE(mr.diagnosis, '-') AS diagnosis,
        COALESCE(mr.treatment, '-') AS treatment,
        COALESCE(mr.plan, '-') AS action_taken,
        COALESCE(mr.doctor_notes, '-') AS medicine,
        COALESCE(mr.objective, '-') AS notes,
        mr.status AS status,
        mr.created_at AS date,
        COALESCE(hc.temperature, '-') AS temperature,
        COALESCE(hc.blood_pressure, '-') AS blood_pressure,
        COALESCE(hc.pulse, '-') AS pulse,
        COALESCE(hc.respiratory_rate, '-') AS respiration
       FROM medical_records mr
       JOIN users doctor_user ON mr.doctor_id = doctor_user.id
       LEFT JOIN queues q ON mr.queue_id = q.id
       LEFT JOIN health_checks hc ON mr.health_check_id = hc.id
       WHERE mr.student_id = ? AND mr.status = 'final' 
       ORDER BY mr.created_at DESC`,
      [studentRows[0].id]
    );

    return successResponse(res, 'Berhasil mengambil riwayat kesehatan', rows);
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil riwayat', [error.message], 500);
  }
}

async function getMedicalRecordById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT mr.*, s.nim, s.study_program, s.class_name, doctor_user.name AS doctor_name
       FROM medical_records mr JOIN students s ON mr.student_id = s.id JOIN users doctor_user ON mr.doctor_id = doctor_user.id WHERE mr.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return errorResponse(res, 'Tidak ditemukan', [], 404);
    return successResponse(res, 'Detail berhasil diambil', rows[0]);
  } catch (error) { return errorResponse(res, 'Gagal mengambil detail', [error.message], 500); }
}

async function getMedicalRecordsByStudent(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT mr.id, mr.diagnosis, mr.status, mr.created_at, doctor_user.name AS doctor_name
       FROM medical_records mr JOIN users doctor_user ON mr.doctor_id = doctor_user.id WHERE mr.student_id = ? ORDER BY mr.created_at DESC`,
      [req.params.student_id]
    );
    return successResponse(res, 'Data berhasil diambil', rows);
  } catch (error) { return errorResponse(res, 'Gagal mengambil data', [error.message], 500); }
}

async function updateMedicalRecord(req, res) {
  try {
    const { subjective, objective, assessment, plan, diagnosis, treatment, doctor_notes, status } = req.body;
    await pool.query(
      `UPDATE medical_records SET subjective = COALESCE(?, subjective), objective = COALESCE(?, objective), assessment = COALESCE(?, assessment), plan = COALESCE(?, plan), diagnosis = COALESCE(?, diagnosis), treatment = COALESCE(?, treatment), doctor_notes = COALESCE(?, doctor_notes), status = COALESCE(?, status) WHERE id = ?`,
      [subjective ?? null, objective ?? null, assessment ?? null, plan ?? null, diagnosis ?? null, treatment ?? null, doctor_notes ?? null, status ?? null, req.params.id]
    );
    return successResponse(res, 'Berhasil diperbarui', { id: Number(req.params.id) });
  } catch (error) { return errorResponse(res, 'Gagal memperbarui', [error.message], 500); }
}

module.exports = {
  createMedicalRecord,
  getMyMedicalRecords,
  getMedicalRecordById,
  getMedicalRecordsByStudent,
  updateMedicalRecord
};