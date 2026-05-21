const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const {
  generateMedicineCode,
  createStockLog,
} = require('../services/medicineStock.service');

async function getMedicines(req, res) {
  try {
    const { search, category, low_stock } = req.query;

    const conditions = ['is_active = 1'];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR medicine_code LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (low_stock === 'true') {
      conditions.push('stock <= minimum_stock');
    }

    const [rows] = await pool.query(
      `SELECT 
        id,
        medicine_code,
        name,
        category,
        unit,
        stock,
        minimum_stock,
        expired_date,
        description,
        is_active,
        created_at,
        updated_at,
        CASE
          WHEN stock <= minimum_stock THEN 'low_stock'
          ELSE 'normal'
        END AS stock_status
       FROM medicines
       WHERE ${conditions.join(' AND ')}
       ORDER BY name ASC`,
      params
    );

    return successResponse(res, 'Data obat berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil data obat', [error.message], 500);
  }
}

async function getLowStockMedicines(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        medicine_code,
        name,
        category,
        unit,
        stock,
        minimum_stock,
        expired_date,
        description,
        created_at,
        updated_at
       FROM medicines
       WHERE is_active = 1
       AND stock <= minimum_stock
       ORDER BY stock ASC`
    );

    return successResponse(res, 'Data obat stok menipis berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil obat stok menipis', [error.message], 500);
  }
}

async function getMedicineById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        id,
        medicine_code,
        name,
        category,
        unit,
        stock,
        minimum_stock,
        expired_date,
        description,
        is_active,
        created_at,
        updated_at
       FROM medicines
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Obat tidak ditemukan', [], 404);
    }

    return successResponse(res, 'Detail obat berhasil diambil', rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil detail obat', [error.message], 500);
  }
}

async function createMedicine(req, res) {
  try {
    const {
      medicine_code,
      name,
      category,
      unit,
      stock,
      minimum_stock,
      expired_date,
      description,
    } = req.body;

    if (!name) {
      return errorResponse(res, 'Nama obat wajib diisi', [], 400);
    }

    const finalMedicineCode = medicine_code || await generateMedicineCode();
    const initialStock = Number(stock || 0);
    const minimumStock = Number(minimum_stock || 10);

    if (initialStock < 0) {
      return errorResponse(res, 'Stok awal tidak boleh kurang dari 0', [], 400);
    }

    const [duplicateRows] = await pool.query(
      `SELECT id FROM medicines WHERE medicine_code = ? LIMIT 1`,
      [finalMedicineCode]
    );

    if (duplicateRows.length > 0) {
      return errorResponse(res, 'Kode obat sudah digunakan', [], 409);
    }

    const [result] = await pool.query(
      `INSERT INTO medicines
       (
        medicine_code,
        name,
        category,
        unit,
        stock,
        minimum_stock,
        expired_date,
        description
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalMedicineCode,
        name,
        category || null,
        unit || 'tablet',
        initialStock,
        minimumStock,
        expired_date || null,
        description || null,
      ]
    );

    if (initialStock > 0) {
      await createStockLog({
        medicineId: result.insertId,
        type: 'in',
        quantity: initialStock,
        stockBefore: 0,
        stockAfter: initialStock,
        note: 'Stok awal obat',
        createdBy: req.user.id,
      });
    }

    return successResponse(
      res,
      'Obat berhasil ditambahkan',
      {
        id: result.insertId,
        medicine_code: finalMedicineCode,
        name,
        stock: initialStock,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal menambahkan obat', [error.message], 500);
  }
}

async function updateMedicine(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      unit,
      minimum_stock,
      expired_date,
      description,
      is_active,
    } = req.body;

    const [rows] = await pool.query(
      `SELECT id FROM medicines WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Obat tidak ditemukan', [], 404);
    }

    await pool.query(
      `UPDATE medicines
       SET 
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        minimum_stock = COALESCE(?, minimum_stock),
        expired_date = COALESCE(?, expired_date),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ?? null,
        category ?? null,
        unit ?? null,
        minimum_stock ?? null,
        expired_date ?? null,
        description ?? null,
        is_active ?? null,
        id,
      ]
    );

    return successResponse(res, 'Data obat berhasil diperbarui', {
      id: Number(id),
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal memperbarui data obat', [error.message], 500);
  }
}

async function updateMedicineStock(req, res) {
  try {
    const { id } = req.params;
    const { type, quantity, note } = req.body;

    const allowedTypes = ['in', 'out', 'adjust'];

    if (!allowedTypes.includes(type)) {
      return errorResponse(res, 'Tipe stok tidak valid', [], 400);
    }

    const finalQuantity = Number(quantity);

    if (!finalQuantity || finalQuantity <= 0) {
      return errorResponse(res, 'Quantity harus lebih dari 0', [], 400);
    }

    const [rows] = await pool.query(
      `SELECT id, stock FROM medicines WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Obat tidak ditemukan', [], 404);
    }

    const medicine = rows[0];
    const stockBefore = Number(medicine.stock);

    let stockAfter = stockBefore;

    if (type === 'in') {
      stockAfter = stockBefore + finalQuantity;
    }

    if (type === 'out') {
      if (stockBefore < finalQuantity) {
        return errorResponse(res, 'Stok obat tidak mencukupi', [], 400);
      }

      stockAfter = stockBefore - finalQuantity;
    }

    if (type === 'adjust') {
      stockAfter = finalQuantity;
    }

    await pool.query(
      `UPDATE medicines SET stock = ? WHERE id = ?`,
      [stockAfter, id]
    );

    await createStockLog({
      medicineId: id,
      type,
      quantity: finalQuantity,
      stockBefore,
      stockAfter,
      note,
      createdBy: req.user.id,
    });

    return successResponse(res, 'Stok obat berhasil diperbarui', {
      id: Number(id),
      type,
      quantity: finalQuantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal memperbarui stok obat', [error.message], 500);
  }
}

async function getMedicineStockLogs(req, res) {
  try {
    const { id } = req.params;

    const [medicineRows] = await pool.query(
      `SELECT id FROM medicines WHERE id = ? LIMIT 1`,
      [id]
    );

    if (medicineRows.length === 0) {
      return errorResponse(res, 'Obat tidak ditemukan', [], 404);
    }

    const [rows] = await pool.query(
      `SELECT
        msl.id,
        msl.medicine_id,
        msl.type,
        msl.quantity,
        msl.stock_before,
        msl.stock_after,
        msl.note,
        msl.created_at,
        u.name AS created_by_name
       FROM medicine_stock_logs msl
       LEFT JOIN users u ON msl.created_by = u.id
       WHERE msl.medicine_id = ?
       ORDER BY msl.created_at DESC`,
      [id]
    );

    return successResponse(res, 'Riwayat stok obat berhasil diambil', rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Gagal mengambil riwayat stok obat', [error.message], 500);
  }
}

module.exports = {
  getMedicines,
  getLowStockMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  updateMedicineStock,
  getMedicineStockLogs,
};