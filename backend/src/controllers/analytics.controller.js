const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function getDashboardAnalytics(req, res) {
  try {
    const [queueTodayRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM queues WHERE DATE(created_at) = CURDATE()`
    );

    const [activeQueueRows] = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM queues 
       WHERE DATE(created_at) = CURDATE()
       AND status IN ('waiting', 'called', 'on_the_way', 'checked_in', 'in_checkup')`
    );

    const [healthCheckTodayRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM health_checks WHERE DATE(created_at) = CURDATE()`
    );

    const [sickLetterRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM sick_letters`
    );

    const [sickLetterTodayRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM sick_letters WHERE DATE(created_at) = CURDATE()`
    );

    const [emergencyTodayRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM emergency_cases WHERE DATE(created_at) = CURDATE()`
    );

    const [studentRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM students`
    );

    const [dominantComplaints] = await pool.query(
      `SELECT 
        condition_status,
        COUNT(*) AS total
       FROM health_checks
       GROUP BY condition_status
       ORDER BY total DESC
       LIMIT 5`
    );

    const [queueStatusRows] = await pool.query(
      `SELECT 
        status,
        COUNT(*) AS total
       FROM queues
       WHERE DATE(created_at) = CURDATE()
       GROUP BY status`
    );

    return successResponse(res, 'Analytics dashboard berhasil diambil', {
      queue_today: queueTodayRows[0].total,
      active_queue_today: activeQueueRows[0].total,
      health_checks_today: healthCheckTodayRows[0].total,
      sick_letters_total: sickLetterRows[0].total,
      sick_letters_today: sickLetterTodayRows[0].total,
      emergency_today: emergencyTodayRows[0].total,
      students_total: studentRows[0].total,
      dominant_conditions: dominantComplaints,
      queue_status_today: queueStatusRows,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil analytics dashboard', [error.message], 500);
  }
}

module.exports = {
  getDashboardAnalytics,
};