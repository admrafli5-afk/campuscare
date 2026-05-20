const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function getMyMedicalHistory(req, res) {
  try {
    const [studentRows] = await pool.query(
      `SELECT 
        s.id,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,
        s.gender,
        s.phone,
        u.name,
        u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const studentId = studentRows[0].id;
    const history = await buildMedicalHistory(studentId);

    return successResponse(res, 'Riwayat kesehatan mahasiswa berhasil diambil', {
      student: studentRows[0],
      ...history,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil riwayat kesehatan mahasiswa', [error.message], 500);
  }
}

async function getStudentMedicalHistory(req, res) {
  try {
    const { id } = req.params;

    const [studentRows] = await pool.query(
      `SELECT 
        s.id,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,
        s.gender,
        s.phone,
        u.name,
        u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const history = await buildMedicalHistory(id);

    return successResponse(res, 'Riwayat kesehatan mahasiswa berhasil diambil', {
      student: studentRows[0],
      ...history,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil riwayat kesehatan mahasiswa', [error.message], 500);
  }
}

async function buildMedicalHistory(studentId) {
  const [profileRows] = await pool.query(
    `SELECT 
      blood_type,
      congenital_disease,
      chronic_disease,
      drug_allergy,
      medical_notes,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      consent_given
     FROM student_health_profiles
     WHERE student_id = ?
     LIMIT 1`,
    [studentId]
  );

  const [healthChecks] = await pool.query(
    `SELECT 
      hc.id,
      hc.queue_id,
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
      staff.name AS staff_name
     FROM health_checks hc
     JOIN users staff ON hc.staff_id = staff.id
     WHERE hc.student_id = ?
     ORDER BY hc.created_at DESC`,
    [studentId]
  );

  const [sickLetters] = await pool.query(
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
    [studentId]
  );

  const [emergencyCases] = await pool.query(
    `SELECT 
      id,
      case_number,
      identity_status,
      condition_type,
      location,
      brought_by_name,
      brought_by_phone,
      incident_time,
      initial_condition,
      priority_level,
      status,
      created_at,
      updated_at
     FROM emergency_cases
     WHERE student_id = ?
     ORDER BY created_at DESC`,
    [studentId]
  );

  const [queues] = await pool.query(
    `SELECT 
      id,
      queue_number,
      complaint,
      service_type,
      priority_level,
      estimated_minutes,
      status,
      created_at,
      called_at,
      checked_in_at,
      completed_at
     FROM queues
     WHERE student_id = ?
     ORDER BY created_at DESC`,
    [studentId]
  );

  return {
    health_profile: profileRows.length > 0 ? profileRows[0] : null,
    summary: {
      total_health_checks: healthChecks.length,
      total_sick_letters: sickLetters.length,
      total_emergency_cases: emergencyCases.length,
      total_queues: queues.length,
    },
    health_checks: healthChecks,
    sick_letters: sickLetters,
    emergency_cases: emergencyCases,
    queues: queues,
  };
}

module.exports = {
  getMyMedicalHistory,
  getStudentMedicalHistory,
};