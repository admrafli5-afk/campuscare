const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { generatePrescriptionNumber } = require('../services/prescription.service');
const { createStockLog } = require('../services/medicineStock.service');

async function createPrescription(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      student_id,
      health_check_id,
      medical_record_id,
      notes,
      items,
    } = req.body;

    if (!student_id) {
      await connection.rollback();
      return errorResponse(res, 'student_id wajib diisi', [], 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Item obat wajib diisi minimal 1 obat', [], 400);
    }

    const [studentRows] = await connection.query(
      `SELECT id FROM students WHERE id = ? LIMIT 1`,
      [student_id]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    if (health_check_id) {
      const [healthRows] = await connection.query(
        `SELECT id FROM health_checks WHERE id = ? LIMIT 1`,
        [health_check_id]
      );

      if (healthRows.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Data pemeriksaan tidak ditemukan', [], 404);
      }
    }

    const prescriptionNumber = await generatePrescriptionNumber();

    const [prescriptionResult] = await connection.query(
      `INSERT INTO prescriptions
       (
        prescription_number,
        student_id,
        health_check_id,
        medical_record_id,
        created_by,
        notes,
        status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        prescriptionNumber,
        student_id,
        health_check_id || null,
        medical_record_id || null,
        req.user.id,
        notes || null,
      ]
    );

    const prescriptionId = prescriptionResult.insertId;

    for (const item of items) {
      const {
        medicine_id,
        dosage,
        frequency,
        duration,
        quantity,
        usage_instruction,
        notes: itemNotes,
      } = item;

      if (!medicine_id || !quantity) {
        await connection.rollback();
        return errorResponse(res, 'medicine_id dan quantity wajib diisi pada setiap item', [], 400);
      }

      const finalQuantity = Number(quantity);

      if (finalQuantity <= 0) {
        await connection.rollback();
        return errorResponse(res, 'Quantity obat harus lebih dari 0', [], 400);
      }

      const [medicineRows] = await connection.query(
        `SELECT id, name, stock
         FROM medicines
         WHERE id = ?
         AND is_active = 1
         LIMIT 1`,
        [medicine_id]
      );

      if (medicineRows.length === 0) {
        await connection.rollback();
        return errorResponse(res, `Obat dengan id ${medicine_id} tidak ditemukan`, [], 404);
      }

      const medicine = medicineRows[0];
      const stockBefore = Number(medicine.stock);

      if (stockBefore < finalQuantity) {
        await connection.rollback();
        return errorResponse(
          res,
          `Stok obat ${medicine.name} tidak mencukupi`,
          [
            {
              medicine_id,
              medicine_name: medicine.name,
              stock_available: stockBefore,
              requested_quantity: finalQuantity,
            },
          ],
          400
        );
      }

      const stockAfter = stockBefore - finalQuantity;

      await connection.query(
        `INSERT INTO prescription_items
         (
          prescription_id,
          medicine_id,
          medicine_name,
          dosage,
          frequency,
          duration,
          quantity,
          usage_instruction,
          notes
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prescriptionId,
          medicine.id,
          medicine.name,
          dosage || null,
          frequency || null,
          duration || null,
          finalQuantity,
          usage_instruction || null,
          itemNotes || null,
        ]
      );

      await connection.query(
        `UPDATE medicines
         SET stock = ?
         WHERE id = ?`,
        [stockAfter, medicine.id]
      );

      await connection.query(
        `INSERT INTO medicine_stock_logs
         (
          medicine_id,
          type,
          quantity,
          stock_before,
          stock_after,
          note,
          created_by
         )
         VALUES (?, 'out', ?, ?, ?, ?, ?)`,
        [
          medicine.id,
          finalQuantity,
          stockBefore,
          stockAfter,
          `Keluar untuk resep ${prescriptionNumber}`,
          req.user.id,
        ]
      );
    }

    await connection.commit();

    return successResponse(
      res,
      'Resep obat berhasil dibuat',
      {
        id: prescriptionId,
        prescription_number: prescriptionNumber,
        student_id,
        status: 'active',
      },
      201
    );
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return errorResponse(res, 'Gagal membuat resep obat', [error.message], 500);
  } finally {
    connection.release();
  }
}

async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;

    const [prescriptionRows] = await pool.query(
      `SELECT
        p.id,
        p.prescription_number,
        p.student_id,
        p.health_check_id,
        p.medical_record_id,
        p.created_by,
        p.notes,
        p.status,
        p.created_at,
        p.updated_at,
        student_user.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room,
        creator.name AS created_by_name
       FROM prescriptions p
       JOIN students s ON p.student_id = s.id
       JOIN users student_user ON s.user_id = student_user.id
       JOIN users creator ON p.created_by = creator.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (prescriptionRows.length === 0) {
      return errorResponse(res, 'Resep obat tidak ditemukan', [], 404);
    }

    const [items] = await pool.query(
      `SELECT
        pi.id,
        pi.prescription_id,
        pi.medicine_id,
        pi.medicine_name,
        pi.dosage,
        pi.frequency,
        pi.duration,
        pi.quantity,
        pi.usage_instruction,
        pi.notes,
        pi.created_at
       FROM prescription_items pi
       WHERE pi.prescription_id = ?
       ORDER BY pi.id ASC`,
      [id]
    );

    return successResponse(res, 'Detail resep obat berhasil diambil', {
      ...prescriptionRows[0],
      items,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil detail resep obat', [error.message], 500);
  }
}

async function getPrescriptionsByStudent(req, res) {
  try {
    const { student_id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        p.id,
        p.prescription_number,
        p.student_id,
        p.health_check_id,
        p.notes,
        p.status,
        p.created_at,
        creator.name AS created_by_name
       FROM prescriptions p
       JOIN users creator ON p.created_by = creator.id
       WHERE p.student_id = ?
       ORDER BY p.created_at DESC`,
      [student_id]
    );

    return successResponse(res, 'Data resep mahasiswa berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil resep mahasiswa', [error.message], 500);
  }
}

async function getMyPrescriptions(req, res) {
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
        p.id,
        p.prescription_number,
        p.student_id,
        p.health_check_id,
        p.notes,
        p.status,
        p.created_at,
        creator.name AS created_by_name
       FROM prescriptions p
       JOIN users creator ON p.created_by = creator.id
       WHERE p.student_id = ?
       ORDER BY p.created_at DESC`,
      [studentId]
    );

    return successResponse(res, 'Data resep saya berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil resep saya', [error.message], 500);
  }
}

async function cancelPrescription(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, status FROM prescriptions WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Resep obat tidak ditemukan', [], 404);
    }

    if (rows[0].status === 'cancelled') {
      return errorResponse(res, 'Resep obat sudah dibatalkan', [], 400);
    }

    await pool.query(
      `UPDATE prescriptions
       SET status = 'cancelled'
       WHERE id = ?`,
      [id]
    );

    return successResponse(res, 'Resep obat berhasil dibatalkan', {
      id: Number(id),
      status: 'cancelled',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal membatalkan resep obat', [error.message], 500);
  }
}

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsByStudent,
  getMyPrescriptions,
  cancelPrescription,
};
