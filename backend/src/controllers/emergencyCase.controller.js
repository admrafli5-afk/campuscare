const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

async function generateEmergencyCaseNumber() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM emergency_cases
     WHERE MONTH(created_at) = ?
     AND YEAR(created_at) = ?`,
    [month, year]
  );

  const nextNumber = Number(rows[0].total) + 1;
  const sequence = String(nextNumber).padStart(4, "0");

  return `EMG/CC/${month}/${year}/${sequence}`;
}

async function findStudentByIdOrNim({ student_id, nim }) {
  if (student_id) {
    const [rows] = await pool.query(
      `SELECT id FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );
    return rows[0] || null;
  }

  if (nim) {
    const [rows] = await pool.query(
      `SELECT id FROM students WHERE nim = ? LIMIT 1`,
      [nim]
    );
    return rows[0] || null;
  }

  return null;
}

async function createEmergencyCase(req, res) {
  try {
    const {
      student_id,
      nim,
      temporary_patient_name,
      condition_type,
      location,
      brought_by_name,
      brought_by_phone,
      incident_time,
      initial_condition,
      supervised_by,
    } = req.body;

    if (!condition_type || !initial_condition) {
      return errorResponse(
        res,
        "condition_type dan initial_condition wajib diisi",
        [],
        400
      );
    }

    let finalStudentId = null;

    // 1. Cek identitas tanpa memblokir proses
    if (student_id || nim) {
      const student = await findStudentByIdOrNim({
        student_id,
        nim,
      });

      // KUNCI PERBAIKAN: Tidak ada lagi return 404 di sini.
      // Jika mahasiswa ditemukan, masukkan ID-nya. Jika tidak, biarkan finalStudentId = null
      if (student) {
        finalStudentId = student.id;
      }
    }

    const caseNumber = await generateEmergencyCaseNumber();
    const identityStatus = finalStudentId ? "identified" : "identity_pending";
    
    // Jika NIM diketik tapi tidak ada di DB, simpan NIM tersebut di nama sementara agar tidak hilang
    const tempName = finalStudentId 
        ? null 
        : (temporary_patient_name || (nim ? `Pasien Tidak Dikenal (NIM: ${nim})` : "Pasien Darurat Sementara"));

    const [result] = await pool.query(
      `INSERT INTO emergency_cases
       (
        case_number,
        student_id,
        temporary_patient_name,
        identity_status,
        condition_type,
        location,
        brought_by_name,
        brought_by_phone,
        incident_time,
        initial_condition,
        priority_level,
        status,
        handled_by,
        supervised_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emergency', 'emergency', ?, ?)`,
      [
        caseNumber,
        finalStudentId,
        tempName,
        identityStatus,
        condition_type,
        location || null,
        brought_by_name || null,
        brought_by_phone || null,
        incident_time || null,
        initial_condition,
        req.user.id,
        supervised_by || null,
      ]
    );

    return successResponse(
      res,
      "Kasus emergency berhasil dibuat",
      {
        id: result.insertId,
        case_number: caseNumber,
        status: "emergency",
        identity_status: identityStatus,
        student_id: finalStudentId,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal membuat emergency case",
      [error.message],
      500
    );
  }
}

async function getTodayEmergencyCases(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        ec.id,
        ec.case_number,
        ec.student_id,
        ec.temporary_patient_name,
        ec.identity_status,
        ec.condition_type,
        ec.location,
        ec.brought_by_name,
        ec.brought_by_phone,
        ec.incident_time,
        ec.initial_condition,
        ec.priority_level,
        ec.status,
        ec.created_at,
        ec.updated_at,
        handler.name AS handled_by_name,
        supervisor.name AS supervised_by_name,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM emergency_cases ec
       JOIN users handler ON ec.handled_by = handler.id
       LEFT JOIN users supervisor ON ec.supervised_by = supervisor.id
       LEFT JOIN students s ON ec.student_id = s.id
       LEFT JOIN users student_user ON s.user_id = student_user.id
       WHERE DATE(ec.created_at) = CURDATE()
       ORDER BY ec.created_at DESC`
    );

    return successResponse(
      res,
      "Data emergency hari ini berhasil diambil",
      rows
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal mengambil emergency case",
      [error.message],
      500
    );
  }
}

async function getEmergencyCaseById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        ec.id,
        ec.case_number,
        ec.student_id,
        ec.temporary_patient_name,
        ec.identity_status,
        ec.condition_type,
        ec.location,
        ec.brought_by_name,
        ec.brought_by_phone,
        ec.incident_time,
        ec.initial_condition,
        ec.priority_level,
        ec.status,
        ec.created_at,
        ec.updated_at,
        handler.name AS handled_by_name,
        supervisor.name AS supervised_by_name,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM emergency_cases ec
       JOIN users handler ON ec.handled_by = handler.id
       LEFT JOIN users supervisor ON ec.supervised_by = supervisor.id
       LEFT JOIN students s ON ec.student_id = s.id
       LEFT JOIN users student_user ON s.user_id = student_user.id
       WHERE ec.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Emergency case tidak ditemukan", [], 404);
    }

    return successResponse(
      res,
      "Detail emergency case berhasil diambil",
      rows[0]
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal mengambil detail emergency case",
      [error.message],
      500
    );
  }
}

async function updateEmergencyIdentity(req, res) {
  try {
    const { id } = req.params;
    const { student_id, nim } = req.body;

    if (!student_id && !nim) {
      return errorResponse(
        res,
        "student_id atau nim wajib diisi",
        [],
        400
      );
    }

    const [caseRows] = await pool.query(
      `SELECT id FROM emergency_cases WHERE id = ? LIMIT 1`,
      [id]
    );

    if (caseRows.length === 0) {
      return errorResponse(res, "Emergency case tidak ditemukan", [], 404);
    }

    const student = await findStudentByIdOrNim({
      student_id,
      nim,
    });

    // Di proses Update Identitas, 404 tetap ada karena tujuannya murni mencari data asli di DB
    if (!student) {
      return errorResponse(res, "Data mahasiswa tidak ditemukan di database. Pastikan NIM sudah benar.", [], 404);
    }

    await pool.query(
      `UPDATE emergency_cases
       SET 
        student_id = ?,
        identity_status = 'identified',
        temporary_patient_name = NULL
       WHERE id = ?`,
      [student.id, id]
    );

    return successResponse(res, "Identitas emergency berhasil dilengkapi", {
      id: Number(id),
      student_id: student.id,
      identity_status: "identified",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal melengkapi identitas emergency",
      [error.message],
      500
    );
  }
}

async function updateEmergencyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "emergency",
      "emergency_handled",
      "referred",
      "stabilized",
      "completed",
    ];

    if (!allowedStatus.includes(status)) {
      return errorResponse(res, "Status emergency tidak valid", [], 400);
    }

    const [rows] = await pool.query(
      `SELECT id FROM emergency_cases WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, "Emergency case tidak ditemukan", [], 404);
    }

    await pool.query(
      `UPDATE emergency_cases
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    return successResponse(res, "Status emergency berhasil diperbarui", {
      id: Number(id),
      status,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal update status emergency",
      [error.message],
      500
    );
  }
}

module.exports = {
  createEmergencyCase,
  getTodayEmergencyCases,
  getEmergencyCaseById,
  updateEmergencyIdentity,
  updateEmergencyStatus,
};