import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/health_profile_model.dart';
import '../../shared/widgets/info_banner.dart';

class HealthProfileScreen extends StatelessWidget {
  const HealthProfileScreen({super.key});

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
          Icon(Icons.health_and_safety_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Profil Kesehatan',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Data kesehatan penting untuk membantu penanganan awal di klinik kampus.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget infoItem({
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
    final profile = HealthProfileModel.dummy();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profil Kesehatan')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          headerCard(),

          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Data Dummy',
            message:
                'Profil kesehatan ini masih dummy. Integrasi data asli dilakukan setelah endpoint profil kesehatan tersedia.',
            icon: Icons.info_outline,
          ),

          const SizedBox(height: 20),

          sectionTitle('Informasi Medis'),

          infoItem(
            title: 'Golongan Darah',
            value: profile.bloodType,
            icon: Icons.bloodtype_outlined,
          ),
          infoItem(
            title: 'Penyakit Bawaan',
            value: profile.congenitalDisease,
            icon: Icons.medical_information_outlined,
          ),
          infoItem(
            title: 'Penyakit Kronis',
            value: profile.chronicDisease,
            icon: Icons.monitor_heart_outlined,
          ),
          infoItem(
            title: 'Alergi Obat',
            value: profile.drugAllergy,
            icon: Icons.medication_liquid_outlined,
          ),
          infoItem(
            title: 'Catatan Medis',
            value: profile.medicalNotes,
            icon: Icons.notes_outlined,
          ),

          const SizedBox(height: 8),

          sectionTitle('Kontak Darurat'),

          infoItem(
            title: 'Nama Kontak Darurat',
            value: profile.emergencyContactName,
            icon: Icons.person_outline,
          ),
          infoItem(
            title: 'Nomor Kontak Darurat',
            value: profile.emergencyContactPhone,
            icon: Icons.phone_outlined,
          ),
          infoItem(
            title: 'Hubungan',
            value: profile.emergencyContactRelation,
            icon: Icons.family_restroom_outlined,
          ),

          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.privacy_tip_outlined, color: AppColors.primaryGreen),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Data kesehatan digunakan untuk membantu penanganan di klinik kampus dan hanya dapat diakses oleh pihak berwenang.',
                    style: TextStyle(color: AppColors.textGray, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
