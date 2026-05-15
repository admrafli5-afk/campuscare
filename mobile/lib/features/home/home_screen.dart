import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/menu_card.dart';
import '../auth/login_screen.dart';
import '../queue/queue_qr_screen.dart';
import '../queue/queue_register_screen.dart';
import '../queue/queue_status_screen.dart';
import '../queue/queue_tracking_screen.dart';
import '../health_profile/health_profile_screen.dart';

class HomeScreen extends StatelessWidget {
  final String userName;

  const HomeScreen({super.key, this.userName = 'Mahasiswa'});

  Future<void> logout(BuildContext context) async {
    final storage = SecureStorageService();

    await storage.deleteToken();

    if (!context.mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> showLogoutConfirmation(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Keluar dari akun?'),
          content: const Text(
            'Kamu akan keluar dari aplikasi CampusCare dan perlu login ulang.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(context, true);
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );

    if (result == true) {
      await logout(context);
    }
  }

  void openPage(BuildContext context, Widget page) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => page));
  }

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
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.18),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(
              Icons.health_and_safety_outlined,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Halo, $userName',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pantau antrean dan layanan kesehatan kampus dari satu aplikasi.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget clinicStatusCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
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
            child: const Icon(
              Icons.local_hospital_outlined,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Klinik Sedang Buka',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Antrean dummy: 5 mahasiswa • Estimasi ±20 menit',
                  style: TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              'Buka',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
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
      appBar: AppBar(
        title: const Text(
          'CampusCare',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () => showLogoutConfirmation(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          headerCard(),
          const SizedBox(height: 16),
          clinicStatusCard(),
          const SizedBox(height: 16),
          const InfoBanner(
            title: 'Mode Persiapan Checkpoint 2',
            message:
                'Fitur antrean dan QR masih menggunakan data dummy sampai API antrean resmi dibuka.',
            icon: Icons.eco_outlined,
          ),
          const SizedBox(height: 24),
          sectionTitle('Layanan Klinik'),
          MenuCard(
            title: 'Cek Antrean Klinik',
            subtitle: 'Lihat jumlah antrean dan estimasi waktu',
            icon: Icons.people_alt_outlined,
            onTap: () => openPage(context, const QueueStatusScreen()),
          ),
          const SizedBox(height: 12),
          MenuCard(
            title: 'Daftar Antrean',
            subtitle: 'Input keluhan dan ambil nomor antrean',
            icon: Icons.add_circle_outline,
            onTap: () => openPage(context, const QueueRegisterScreen()),
          ),
          const SizedBox(height: 12),
          MenuCard(
            title: 'QR Antrean',
            subtitle: 'Tampilkan QR untuk check-in di klinik',
            icon: Icons.qr_code_2,
            onTap: () => openPage(context, const QueueQrScreen()),
          ),
          const SizedBox(height: 12),
          MenuCard(
            title: 'Tracking Antrean',
            subtitle: 'Pantau status antrean saat ini',
            icon: Icons.track_changes_outlined,
            onTap: () => openPage(context, const QueueTrackingScreen()),
          ),
          const SizedBox(height: 24),
          sectionTitle('Administrasi Kesehatan'),
          MenuCard(
            title: 'Profil Kesehatan',
            subtitle: 'Data alergi, penyakit bawaan, dan kontak darurat',
            icon: Icons.health_and_safety_outlined,
            onTap: () => openPage(context, const HealthProfileScreen()),
          ),
          const SizedBox(height: 12),
          MenuCard(
            title: 'Surat Izin Sakit',
            subtitle: 'Lihat surat izin sakit dari klinik',
            icon: Icons.description_outlined,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          MenuCard(
            title: 'Rekomendasi Lift',
            subtitle: 'Lihat rekomendasi fasilitas dari klinik',
            icon: Icons.accessible_forward_outlined,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
