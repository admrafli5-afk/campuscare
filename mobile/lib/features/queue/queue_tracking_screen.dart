import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class QueueTrackingScreen extends StatelessWidget {
  const QueueTrackingScreen({super.key});

  Widget timelineItem({
    required String title,
    required String description,
    required bool active,
    required bool completed,
    required IconData icon,
  }) {
    final color = completed || active
        ? AppColors.primaryGreen
        : AppColors.border;
    final iconColor = completed || active ? Colors.white : AppColors.textGray;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: color,
              child: Icon(icon, color: iconColor, size: 20),
            ),
            Container(width: 2, height: 42, color: AppColors.border),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Container(
            padding: const EdgeInsets.only(bottom: 22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: active || completed
                        ? AppColors.textDark
                        : AppColors.textGray,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget activeQueueCard(QueueModel queue) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Antrean Aktif',
            style: TextStyle(color: AppColors.textGray),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              Expanded(
                child: Text(
                  queue.queueNumber,
                  style: const TextStyle(
                    color: AppColors.primaryGreen,
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              StatusBadge(status: queue.status),
            ],
          ),

          const SizedBox(height: 12),

          Text(
            queue.serviceType,
            style: const TextStyle(
              color: AppColors.textDark,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            queue.complaint,
            style: const TextStyle(color: AppColors.textGray, height: 1.35),
          ),

          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.schedule_outlined,
                  color: AppColors.primaryGreen,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Estimasi pemeriksaan ±${queue.estimatedMinutes} menit',
                    style: const TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
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
          activeQueueCard(queue),

          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Pantau dari Mana Saja',
            message:
                'Datang ke klinik saat nomor antrean sudah dekat agar tidak terlalu lama menunggu.',
            icon: Icons.notifications_active_outlined,
          ),

          const SizedBox(height: 24),

          sectionTitle('Perjalanan Antrean'),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                timelineItem(
                  title: 'Menunggu',
                  description: 'Pendaftaran antrean berhasil dibuat.',
                  active: true,
                  completed: false,
                  icon: Icons.schedule,
                ),
                timelineItem(
                  title: 'Dipanggil',
                  description:
                      'Petugas akan memanggil nomor antrean kamu melalui dashboard klinik.',
                  active: false,
                  completed: false,
                  icon: Icons.campaign_outlined,
                ),
                timelineItem(
                  title: 'Hadir di Klinik',
                  description: 'QR sudah discan oleh petugas klinik.',
                  active: false,
                  completed: false,
                  icon: Icons.qr_code_scanner,
                ),
                timelineItem(
                  title: 'Sedang Diperiksa',
                  description: 'Mahasiswa sedang dalam proses pemeriksaan.',
                  active: false,
                  completed: false,
                  icon: Icons.medical_services_outlined,
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.border,
                      child: Icon(
                        Icons.check_circle_outline,
                        color: AppColors.textGray,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Selesai',
                              style: TextStyle(
                                color: AppColors.textGray,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Pemeriksaan selesai dan riwayat kunjungan diperbarui.',
                              style: TextStyle(
                                color: AppColors.textGray,
                                fontSize: 13,
                                height: 1.35,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
