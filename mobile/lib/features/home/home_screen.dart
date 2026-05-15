import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  Widget menuCard(String title, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primaryGreen),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textGray),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('CampusCare')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Halo, Mahasiswa',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Pantau antrean klinik dan layanan kesehatan kampus dari aplikasi.',
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          menuCard('Cek Antrean Klinik', Icons.people_alt_outlined),
          const SizedBox(height: 12),
          menuCard('Daftar Antrean', Icons.add_circle_outline),
          const SizedBox(height: 12),
          menuCard('QR Antrean', Icons.qr_code_2),
          const SizedBox(height: 12),
          menuCard('Profil Kesehatan', Icons.health_and_safety_outlined),
          const SizedBox(height: 12),
          menuCard('Surat Izin Sakit', Icons.description_outlined),
          const SizedBox(height: 12),
          menuCard('Rekomendasi Lift', Icons.accessible_forward_outlined),
        ],
      ),
    );
  }
}
