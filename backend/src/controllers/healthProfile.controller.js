const HealthProfile = require('../models/healthProfile.model');

// Mengambil profil kesehatan milik user yang sedang login
exports.getMyHealthProfile = async (req, res) => {
    try {
        // req.user.id didapat dari middleware auth (JWT)
        let profile = await HealthProfile.findOne({ studentId: req.user.id });

        // Jika belum ada datanya, buatkan data kosong secara otomatis
        if (!profile) {
            profile = await HealthProfile.create({ studentId: req.user.id });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil profil kesehatan',
            error: error.message
        });
    }
};

// Update profil kesehatan
exports.updateMyHealthProfile = async (req, res) => {
    try {
        let profile = await HealthProfile.findOneAndUpdate(
            { studentId: req.user.id },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profil kesehatan berhasil diperbarui',
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui profil kesehatan',
            error: error.message
        });
    }
};