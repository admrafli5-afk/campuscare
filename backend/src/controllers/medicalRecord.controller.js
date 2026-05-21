const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function createMedicalRecord(req, res) {
  try {
    const {
      student_id,
      queue_id,
      health_check_id,
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      treatment,
      doctor_notes,
      status,
    } = req.body;

    if (!student_id || !subjective || !objective || !assessment || !plan) {
      return errorResponse(
        res,
        'student_id, subjective, objective, assessment, dan plan wajib diisi',
        [],
        400
      );
    }

    const finalStatus = status || 'draft';
    const allowedStatus = ['draft', 'final', 'cancelled'];

    if (!allowedStatus.includes(finalStatus)) {
      return errorResponse(res, 'Status medical record tidak valid', [], 400);
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

    if (health_check_id) {
      const [healthRows] = await pool.query(
        `SELECT id FROM health_checks WHERE id = ? LIMIT 1`,
        [health_check_id]
      );

      if (healthRows.length === 0) {
        return errorResponse(res, 'Data pemeriksaan awal tidak ditemukan', [], 404);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO medical_records
       (
        student_id,
        queue_id,
        health_check_id,
        doctor_id,
        subjective,
        objective,
        assessment,
        plan,
        diagnosis,
        treatment,
        doctor_notes,
        status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        queue_id || null,
        health_check_id || null,
        req.user.id,
        subjective,
        objective,
        assessment,
        plan,
        diagnosis || null,
        treatment || null,
        doctor_notes || null,
        finalStatus,
      ]
    );

    if (queue_id && finalStatus === 'final') {
      await pool.query(
        `UPDATE queues
         SET status = 'completed',
             completed_at = NOW()
         WHERE id = ?`,
        [queue_id]
      );
    }

    return successResponse(
      res,
      'Medical record berhasil dibuat',
      {
        id: result.insertId,
        student_id,
        doctor_id: req.user.id,
        status: finalStatus,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal membuat medical record', [error.message], 500);
  }
}

async function getMedicalRecordById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        mr.id,
        mr.student_id,
        mr.queue_id,
        mr.health_check_id,
        mr.doctor_id,
        mr.subjective,
        mr.objective,
        mr.assessment,
        mr.plan,
        mr.diagnosis,
        mr.treatment,
        mr.doctor_notes,
        mr.status,
        mr.created_at,
        mr.updated_at,

        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,

        doctor_user.name AS doctor_name
       FROM medical_records mr
       JOIN students s ON mr.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       JOIN users doctor_user ON mr.doctor_id = doctor_user.id
       WHERE mr.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Medical record tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Detail medical record berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil detail medical record', [error.message], 500);
  }
}

async function getMedicalRecordsByStudent(req, res) {
  try {
    const { student_id } = req.params;

    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const [rows] = await pool.query(
      `SELECT
        mr.id,
        mr.student_id,
        mr.queue_id,
        mr.health_check_id,
        mr.doctor_id,
        mr.diagnosis,
        mr.status,
        mr.created_at,
        mr.updated_at,
        doctor_user.name AS doctor_name
       FROM medical_records mr
       JOIN users doctor_user ON mr.doctor_id = doctor_user.id
       WHERE mr.student_id = ?
       ORDER BY mr.created_at DESC`,
      [student_id]
    );

    return successResponse(res, 'Data medical record mahasiswa berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil medical record mahasiswa', [error.message], 500);
  }
}

async function updateMedicalRecord(req, res) {
  try {
    const { id } = req.params;

    const {
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      treatment,
      doctor_notes,
      status,
    } = req.body;

    const [recordRows] = await pool.query(
      `SELECT id, queue_id, status FROM medical_records WHERE id = ? LIMIT 1`,
      [id]
    );

    if (recordRows.length === 0) {
      return errorResponse(res, 'Medical record tidak ditemukan', [], 404);
    }

    const allowedStatus = ['draft', 'final', 'cancelled'];

    if (status && !allowedStatus.includes(status)) {
      return errorResponse(res, 'Status medical record tidak valid', [], 400);
    }

    await pool.query(
      `UPDATE medical_records
       SET
        subjective = COALESCE(?, subjective),
        objective = COALESCE(?, objective),
        assessment = COALESCE(?, assessment),
        plan = COALESCE(?, plan),
        diagnosis = COALESCE(?, diagnosis),
        treatment = COALESCE(?, treatment),
        doctor_notes = COALESCE(?, doctor_notes),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [
        subjective ?? null,
        objective ?? null,
        assessment ?? null,
        plan ?? null,
        diagnosis ?? null,
        treatment ?? null,
        doctor_notes ?? null,
        status ?? null,
        id,
      ]
    );

    if (status === 'final' && recordRows[0].queue_id) {
      await pool.query(
        `UPDATE queues
         SET status = 'completed',
             completed_at = NOW()
         WHERE id = ?`,
        [recordRows[0].queue_id]
      );
    }

    return successResponse(res, 'Medical record berhasil diperbarui', {
      id: Number(id),
      status: status || recordRows[0].status,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal memperbarui medical record', [error.message], 500);
  }
}

module.exports = {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecordsByStudent,
  updateMedicalRecord,
};