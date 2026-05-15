import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/status_badge.dart';

class QueueTrackingScreen extends StatelessWidget {
  const QueueTrackingScreen({super.key});

  Widget timelineItem({
    required String title,
    required String description,
    required bool active,
    required IconData icon,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          backgroundColor: active ? AppColors.primaryGreen : AppColors.border,
          child: Icon(
            icon,
            color: active ? Colors.white : AppColors.textGray,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.only(bottom: 22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: active ? AppColors.textDark : AppColors.textGray,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final queue = QueueModel.dummy();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Tracking Antrean')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Antrean Aktif',
                  style: TextStyle(color: AppColors.textGray),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        queue.queueNumber,
                        style: const TextStyle(
                          color: AppColors.primaryGreen,
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    StatusBadge(status: queue.status),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  queue.complaint,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Estimasi ±${queue.estimatedMinutes} menit',
                  style: const TextStyle(color: AppColors.textGray),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Perjalanan Antrean',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          timelineItem(
            title: 'Menunggu',
            description: 'Pendaftaran antrean berhasil dibuat.',
            active: true,
            icon: Icons.schedule,
          ),
          timelineItem(
            title: 'Dipanggil',
            description: 'Petugas akan memanggil nomor antrean kamu.',
            active: false,
            icon: Icons.campaign_outlined,
          ),
          timelineItem(
            title: 'Hadir di Klinik',
            description: 'QR sudah discan oleh petugas.',
            active: false,
            icon: Icons.qr_code_scanner,
          ),
          timelineItem(
            title: 'Sedang Diperiksa',
            description: 'Mahasiswa sedang dalam proses pemeriksaan.',
            active: false,
            icon: Icons.medical_services_outlined,
          ),
          timelineItem(
            title: 'Selesai',
            description: 'Pemeriksaan selesai.',
            active: false,
            icon: Icons.check_circle_outline,
          ),
        ],
      ),
    );
  }
}
