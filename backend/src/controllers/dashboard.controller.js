const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

async function ensureClinicSettingsTable() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS clinic_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      is_open TINYINT(1) NOT NULL DEFAULT 1,
      open_time TIME NOT NULL DEFAULT '08:00:00',
      close_time TIME NOT NULL DEFAULT '16:00:00',
      message VARCHAR(255) NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

    const [rows] = await pool.query(
        `SELECT id FROM clinic_settings ORDER BY id ASC LIMIT 1`
    );

    if (rows.length === 0) {
        await pool.query(`
      INSERT INTO clinic_settings (is_open, open_time, close_time, message)
      VALUES (1, '08:00:00', '16:00:00', NULL)
    `);
    }
}

function formatTimeValue(value) {
    if (!value) return "00:00";

    if (typeof value === "string") {
        return value.slice(0, 5);
    }

    return String(value).slice(0, 5);
}

function getTodayDateTime() {
    const now = new Date();

    return {
        server_time: now.toISOString(),
        local_time: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
        local_date: now.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
        local_day: now.toLocaleDateString("id-ID", {
            weekday: "long",
        }),
    };
}

async function getClinicStatus(req, res) {
    try {
        await ensureClinicSettingsTable();

        const [settingRows] = await pool.query(`
      SELECT
        id,
        is_open,
        open_time,
        close_time,
        updated_at
      FROM clinic_settings
      ORDER BY id ASC
      LIMIT 1
    `);

        const setting = settingRows[0];
        const timeInfo = getTodayDateTime();

        return successResponse(res, "Status klinik berhasil diambil", {
            is_open: Boolean(setting.is_open),
            open_time: formatTimeValue(setting.open_time),
            close_time: formatTimeValue(setting.close_time),
            status_text: setting.is_open ? "Klinik Buka" : "Klinik Tutup",
            updated_at: setting.updated_at,
            ...timeInfo,
        });
    } catch (error) {
        console.error(error);
        return errorResponse(
            res,
            "Gagal mengambil status klinik",
            [error.message],
            500
        );
    }
}

