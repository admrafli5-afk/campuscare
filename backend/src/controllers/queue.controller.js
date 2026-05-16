const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { generateQrToken } = require('../services/qrToken.service');
const {
  getEstimatedMinutesByPriority,
  classifyPriorityByComplaint,
  calculateEstimatedWaitingMinutes,
} = require('../services/queue.service');

/**
 * Generate queue number safely.
 * 
 * Masalah sebelumnya:
 * Backend bisa membuat A001/A002/A003 lagi ketika antrean aktif kosong,
 * padahal queue_number lama masih ada di database.
 *
 * Solusi:
 * Ambil queue_number terbesar yang pernah ada, lalu tambah 1.
 */
async function generateSafeQueueNumber() {
  const [lastQueueRows] = await pool.query(`
    SELECT queue_number
    FROM queues
    WHERE queue_number LIKE 'A%'
    ORDER BY CAST(SUBSTRING(queue_number, 2) AS UNSIGNED) DESC
    LIMIT 1
  `);

  let nextNumber = 1;

  if (lastQueueRows.length > 0) {
    const lastQueueNumber = lastQueueRows[0].queue_number;
    const lastNumber = parseInt(lastQueueNumber.replace('A', ''), 10);

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `A${String(nextNumber).padStart(3, '0')}`;
}

async function getPublicQueueStatus(req, res) {
  try {
    const [activeRows] = await pool.query(
      `SELECT COUNT(*) AS active_queue_count
       FROM queues
       WHERE DATE(created_at) = CURDATE()
       AND status IN ('waiting', 'called', 'on_the_way', 'checked_in', 'in_checkup')`
    );

    const [servingRows] = await pool.query(
      `SELECT queue_number
       FROM queues
       WHERE DATE(created_at) = CURDATE()
       AND status IN ('called', 'checked_in', 'in_checkup')
       ORDER BY created_at ASC
       LIMIT 1`
    );

    const estimatedWaitMinutes = await calculateEstimatedWaitingMinutes();

    let crowdLevel = 'sepi';

    if (activeRows[0].active_queue_count >= 10) {
      crowdLevel = 'ramai';
    } else if (activeRows[0].active_queue_count >= 5) {
      crowdLevel = 'sedang';
    }

    return successResponse(res, 'Status antrean klinik berhasil diambil', {
      clinic_status: 'open',
      currently_serving:
        servingRows.length > 0 ? servingRows[0].queue_number : null,
      active_queue_count: activeRows[0].active_queue_count,
      estimated_wait_minutes: estimatedWaitMinutes,
      crowd_level: crowdLevel,
      note: 'Estimasi dapat berubah jika terdapat kasus darurat.',
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Gagal mengambil status antrean',
      [error.message],
      500
    );
  }
}

async function registerQueue(req, res) {
  try {
    const { complaint, service_type } = req.body;

    if (!complaint || complaint.trim() === '') {
      return errorResponse(res, 'Keluhan wajib diisi', [], 400);
    }

    const [studentRows] = await pool.query(
      `SELECT id FROM students WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (studentRows.length === 0) {
      return errorResponse(res, 'Data mahasiswa tidak ditemukan', [], 404);
    }

    const studentId = studentRows[0].id;

    const [existingRows] = await pool.query(
      `SELECT id, queue_number, status
       FROM queues
       WHERE student_id = ?
       AND DATE(created_at) = CURDATE()
       AND status IN ('waiting', 'called', 'on_the_way', 'checked_in', 'in_checkup')
       LIMIT 1`,
      [studentId]
    );

    if (existingRows.length > 0) {
      return errorResponse(
        res,
        `Kamu masih memiliki antrean aktif dengan nomor ${existingRows[0].queue_number}`,
        existingRows[0],
        409
      );
    }

    const cleanComplaint = complaint.trim();
    const selectedServiceType = service_type || 'Pemeriksaan Umum';

    const priorityLevel = classifyPriorityByComplaint(cleanComplaint);

    if (priorityLevel === 'emergency') {
      return errorResponse(
        res,
        'Keluhan terdeteksi sebagai kondisi darurat. Silakan segera menuju klinik atau minta bantuan petugas kampus.',
        [],
        400
      );
    }

    const queueNumber = await generateSafeQueueNumber();
    const qrToken = generateQrToken(queueNumber);

    const currentEstimatedWaiting = await calculateEstimatedWaitingMinutes();
    const ownServiceEstimate = getEstimatedMinutesByPriority(priorityLevel);
    const estimatedMinutes = currentEstimatedWaiting + ownServiceEstimate;

    const [result] = await pool.query(
      `INSERT INTO queues
       (student_id, queue_number, complaint, service_type, priority_level, estimated_minutes, qr_token, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting')`,
      [
        studentId,
        queueNumber,
        cleanComplaint,
        selectedServiceType,
        priorityLevel,
        estimatedMinutes,
        qrToken,
      ]
    );

    return successResponse(
      res,
      'Antrean berhasil dibuat',
      {
        id: result.insertId,
        student_id: studentId,
        queue_number: queueNumber,
        complaint: cleanComplaint,
        service_type: selectedServiceType,
        priority_level: priorityLevel,
        estimated_minutes: estimatedMinutes,
        qr_token: qrToken,
        status: 'waiting',
        arrival_recommendation:
          estimatedMinutes > 15
            ? 'Kamu boleh tetap mengikuti kegiatan. Datang ke klinik sekitar 10 menit sebelum estimasi panggilan.'
            : 'Silakan bersiap menuju klinik.',
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal membuat antrean', [error.message], 500);
  }
}

async function getMyCurrentQueue(req, res) {
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
        student_id,
        queue_number,
        complaint,
        service_type,
        priority_level,
        estimated_minutes,
        qr_token,
        status,
        created_at,
        called_at,
        checked_in_at,
        completed_at
       FROM queues
       WHERE student_id = ?
       AND DATE(created_at) = CURDATE()
       AND status IN ('waiting', 'called', 'on_the_way', 'checked_in', 'in_checkup')
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return successResponse(res, 'Tidak ada antrean aktif', null);
    }

    return successResponse(res, 'Antrean aktif berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Gagal mengambil antrean aktif',
      [error.message],
      500
    );
  }
}

async function getTodayQueues(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        q.id,
        q.student_id,
        q.queue_number,
        q.complaint,
        q.service_type,
        q.priority_level,
        q.estimated_minutes,
        q.qr_token,
        q.status,
        q.created_at,
        q.called_at,
        q.checked_in_at,
        q.completed_at,
        u.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM queues q
       JOIN students s ON q.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE DATE(q.created_at) = CURDATE()
       ORDER BY q.created_at ASC`
    );

    return successResponse(res, 'Data antrean hari ini berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Gagal mengambil antrean hari ini',
      [error.message],
      500
    );
  }
}

async function checkInQueue(req, res) {
  try {
    const { qr_token } = req.body;

    if (!qr_token) {
      return errorResponse(res, 'QR token wajib diisi', [], 400);
    }

    const [rows] = await pool.query(
      `SELECT 
        q.id,
        q.queue_number,
        q.complaint,
        q.service_type,
        q.priority_level,
        q.estimated_minutes,
        q.qr_token,
        q.status,
        q.student_id,
        u.name AS student_name,
        s.nim,
        s.study_program,
        s.class_name,
        s.room
       FROM queues q
       JOIN students s ON q.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE q.qr_token = ?
       LIMIT 1`,
      [qr_token]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'QR token tidak valid', [], 404);
    }

    const queue = rows[0];

    if (queue.status === 'completed') {
      return errorResponse(res, 'Antrean ini sudah selesai', [], 400);
    }

    if (queue.status === 'cancelled') {
      return errorResponse(res, 'Antrean ini sudah dibatalkan', [], 400);
    }

    await pool.query(
      `UPDATE queues 
       SET status = 'checked_in', checked_in_at = NOW()
       WHERE id = ?`,
      [queue.id]
    );

    return successResponse(res, 'Check-in berhasil', {
      ...queue,
      status: 'checked_in',
      checked_in_at: new Date(),
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Gagal melakukan check-in',
      [error.message],
      500
    );
  }
}

async function updateQueueStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      'waiting',
      'called',
      'on_the_way',
      'checked_in',
      'in_checkup',
      'completed',
      'missed',
      'cancelled',
    ];

    if (!allowedStatus.includes(status)) {
      return errorResponse(res, 'Status antrean tidak valid', [], 400);
    }

    const [rows] = await pool.query(
      `SELECT id FROM queues WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Antrean tidak ditemukan', [], 404);
    }

    let extraUpdate = '';

    if (status === 'called') {
      extraUpdate = ', called_at = NOW()';
    }

    if (status === 'checked_in') {
      extraUpdate = ', checked_in_at = NOW()';
    }

    if (status === 'completed') {
      extraUpdate = ', completed_at = NOW()';
    }

    if (status === 'cancelled') {
      extraUpdate = ', cancelled_at = NOW()';
    }

    await pool.query(
      `UPDATE queues 
       SET status = ? ${extraUpdate}
       WHERE id = ?`,
      [status, id]
    );

    return successResponse(res, 'Status antrean berhasil diperbarui', {
      id: Number(id),
      status,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      'Gagal memperbarui status antrean',
      [error.message],
      500
    );
  }
}

module.exports = {
  getPublicQueueStatus,
  registerQueue,
  getMyCurrentQueue,
  getTodayQueues,
  checkInQueue,
  updateQueueStatus,
};