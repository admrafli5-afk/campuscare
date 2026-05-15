import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class QueueStatusScreen extends StatelessWidget {
  const QueueStatusScreen({super.key});

  Widget summaryCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.primaryGreen, size: 28),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                color: AppColors.textGray,
                fontSize: 13,
                height: 1.35,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget queueItem({
    required String number,
    required String name,
    required String complaint,
    required String status,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  color: AppColors.primaryGreen,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  complaint,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          StatusBadge(status: status),
        ],
      ),
    );
  }

  Widget clinicHeader() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Row(
        children: [
          Icon(Icons.local_hospital_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Klinik Sedang Buka',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Pantau antrean sebelum datang ke klinik agar tidak menunggu terlalu lama.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
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
      padding: const EdgeInsets.only(bottom: 12),
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Cek Antrean Klinik')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          clinicHeader(),
          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Data Dummy',
            message:
                'Data antrean ini masih dummy untuk persiapan Checkpoint 2.',
            icon: Icons.info_outline,
          ),

          const SizedBox(height: 20),

          Row(
            children: [
              summaryCard(
                title: 'Mahasiswa menunggu',
                value: '5',
                icon: Icons.people_alt_outlined,
              ),
              const SizedBox(width: 12),
              summaryCard(
                title: 'Estimasi layanan',
                value: '±20m',
                icon: Icons.schedule_outlined,
              ),
            ],
          ),

          const SizedBox(height: 24),
          sectionTitle('Antrean Hari Ini'),

          queueItem(
            number: 'A1',
            name: 'Rafli Akbar',
            complaint: 'Demam ringan',
            status: 'waiting',
          ),
          queueItem(
            number: 'A2',
            name: 'Siti Aisyah',
            complaint: 'Sakit kepala',
            status: 'waiting',
          ),
          queueItem(
            number: 'A3',
            name: 'Budi Santoso',
            complaint: 'Sakit gigi',
            status: 'called',
          ),
          queueItem(
            number: 'A4',
            name: 'Nadia Putri',
            complaint: 'Nyeri perut',
            status: 'checked_in',
          ),
        ],
      ),
    );
  }
}
