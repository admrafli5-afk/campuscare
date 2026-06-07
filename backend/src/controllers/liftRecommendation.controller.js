const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const {
  generateLiftRecommendationNumber,
  getDefaultLiftRecommendationText,
} = require('../services/liftRecommendation.service');
const {
  createAuditLog,
  getRequestMeta,
} = require('../services/auditLog.service');

async function createLiftRecommendation(req, res) {
  try {
    const {
      student_id,
      health_check_id,
      medical_record_id,
      reason,
      medical_condition,
      recommendation_text,
      start_date,
      end_date,
    } = req.body;

    if (!student_id || !reason || !medical_condition) {
      return errorResponse(
        res,
        'student_id, reason, dan medical_condition wajib diisi',
        [],
        400
      );
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return errorResponse(
        res,
        'start_date tidak boleh lebih besar dari end_date',
        [],
        400
      );
    }

    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
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

    if (medical_record_id) {
      const [recordRows] = await pool.query(
        `SELECT id FROM medical_records WHERE id = ? LIMIT 1`,
        [medical_record_id]
      );

      if (recordRows.length === 0) {
        return errorResponse(res, 'Data medical record tidak ditemukan', [], 404);
      }
    }

    const recommendationNumber = await generateLiftRecommendationNumber();

    const finalRecommendationText =
      recommendation_text || getDefaultLiftRecommendationText();

    const [result] = await pool.query(
      `INSERT INTO lift_recommendations
       (
        recommendation_number,
        student_id,
        health_check_id,
        medical_record_id,
        created_by,
        reason,
        medical_condition,
        recommendation_text,
        start_date,
        end_date,
        status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        recommendationNumber,
        student_id,
        health_check_id || null,
        medical_record_id || null,
        req.user.id,
        reason,
        medical_condition,
        finalRecommendationText,
        start_date || null,
        end_date || null,
      ]
    );

    const requestMeta = getRequestMeta(req);

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE_LIFT_RECOMMENDATION',
      module: 'lift_recommendation',
      targetId: result.insertId,
      description: `Membuat rekomendasi lift ${recommendationNumber}`,
      metadata: {
        recommendation_number: recommendationNumber,
        student_id,
        health_check_id: health_check_id || null,
        medical_record_id: medical_record_id || null,
        status: 'draft',
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return successResponse(
      res,
      'Rekomendasi lift berhasil dibuat',
      {
        id: result.insertId,
        recommendation_number: recommendationNumber,
        student_id,
        status: 'draft',
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal membuat rekomendasi lift', [error.message], 500);
  }
}

async function getLiftRecommendationById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        lr.id,
        lr.recommendation_number,
        lr.student_id,
        lr.health_check_id,
        lr.medical_record_id,
        lr.created_by,
        lr.approved_by,
        lr.reason,
        lr.medical_condition,
        lr.recommendation_text,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.rejection_reason,
        lr.approved_at,
        lr.created_at,
        lr.updated_at,

        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,

        creator.name AS created_by_name,
        approver.name AS approved_by_name
       FROM lift_recommendations lr
       JOIN students s ON lr.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       JOIN users creator ON lr.created_by = creator.id
       LEFT JOIN users approver ON lr.approved_by = approver.id
       WHERE lr.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Rekomendasi lift tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Detail rekomendasi lift berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil detail rekomendasi lift', [error.message], 500);
  }
}

async function getLiftRecommendationsByStudent(req, res) {
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
        lr.id,
        lr.recommendation_number,
        lr.student_id,
        lr.reason,
        lr.medical_condition,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.created_at,
        lr.updated_at,
        creator.name AS created_by_name,
        approver.name AS approved_by_name
       FROM lift_recommendations lr
       JOIN users creator ON lr.created_by = creator.id
       LEFT JOIN users approver ON lr.approved_by = approver.id
       WHERE lr.student_id = ?
       ORDER BY lr.created_at DESC`,
      [student_id]
    );

    return successResponse(res, 'Data rekomendasi lift mahasiswa berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil rekomendasi lift mahasiswa', [error.message], 500);
  }
}

