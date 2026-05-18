const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function createHealthCheck(req, res) {
  try {
    const {
      queue_id,
      student_id,
      temperature,
      blood_pressure,
      pulse,
      weight,
      height,
      complaint,
      condition_status,
      recommendation,
      notes,
    } = req.body;

    if (!student_id) {
      return errorResponse(res, 'student_id wajib diisi', [], 400);
    }

    const allowedConditionStatus = [
      'healthy',
      'light_sick',
      'medium_sick',
      'injury',
      'emergency',
      'need_referral',
    ];

    const finalConditionStatus = condition_status || 'light_sick';

    if (!allowedConditionStatus.includes(finalConditionStatus)) {
      return errorResponse(res, 'condition_status tidak valid', [], 400);
    }

    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    if (queue_id) {
      const [queueRows] = await pool.query(
        `SELECT id FROM queues WHERE id = ? LIMIT 1`,
        [queue_id]
      );

      if (queueRows.length === 0) {
        return errorResponse(res, 'Data antrean tidak ditemukan', [], 404);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO health_checks
       (
        queue_id,
        student_id,
        staff_id,
        temperature,
        blood_pressure,
        pulse,
        weight,
        height,
        complaint,
        condition_status,
        recommendation,
        notes
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        queue_id || null,
        student_id,
        req.user.id,
        temperature || null,
        blood_pressure || null,
        pulse || null,
        weight || null,
        height || null,
        complaint || null,
        finalConditionStatus,
        recommendation || null,
        notes || null,
      ]
    );

    if (queue_id) {
      await pool.query(
        `UPDATE queues
         SET status = 'in_checkup'
         WHERE id = ?`,
        [queue_id]
      );
    }

    return successResponse(
      res,
      'Pemeriksaan awal berhasil disimpan',
      {
        id: result.insertId,
        queue_id: queue_id || null,
        student_id,
        staff_id: req.user.id,
        condition_status: finalConditionStatus,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menyimpan pemeriksaan awal', [error.message], 500);
  }
}

async function getHealthCheckById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        hc.id,
        hc.queue_id,
        hc.student_id,
        hc.staff_id,
        hc.temperature,
        hc.blood_pressure,
        hc.pulse,
        hc.weight,
        hc.height,
        hc.complaint,
        hc.condition_status,
        hc.recommendation,
        hc.notes,
        hc.created_at,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,
        staff_user.name AS staff_name
       FROM health_checks hc
       JOIN students s ON hc.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       JOIN users staff_user ON hc.staff_id = staff_user.id
       WHERE hc.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Data pemeriksaan tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Data pemeriksaan berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil data pemeriksaan', [error.message], 500);
  }
}

module.exports = {
  createHealthCheck,
  getHealthCheckById,
};