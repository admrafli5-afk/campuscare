const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi', [], 400);
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Email atau password salah', [], 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return errorResponse(res, 'Akun tidak aktif', [], 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah', [], 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      }
    );

    return successResponse(res, 'Login berhasil', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Terjadi kesalahan pada server', [error.message], 500);
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Data user login berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Terjadi kesalahan pada server', [error.message], 500);
  }
}

async function logout(req, res) {
  return successResponse(res, 'Logout berhasil. Hapus token dari client.', null);
}

module.exports = {
  login,
  me,
  logout,
};