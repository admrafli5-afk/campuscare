import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import '../auth/login_screen.dart';

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
