const pool = require('../config/db');

async function createAuditLog({
  userId,
  action,
  module,
  targetId,
  description,
  metadata,
  ipAddress,
  userAgent,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs
       (
        user_id,
        action,
        module,
        target_id,
        description,
        metadata,
        ip_address,
        user_agent
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        module,
        targetId || null,
        description || null,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress || null,
        userAgent || null,
      ]
    );
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
}

function getRequestMeta(req) {
  return {
    ipAddress:
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      req.ip ||
      null,
    userAgent: req.headers['user-agent'] || null,
  };
}

module.exports = {
  createAuditLog,
  getRequestMeta,
};