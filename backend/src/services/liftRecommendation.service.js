const pool = require('../config/db');

async function generateLiftRecommendationNumber() {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM lift_recommendations
     WHERE MONTH(created_at) = ?
     AND YEAR(created_at) = ?`,
    [month, year]
  );

  const nextNumber = Number(rows[0].total) + 1;
  const sequence = String(nextNumber).padStart(4, '0');

  return `LIFT/CC/${month}/${year}/${sequence}`;
}

function getDefaultLiftRecommendationText() {
  return (
    'Mahasiswa ini direkomendasikan untuk mendapatkan pertimbangan penggunaan fasilitas lift sementara berdasarkan kondisi kesehatan yang tercatat di Klinik Kesehatan Kampus. Keputusan pemberian akses fasilitas sepenuhnya berada pada pihak yang berwenang sesuai kebijakan kampus.'
  );
}

module.exports = {
  generateLiftRecommendationNumber,
  getDefaultLiftRecommendationText,
};