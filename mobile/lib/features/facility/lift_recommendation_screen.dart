import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/facility_recommendation_model.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class LiftRecommendationScreen extends StatelessWidget {
  const LiftRecommendationScreen({super.key});

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
          Icon(
            Icons.accessible_forward_outlined,
            color: Colors.white,
            size: 42,
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Rekomendasi Lift',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Lihat rekomendasi medis terkait penggunaan fasilitas kampus.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget detailItem({
    required String title,
    required String value,
    required IconData icon,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primaryGreen, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
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

  Widget recommendationCard(FacilityRecommendationModel data) {
    return Container(
      padding: const EdgeInsets.all(18),
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
              const Expanded(
                child: Text(
                  'Rekomendasi Terbaru',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              StatusBadge(status: data.status),
            ],
          ),
          const SizedBox(height: 16),
          detailItem(
            title: 'Nomor Rekomendasi',
            value: data.recommendationNumber,
            icon: Icons.numbers_outlined,
          ),
          detailItem(
            title: 'Nama Mahasiswa',
            value: data.studentName,
            icon: Icons.person_outline,
          ),
          detailItem(
            title: 'NIM / Kelas',
            value: '${data.nim} • ${data.className}',
            icon: Icons.school_outlined,
          ),
          detailItem(
            title: 'Ringkasan Kondisi',
            value: data.conditionSummary,
            icon: Icons.medical_information_outlined,
          ),
          detailItem(
            title: 'Alasan Rekomendasi',
            value: data.recommendationReason,
            icon: Icons.accessible_outlined,
          ),
          detailItem(
            title: 'Masa Rekomendasi',
            value: '${data.startDate} - ${data.endDate}',
            icon: Icons.date_range_outlined,
          ),
          detailItem(
            title: 'Dibuat Oleh',
            value: data.createdBy,
            icon: Icons.verified_user_outlined,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recommendation = FacilityRecommendationModel.dummy();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Rekomendasi Lift')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          headerCard(),
          const SizedBox(height: 16),
          const InfoBanner(
            title: 'Bukan Izin Final',
            message:
                'Klinik hanya memberikan rekomendasi medis. Keputusan akses fasilitas tetap berada pada pihak kampus atau unit terkait.',
            icon: Icons.info_outline,
          ),
          const SizedBox(height: 20),
          recommendationCard(recommendation),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Text(
              'Gunakan rekomendasi ini sebagai dokumen pendukung untuk pengajuan pertimbangan akses fasilitas.',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w600,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
