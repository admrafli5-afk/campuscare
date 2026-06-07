const pool = require('../config/db');

async function generateMedicineCode() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM medicines`
  );

  const nextNumber = Number(rows[0].total) + 1;
  return `MED-${String(nextNumber).padStart(4, '0')}`;
}

async function createStockLog({
  medicineId,
  type,
  quantity,
  stockBefore,
  stockAfter,
  note,
  createdBy,
}) {
  await pool.query(
    `INSERT INTO medicine_stock_logs
     (medicine_id, type, quantity, stock_before, stock_after, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      medicineId,
      type,
      quantity,
      stockBefore,
      stockAfter,
      note || null,
      createdBy || null,
    ]
  );
}

module.exports = {
  generateMedicineCode,
  createStockLog,
};