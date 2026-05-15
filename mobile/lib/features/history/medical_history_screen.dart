import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/medical_history_model.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class MedicalHistoryScreen extends StatelessWidget {
  const MedicalHistoryScreen({super.key});

  Widget headerCard() {
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
          Icon(Icons.history_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Riwayat Kesehatan',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Lihat riwayat kunjungan dan pemeriksaan klinik kampus.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget historyCard(MedicalHistoryModel history) {
    return Container(
      padding: const EdgeInsets.all(18),
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.calendar_month_outlined,
                color: AppColors.primaryGreen,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  history.visitDate,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
              StatusBadge(status: history.status),
            ],
          ),

          const SizedBox(height: 14),

          infoLine(
            title: 'Keluhan',
            value: history.complaint,
            icon: Icons.sick_outlined,
          ),
          infoLine(
            title: 'Diagnosis',
            value: history.diagnosis,
            icon: Icons.medical_information_outlined,
          ),
          infoLine(
            title: 'Jenis Layanan',
            value: history.serviceType,
            icon: Icons.local_hospital_outlined,
          ),
          infoLine(
            title: 'Petugas',
            value: history.officer,
            icon: Icons.verified_user_outlined,
          ),
          infoLine(
            title: 'Catatan',
            value: history.notes,
            icon: Icons.notes_outlined,
          ),
        ],
      ),
    );
  }

  Widget infoLine({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.primaryGreen),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w600,
                    height: 1.35,
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
      padding: const EdgeInsets.only(top: 8, bottom: 12),
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
    final histories = MedicalHistoryModel.dummyList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Riwayat Kesehatan')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          headerCard(),

          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Data Dummy',
            message:
                'Riwayat kesehatan ini masih dummy. Data asli akan tampil setelah pemeriksaan disimpan oleh klinik.',
            icon: Icons.info_outline,
          ),

          const SizedBox(height: 20),

          sectionTitle('Timeline Kunjungan'),

          ...histories.map(historyCard),
        ],
      ),
    );
  }
}
