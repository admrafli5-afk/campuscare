import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/constants/app_colors.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';
import 'queue_tracking_screen.dart';

class QueueQrScreen extends StatelessWidget {
  const QueueQrScreen({super.key});

  void openTracking(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const QueueTrackingScreen()),
    );
  }

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
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ],
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
                    fontSize: 42,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 12),

                StatusBadge(status: queue.status),

                const SizedBox(height: 24),

                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: QrImageView(
                    data: queue.qrToken,
                    version: QrVersions.auto,
                    size: 220,
                    backgroundColor: Colors.white,
                  ),
                ),

                const SizedBox(height: 22),

                Text(
                  'Estimasi pemeriksaan ±${queue.estimatedMinutes} menit',
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  queue.complaint,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 22),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryGreen,
                      side: const BorderSide(color: AppColors.primaryGreen),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: () => openTracking(context),
                    icon: const Icon(Icons.track_changes_outlined),
                    label: const Text(
                      'Lihat Tracking Antrean',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          const InfoBanner(
            title: 'QR Dummy',
            message:
                'QR asli nanti akan dibuat dari qr_token yang diberikan backend saat mahasiswa mendaftar antrean.',
            icon: Icons.qr_code_2,
          ),
        ],
      ),
    );
  }
}
