const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Token tidak ditemukan', [], 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid atau sudah expired', [], 401);
  }
}

module.exports = authMiddleware;