const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const {
  generateSickLetterNumber,
  generateVerificationToken,
} = require('../services/letterNumber.service');

async function createSickLetter(req, res) {
  try {
    const {
      student_id,
      health_check_id,
      reason,
      diagnosis_summary,
      rest_days,
      start_date,
      end_date,
    } = req.body;

    if (!student_id || !health_check_id || !rest_days || !start_date || !end_date) {
      return errorResponse(
        res,
        'student_id, health_check_id, rest_days, start_date, dan end_date wajib diisi',
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

    const [healthRows] = await pool.query(
      `SELECT id FROM health_checks WHERE id = ? LIMIT 1`,
      [health_check_id]
    );

    if (healthRows.length === 0) {
      return errorResponse(res, 'Data pemeriksaan tidak ditemukan', [], 404);
    }

    const letterNumber = await generateSickLetterNumber();
    const verificationToken = generateVerificationToken();

    const [result] = await pool.query(
      `INSERT INTO sick_letters
       (
        student_id,
        health_check_id,
        letter_number,
        reason,
        diagnosis_summary,
        rest_days,
        start_date,
        end_date,
        status,
        created_by,
        verification_token
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [
        student_id,
        health_check_id,
        letterNumber,
        reason || null,
        diagnosis_summary || null,
        rest_days,
        start_date,
        end_date,
        req.user.id,
        verificationToken,
      ]
    );

    return successResponse(
      res,
      'Draft surat izin sakit berhasil dibuat',
      {
        id: result.insertId,
        letter_number: letterNumber,
        status: 'draft',
        verification_token: verificationToken,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal membuat surat izin sakit', [error.message], 500);
  }
}

async function submitValidation(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM sick_letters WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Surat izin sakit tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'draft') {
      return errorResponse(res, 'Surat hanya bisa diajukan dari status draft', [], 400);
    }

    await pool.query(
      `UPDATE sick_letters
       SET status = 'waiting_validation'
       WHERE id = ?`,
      [id]
    );

    return successResponse(res, 'Surat berhasil diajukan untuk validasi', {
      id: Number(id),
      status: 'waiting_validation',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengajukan validasi surat', [error.message], 500);
  }
}

async function approveSickLetter(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM sick_letters WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Surat izin sakit tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'waiting_validation') {
      return errorResponse(res, 'Surat hanya bisa disetujui dari status waiting_validation', [], 400);
    }

    await pool.query(
      `UPDATE sick_letters
       SET status = 'approved',
           validated_by = ?,
           validated_at = NOW(),
           sent_to_student_affairs_at = NOW()
       WHERE id = ?`,
      [req.user.id, id]
    );

    return successResponse(res, 'Surat izin sakit berhasil disetujui', {
      id: Number(id),
      status: 'approved',
      validated_by: req.user.id,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menyetujui surat izin sakit', [error.message], 500);
  }
}

async function rejectSickLetter(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM sick_letters WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Surat izin sakit tidak ditemukan', [], 404);
    }

    if (rows[0].status !== 'waiting_validation') {
      return errorResponse(res, 'Surat hanya bisa ditolak dari status waiting_validation', [], 400);
    }

    await pool.query(
      `UPDATE sick_letters
       SET status = 'rejected',
           validated_by = ?,
           validated_at = NOW()
       WHERE id = ?`,
      [req.user.id, id]
    );

    return successResponse(res, 'Surat izin sakit berhasil ditolak', {
      id: Number(id),
      status: 'rejected',
      validated_by: req.user.id,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menolak surat izin sakit', [error.message], 500);
  }
}

async function getMySickLetters(req, res) {
  try {
    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const [rows] = await pool.query(
      `SELECT 
        id,
        letter_number,
        reason,
        diagnosis_summary,
        rest_days,
        start_date,
        end_date,
        status,
        verification_token,
        created_at,
        updated_at
       FROM sick_letters
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentRows[0].id]
    );

    return successResponse(res, 'Data surat izin sakit berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil surat izin sakit mahasiswa', [error.message], 500);
  }
}

async function getSickLetterById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        sl.id,
        sl.letter_number,
        sl.reason,
        sl.diagnosis_summary,
        sl.rest_days,
        sl.start_date,
        sl.end_date,
        sl.status,
        sl.verification_token,
        sl.created_at,
        sl.updated_at,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,
        creator.name AS created_by_name,
        validator.name AS validated_by_name
       FROM sick_letters sl
       JOIN students s ON sl.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       JOIN users creator ON sl.created_by = creator.id
       LEFT JOIN users validator ON sl.validated_by = validator.id
       WHERE sl.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Surat izin sakit tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Detail surat izin sakit berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil detail surat izin sakit', [error.message], 500);
  }
}

async function getStudentAffairsSickLetters(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        sl.id,
        sl.letter_number,
        sl.reason,
        sl.rest_days,
        sl.start_date,
        sl.end_date,
        sl.status,
        sl.created_at,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM sick_letters sl
       JOIN students s ON sl.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       WHERE sl.status IN ('approved', 'sent_to_student_affairs', 'printed')
       ORDER BY sl.created_at DESC`
    );

    return successResponse(res, 'Data surat masuk kemahasiswaan berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil surat masuk kemahasiswaan', [error.message], 500);
  }
}

module.exports = {
  createSickLetter,
  submitValidation,
  approveSickLetter,
  rejectSickLetter,
  getMySickLetters,
  getSickLetterById,
  getStudentAffairsSickLetters,
};