async function getClinicDashboard(req, res) {
    try {
        await ensureClinicSettingsTable();

        const [[queueStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_patients_today,

        SUM(
          CASE 
            WHEN status IN ('waiting', 'on_the_way', 'called') 
            THEN 1 ELSE 0 
          END
        ) AS waiting_queues,

        SUM(
          CASE 
            WHEN status = 'checked_in' 
            THEN 1 ELSE 0 
          END
        ) AS checked_in,

        SUM(
          CASE 
            WHEN status = 'in_checkup' 
            THEN 1 ELSE 0 
          END
        ) AS in_checkup,

        SUM(
          CASE 
            WHEN status = 'completed' 
            THEN 1 ELSE 0 
          END
        ) AS completed_queues

      FROM queues
      WHERE DATE(created_at) = CURDATE()
    `);

        const [[emergencyStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_emergency_today,

        SUM(
          CASE 
            WHEN status IN ('emergency', 'emergency_handled', 'referred', 'stabilized') 
            THEN 1 ELSE 0 
          END
        ) AS active_emergency,

        SUM(
          CASE 
            WHEN status = 'completed' 
            THEN 1 ELSE 0 
          END
        ) AS completed_emergency

      FROM emergency_cases
      WHERE DATE(created_at) = CURDATE()
    `);

        const [[healthCheckStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_health_checks_today
      FROM health_checks
      WHERE DATE(created_at) = CURDATE()
    `);

        const [[sickLetterStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_sick_letters_today,

        SUM(
          CASE 
            WHEN status = 'waiting_validation' 
            THEN 1 ELSE 0 
          END
        ) AS waiting_sick_letters,

        SUM(
          CASE 
            WHEN status = 'approved' 
            THEN 1 ELSE 0 
          END
        ) AS approved_sick_letters

      FROM sick_letters
      WHERE DATE(created_at) = CURDATE()
    `);

        const [recentQueues] = await pool.query(`
      SELECT
        q.id,
        q.queue_number,
        q.status,
        q.complaint,
        q.created_at,
        student_user.name AS student_name,
        s.nim
      FROM queues q
      LEFT JOIN students s ON q.student_id = s.id
      LEFT JOIN users student_user ON s.user_id = student_user.id
      WHERE DATE(q.created_at) = CURDATE()
      ORDER BY q.created_at DESC
      LIMIT 5
    `);

        const [recentEmergencies] = await pool.query(`
      SELECT
        ec.id,
        ec.case_number,
        ec.status,
        ec.condition_type,
        ec.location,
        ec.created_at,
        ec.temporary_patient_name,
        student_user.name AS student_name,
        s.nim
      FROM emergency_cases ec
      LEFT JOIN students s ON ec.student_id = s.id
      LEFT JOIN users student_user ON s.user_id = student_user.id
      WHERE DATE(ec.created_at) = CURDATE()
      ORDER BY ec.created_at DESC
      LIMIT 5
    `);

        const [settingRows] = await pool.query(`
      SELECT
        id,
        is_open,
        open_time,
        close_time,
        updated_at
      FROM clinic_settings
      ORDER BY id ASC
      LIMIT 1
    `);

        const setting = settingRows[0];
        const timeInfo = getTodayDateTime();

        return successResponse(res, "Dashboard klinik berhasil diambil", {
            stats: {
                total_patients_today: Number(queueStats.total_patients_today || 0),
                waiting_queues: Number(queueStats.waiting_queues || 0),
                checked_in: Number(queueStats.checked_in || 0),
                in_checkup: Number(queueStats.in_checkup || 0),
                completed_queues: Number(queueStats.completed_queues || 0),

                total_emergency_today: Number(
                    emergencyStats.total_emergency_today || 0
                ),
                active_emergency: Number(emergencyStats.active_emergency || 0),
                completed_emergency: Number(
                    emergencyStats.completed_emergency || 0
                ),

                total_health_checks_today: Number(
                    healthCheckStats.total_health_checks_today || 0
                ),

                total_sick_letters_today: Number(
                    sickLetterStats.total_sick_letters_today || 0
                ),
                waiting_sick_letters: Number(
                    sickLetterStats.waiting_sick_letters || 0
                ),
                approved_sick_letters: Number(
                    sickLetterStats.approved_sick_letters || 0
                ),
            },

            clinic_status: {
                is_open: Boolean(setting.is_open),
                open_time: formatTimeValue(setting.open_time),
                close_time: formatTimeValue(setting.close_time),
                status_text: setting.is_open ? "Klinik Buka" : "Klinik Tutup",
                updated_at: setting.updated_at,
                ...timeInfo,
            },

            recent: {
                queues: recentQueues,
                emergencies: recentEmergencies,
            },
        });
    } catch (error) {
        console.error(error);
        return errorResponse(
            res,
            "Gagal mengambil dashboard klinik",
            [error.message],
            500
        );
    }
}

async function updateClinicStatus(req, res) {
    try {
        await ensureClinicSettingsTable();

        const { is_open, open_time, close_time } = req.body;

        if (typeof is_open === "undefined") {
            return errorResponse(res, "is_open wajib diisi", [], 400);
        }

        if (!open_time || !close_time) {
            return errorResponse(res, "open_time dan close_time wajib diisi", [], 400);
        }

        const finalOpenTime =
            String(open_time).length === 5 ? `${open_time}:00` : open_time;

        const finalCloseTime =
            String(close_time).length === 5 ? `${close_time}:00` : close_time;

        await pool.query(
            `UPDATE clinic_settings
       SET
        is_open = ?,
        open_time = ?,
        close_time = ?,
        message = NULL,
        updated_by = ?
       ORDER BY id ASC
       LIMIT 1`,
            [
                is_open ? 1 : 0,
                finalOpenTime,
                finalCloseTime,
                req.user.id,
            ]
        );

        return successResponse(res, "Status operasional klinik berhasil diperbarui", {
            is_open: Boolean(is_open),
            open_time,
            close_time,
            status_text: is_open ? "Klinik Buka" : "Klinik Tutup",
        });
    } catch (error) {
        console.error(error);
        return errorResponse(
            res,
            "Gagal memperbarui status operasional klinik",
            [error.message],
            500
        );
    }
}

module.exports = {
    getClinicDashboard,
    getClinicStatus,
    updateClinicStatus,
};