const pool = require('../config/db'); // Pastikan path database Anda benar
const { successResponse, errorResponse } = require('../utils/response'); // Pastikan path utils benar

async function getMyMedicalHistory(req, res) {
  try {
    const [studentRows] = await pool.query(
      `SELECT s.id, s.nim, s.study_program, s.class_name, s.room, s.gender, s.phone, u.name, u.email
       FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);

    const studentId = studentRows[0].id;
    const history = await buildMedicalHistory(studentId);

    return successResponse(res, 'Riwayat kesehatan berhasil diambil', {
      student: studentRows[0],
      ...history,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil riwayat kesehatan', [error.message], 500);
  }
}

async function getStudentMedicalHistory(req, res) {
  try {
    const { id } = req.params;
    const [studentRows] = await pool.query(
      `SELECT s.id, s.nim, s.study_program, s.class_name, s.room, s.gender, s.phone, u.name, u.email
       FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ? LIMIT 1`,
      [id]
    );

    if (studentRows.length === 0) return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);

    const history = await buildMedicalHistory(id);

    return successResponse(res, 'Riwayat kesehatan berhasil diambil', {
      student: studentRows[0],
      ...history,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil riwayat kesehatan', [error.message], 500);
  }
}

async function updateMyHealthProfile(req, res) {
  try {
    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);

    const studentId = studentRows[0].id;
    const { blood_type, congenital_disease, chronic_disease, drug_allergy, medical_notes, emergency_contact_name, emergency_contact_phone, emergency_contact_relation } = req.body;

    const [profileRows] = await pool.query(
      `SELECT id FROM student_health_profiles WHERE student_id = ? LIMIT 1`,
      [studentId]
    );

    if (profileRows.length > 0) {
      await pool.query(
        `UPDATE student_health_profiles SET blood_type = ?, congenital_disease = ?, chronic_disease = ?, drug_allergy = ?, medical_notes = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ? WHERE student_id = ?`,
        [blood_type, congenital_disease, chronic_disease, drug_allergy, medical_notes, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, studentId]
      );
    } else {
      await pool.query(
        `INSERT INTO student_health_profiles (student_id, blood_type, congenital_disease, chronic_disease, drug_allergy, medical_notes, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, consent_given) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [studentId, blood_type, congenital_disease, chronic_disease, drug_allergy, medical_notes, emergency_contact_name, emergency_contact_phone, emergency_contact_relation]
      );
    }

    return successResponse(res, 'Profil kesehatan berhasil diperbarui', { student_id: studentId });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal memperbarui profil kesehatan', [error.message], 500);
  }
}

async function buildMedicalHistory(studentId) {
  const [profileRows] = await pool.query(
    `SELECT blood_type, congenital_disease, chronic_disease, drug_allergy, medical_notes, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, consent_given
     FROM student_health_profiles WHERE student_id = ? LIMIT 1`, [studentId]
  );
  return { health_profile: profileRows.length > 0 ? profileRows[0] : null }; // Dipersingkat agar tidak ada error query tabel lain yang mungkin belum ada
}

// WAJIB ADA AGAR TIDAK ERROR "MUST BE A FUNCTION"
module.exports = {
  getMyMedicalHistory,
  getStudentMedicalHistory,
  updateMyHealthProfile,
};