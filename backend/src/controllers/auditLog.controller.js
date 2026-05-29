const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function getAuditLogs(req, res) {
  try {
    const {
      module,
      action,
      user_id,
      start_date,
      end_date,
      limit = 100,
    } = req.query;

    const conditions = [];
    const params = [];

    if (module) {
      conditions.push('al.module = ?');
      params.push(module);
    }

    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }

    if (user_id) {
      conditions.push('al.user_id = ?');
      params.push(user_id);
    }

    if (start_date) {
      conditions.push('DATE(al.created_at) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(al.created_at) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const finalLimit = Math.min(Number(limit) || 100, 300);

    const [rows] = await pool.query(
      `SELECT
        al.id,
        al.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        al.action,
        al.module,
        al.target_id,
        al.description,
        al.metadata,
        al.ip_address,
        al.user_agent,
        al.created_at
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [...params, finalLimit]
    );

    return successResponse(res, 'Audit log berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil audit log', [error.message], 500);
  }
}

module.exports = {
  getAuditLogs,
};