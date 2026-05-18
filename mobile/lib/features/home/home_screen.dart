import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import '../auth/login_screen.dart';
import '../facility/lift_recommendation_screen.dart';
import '../health_profile/health_profile_screen.dart';
import '../history/medical_history_screen.dart';
import '../letters/sick_letters_screen.dart';
import '../queue/queue_qr_screen.dart';
import '../queue/queue_register_screen.dart';
import '../queue/queue_status_screen.dart';
import '../queue/queue_tracking_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userName;

  const HomeScreen({super.key, required this.userName});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;
  Widget? customPage;

  Future<void> showLogoutConfirmation(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
          title: const Text(
            'Keluar dari akun?',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: const Text(
            'Kamu akan keluar dari Satya Care dan perlu login ulang untuk menggunakan aplikasi.',
          ),
          actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: const Text('Batal'),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: () {
                Navigator.pop(context, true);
              },
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text('Logout'),
            ),
          ],
        );
      },
    );

    if (result == true) {
      await logout(context);
    }
  }

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

  void openTab(int index) {
    FocusManager.instance.primaryFocus?.unfocus();

    setState(() {
      selectedIndex = index;
      customPage = null;
    });
  }

  void openFeature(Widget page) {
    FocusManager.instance.primaryFocus?.unfocus();

    setState(() {
      customPage = page;
      selectedIndex = -1;
    });
  }

  Widget currentBody() {
    if (customPage != null) {
      return customPage!;
    }

    switch (selectedIndex) {
      case 0:
        return homeContent();
      case 1:
        return const QueueStatusScreen();
      case 2:
        return const QueueQrScreen();
      case 3:
        return const QueueTrackingScreen();
      case 4:
        return profileContent();
      default:
        return homeContent();
    }
  }

  Widget homeContent() {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 130),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Satya Care',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Halo, ${widget.userName}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppColors.textGray,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 22),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    color: AppColors.softMint,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.local_hospital_outlined,
                    color: AppColors.primaryGreen,
                    size: 30,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Klinik Sedang Buka',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Silahkan ambil QR antrean untuk pemeriksaan lebih lanjut.',
                        style: TextStyle(
                          color: AppColors.textGray,
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryGreen.withOpacity(0.22),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Antrean Digital',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 18),

                Row(
                  children: [
                    Expanded(
                      child: _MainActionCard(
                        title: 'Daftar',
                        subtitle: 'Ambil nomor',
                        icon: Icons.add_circle_outline,
                        onTap: () => openFeature(const QueueRegisterScreen()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _MainActionCard(
                        title: 'Cek',
                        subtitle: 'Status antrean',
                        icon: Icons.people_alt_outlined,
                        onTap: () => openTab(1),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 26),

          const Text(
            'Fitur Lainnya',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),

          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.025),
                  blurRadius: 14,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: _SmallFeatureItem(
                    title: 'Profil',
                    icon: Icons.health_and_safety_outlined,
                    onTap: () => openTab(4),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SmallFeatureItem(
                    title: 'Riwayat',
                    icon: Icons.history_outlined,
                    onTap: () => openFeature(const MedicalHistoryScreen()),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SmallFeatureItem(
                    title: 'Surat',
                    icon: Icons.description_outlined,
                    onTap: () => openFeature(const SickLettersScreen()),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SmallFeatureItem(
                    title: 'Lift',
                    icon: Icons.accessible_forward_outlined,
                    onTap: () => openFeature(const LiftRecommendationScreen()),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget profileContent() {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 130),
        children: [
          const Text(
            'Profil',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            widget.userName,
            style: const TextStyle(fontSize: 16, color: AppColors.textGray),
          ),

          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.softMint,
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Icon(
                    Icons.person_outline_rounded,
                    color: AppColors.primaryGreen,
                    size: 34,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.userName,
                        style: const TextStyle(
                          color: AppColors.textDark,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Mahasiswa Satya Care',
                        style: TextStyle(color: AppColors.textGray),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          _ProfileMenuCard(
            title: 'Profil Kesehatan',
            subtitle: 'Data alergi, penyakit bawaan, dan kontak darurat.',
            icon: Icons.health_and_safety_outlined,
            onTap: () => openFeature(const HealthProfileScreen()),
          ),

          const SizedBox(height: 14),

          _ProfileMenuCard(
            title: 'Riwayat Kesehatan',
            subtitle: 'Lihat riwayat kunjungan dan pemeriksaan klinik.',
            icon: Icons.history_outlined,
            onTap: () => openFeature(const MedicalHistoryScreen()),
          ),

          const SizedBox(height: 14),

          _ProfileMenuCard(
            title: 'Surat Izin Sakit',
            subtitle: 'Lihat surat izin sakit digital dari klinik.',
            icon: Icons.description_outlined,
            onTap: () => openFeature(const SickLettersScreen()),
          ),

          const SizedBox(height: 14),

          _ProfileMenuCard(
            title: 'Rekomendasi Lift',
            subtitle: 'Lihat rekomendasi akses fasilitas kampus.',
            icon: Icons.accessible_forward_outlined,
            onTap: () => openFeature(const LiftRecommendationScreen()),
          ),

          const SizedBox(height: 24),

          Material(
            color: const Color(0xFFFFE4E6),
            borderRadius: BorderRadius.circular(22),
            child: InkWell(
              borderRadius: BorderRadius.circular(22),
              onTap: () => showLogoutConfirmation(context),
              child: Container(
                padding: const EdgeInsets.all(18),
                child: const Row(
                  children: [
                    Icon(Icons.logout_rounded, color: Colors.red),
                    SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Logout',
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Icon(Icons.chevron_right_rounded, color: Colors.red),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isKeyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;

    final bool isHomeActive = selectedIndex == 0 && customPage == null;
    final bool isQueueActive = selectedIndex == 1 && customPage == null;
    final bool isQrActive = selectedIndex == 2 && customPage == null;
    final bool isTrackingActive = selectedIndex == 3 && customPage == null;
    final bool isProfileActive = selectedIndex == 4 && customPage == null;

    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: true,
      body: currentBody(),

      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: isKeyboardOpen
          ? null
          : _CenterQrButton(active: isQrActive, onTap: () => openTab(2)),

      bottomNavigationBar: isKeyboardOpen
          ? null
          : _QrBottomBar(
              isHomeActive: isHomeActive,
              isQueueActive: isQueueActive,
              isTrackingActive: isTrackingActive,
              isProfileActive: isProfileActive,
              onHomeTap: () => openTab(0),
              onQueueTap: () => openTab(1),
              onTrackingTap: () => openTab(3),
              onProfileTap: () => openTab(4),
            ),
    );
  }
}

class _MainActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _MainActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withOpacity(0.16),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          height: 132,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.20),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: Colors.white, size: 27),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 17,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(color: Colors.white70, fontSize: 12.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SmallFeatureItem extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _SmallFeatureItem({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.softMint,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: SizedBox(
          height: 70,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: AppColors.primaryGreen, size: 24),
                const SizedBox(height: 6),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    height: 1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileMenuCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _ProfileMenuCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: AppColors.softMint,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Icon(icon, color: AppColors.primaryGreen, size: 27),
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
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.textGray,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.textGray,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CenterQrButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool active;

  const _CenterQrButton({required this.onTap, required this.active});

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: const Offset(0, 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 86,
          height: 86,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: active
                  ? [AppColors.leafGreen, AppColors.primaryGreen]
                  : [AppColors.primaryGreen, AppColors.leafGreen],
            ),
            border: Border.all(color: Colors.white, width: 6),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryGreen.withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.qr_code_2_rounded, color: Colors.white, size: 30),
              SizedBox(height: 2),
              Text(
                'QR',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QrBottomBar extends StatelessWidget {
  final VoidCallback onHomeTap;
  final VoidCallback onQueueTap;
  final VoidCallback onTrackingTap;
  final VoidCallback onProfileTap;

  final bool isHomeActive;
  final bool isQueueActive;
  final bool isTrackingActive;
  final bool isProfileActive;

  const _QrBottomBar({
    required this.onHomeTap,
    required this.onQueueTap,
    required this.onTrackingTap,
    required this.onProfileTap,
    required this.isHomeActive,
    required this.isQueueActive,
    required this.isTrackingActive,
    required this.isProfileActive,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 92,
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _BottomItem(
              icon: Icons.home_rounded,
              label: 'Beranda',
              active: isHomeActive,
              onTap: onHomeTap,
            ),
          ),
          Expanded(
            child: _BottomItem(
              icon: Icons.people_alt_outlined,
              label: 'Antrean',
              active: isQueueActive,
              onTap: onQueueTap,
            ),
          ),

          const SizedBox(width: 86),

          Expanded(
            child: _BottomItem(
              icon: Icons.track_changes_outlined,
              label: 'Pantau',
              active: isTrackingActive,
              onTap: onTrackingTap,
            ),
          ),
          Expanded(
            child: _BottomItem(
              icon: Icons.person_outline_rounded,
              label: 'Profil',
              active: isProfileActive,
              onTap: onProfileTap,
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool active;

  const _BottomItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.active = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primaryGreen : AppColors.textGray;

    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 25),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 11.5,
                fontWeight: active ? FontWeight.bold : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
