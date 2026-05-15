import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import '../auth/login_screen.dart';
import '../queue/queue_qr_screen.dart';
import '../queue/queue_register_screen.dart';
import '../queue/queue_status_screen.dart';
import '../queue/queue_tracking_screen.dart';

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

  Widget menuCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: AppColors.softMint,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppColors.primaryGreen),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.textDark,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textGray,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textGray),
          ],
        ),
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
      child: const Row(
        children: [
          Icon(
            Icons.local_hospital_outlined,
            color: AppColors.primaryGreen,
            size: 32,
          ),
          SizedBox(width: 14),
          Expanded(
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
                  style: TextStyle(color: AppColors.textGray, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('CampusCare'),
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
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Halo, $userName',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pantau antrean klinik dan layanan kesehatan kampus dari aplikasi.',
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          clinicStatusCard(),
          const SizedBox(height: 20),
          menuCard(
            title: 'Cek Antrean Klinik',
            subtitle: 'Lihat jumlah antrean dan estimasi waktu',
            icon: Icons.people_alt_outlined,
            onTap: () => openPage(context, const QueueStatusScreen()),
          ),
          const SizedBox(height: 12),
          menuCard(
            title: 'Daftar Antrean',
            subtitle: 'Input keluhan dan ambil nomor antrean',
            icon: Icons.add_circle_outline,
            onTap: () => openPage(context, const QueueRegisterScreen()),
          ),
          const SizedBox(height: 12),
          menuCard(
            title: 'QR Antrean',
            subtitle: 'Tampilkan QR untuk check-in di klinik',
            icon: Icons.qr_code_2,
            onTap: () => openPage(context, const QueueQrScreen()),
          ),
          const SizedBox(height: 12),
          menuCard(
            title: 'Tracking Antrean',
            subtitle: 'Pantau status antrean saat ini',
            icon: Icons.track_changes_outlined,
            onTap: () => openPage(context, const QueueTrackingScreen()),
          ),
          const SizedBox(height: 12),
          menuCard(
            title: 'Profil Kesehatan',
            subtitle: 'Data alergi, penyakit bawaan, dan kontak darurat',
            icon: Icons.health_and_safety_outlined,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          menuCard(
            title: 'Surat Izin Sakit',
            subtitle: 'Lihat surat izin sakit dari klinik',
            icon: Icons.description_outlined,
            onTap: () {},
          ),
          const SizedBox(height: 12),
          menuCard(
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
