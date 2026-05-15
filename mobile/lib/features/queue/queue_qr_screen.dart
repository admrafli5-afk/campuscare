import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/constants/app_colors.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/status_badge.dart';

class QueueQrScreen extends StatelessWidget {
  const QueueQrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final queue = QueueModel.dummy();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('QR Antrean')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                const Text(
                  'Nomor Antrean',
                  style: TextStyle(color: AppColors.textGray),
                ),
                const SizedBox(height: 6),
                Text(
                  queue.queueNumber,
                  style: const TextStyle(
                    color: AppColors.primaryGreen,
                    fontSize: 38,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                StatusBadge(status: queue.status),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: QrImageView(
                    data: queue.qrToken,
                    version: QrVersions.auto,
                    size: 220,
                    backgroundColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Estimasi pemeriksaan ±${queue.estimatedMinutes} menit',
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Tunjukkan QR ini kepada petugas klinik saat tiba. Data ini masih dummy untuk persiapan Checkpoint 2.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textGray),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Text(
              'QR asli nanti akan dibuat dari qr_token yang diberikan backend saat mahasiswa mendaftar antrean.',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
