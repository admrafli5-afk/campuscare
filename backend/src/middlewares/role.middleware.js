const { errorResponse } = require('../utils/response');

function roleMiddleware(allowedRoles = []) {
  return function (req, res, next) {
    if (!req.user) {
      return errorResponse(res, 'User belum terautentikasi', [], 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Akses ditolak untuk role ini', [], 403);
    }

    return next();
  };
}

module.exports = roleMiddleware;