async function getMyLiftRecommendations(req, res) {
  try {
    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const studentId = studentRows[0].id;

    const [rows] = await pool.query(
      `SELECT
        id,
        recommendation_number,
        student_id,
        reason,
        medical_condition,
        recommendation_text,
        start_date,
        end_date,
        status,
        rejection_reason,
        approved_at,
        created_at,
        updated_at
       FROM lift_recommendations
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    return successResponse(res, 'Data rekomendasi lift saya berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil rekomendasi lift saya', [error.message], 500);
  }
}

async function submitLiftRecommendation(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM lift_recommendations WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Rekomendasi lift tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'draft') {
      return errorResponse(
        res,
        'Hanya rekomendasi berstatus draft yang dapat diajukan',
        [],
        400
      );
    }

    await pool.query(
      `UPDATE lift_recommendations
       SET status = 'waiting_validation'
       WHERE id = ?`,
      [id]
    );

    const requestMeta = getRequestMeta(req);

    await createAuditLog({
      userId: req.user.id,
      action: 'SUBMIT_LIFT_RECOMMENDATION',
      module: 'lift_recommendation',
      targetId: Number(id),
      description: `Mengajukan validasi rekomendasi lift ID ${id}`,
      metadata: {
        previous_status: 'draft',
        new_status: 'waiting_validation',
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return successResponse(res, 'Rekomendasi lift berhasil diajukan', {
      id: Number(id),
      status: 'waiting_validation',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengajukan rekomendasi lift', [error.message], 500);
  }
}

async function approveLiftRecommendation(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM lift_recommendations WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Rekomendasi lift tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'waiting_validation') {
      return errorResponse(
        res,
        'Hanya rekomendasi berstatus waiting_validation yang dapat disetujui',
        [],
        400
      );
    }

    await pool.query(
      `UPDATE lift_recommendations
       SET status = 'approved',
           approved_by = ?,
           approved_at = NOW(),
           rejection_reason = NULL
       WHERE id = ?`,
      [req.user.id, id]
    );

    const requestMeta = getRequestMeta(req);

    await createAuditLog({
      userId: req.user.id,
      action: 'APPROVE_LIFT_RECOMMENDATION',
      module: 'lift_recommendation',
      targetId: Number(id),
      description: `Menyetujui rekomendasi lift ID ${id}`,
      metadata: {
        previous_status: 'waiting_validation',
        new_status: 'approved',
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return successResponse(res, 'Rekomendasi lift berhasil disetujui', {
      id: Number(id),
      status: 'approved',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menyetujui rekomendasi lift', [error.message], 500);
  }
}

async function rejectLiftRecommendation(req, res) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return errorResponse(res, 'rejection_reason wajib diisi', [], 400);
    }

    const [rows] = await pool.query(
      `SELECT id, status FROM lift_recommendations WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Rekomendasi lift tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'waiting_validation') {
      return errorResponse(
        res,
        'Hanya rekomendasi berstatus waiting_validation yang dapat ditolak',
        [],
        400
      );
    }

    await pool.query(
      `UPDATE lift_recommendations
       SET status = 'rejected',
           approved_by = ?,
           rejection_reason = ?
       WHERE id = ?`,
      [req.user.id, rejection_reason, id]
    );

    const requestMeta = getRequestMeta(req);

    await createAuditLog({
      userId: req.user.id,
      action: 'REJECT_LIFT_RECOMMENDATION',
      module: 'lift_recommendation',
      targetId: Number(id),
      description: `Menolak rekomendasi lift ID ${id}`,
      metadata: {
        previous_status: 'waiting_validation',
        new_status: 'rejected',
        rejection_reason,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return successResponse(res, 'Rekomendasi lift berhasil ditolak', {
      id: Number(id),
      status: 'rejected',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menolak rekomendasi lift', [error.message], 500);
  }
}

module.exports = {
  createLiftRecommendation,
  getLiftRecommendationById,
  getLiftRecommendationsByStudent,
  getMyLiftRecommendations,
  submitLiftRecommendation,
  approveLiftRecommendation,
  rejectLiftRecommendation,
};