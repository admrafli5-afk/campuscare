import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
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
import '../queue/services/queue_service.dart';

class HomeScreen extends StatefulWidget {
  final String userName;

  const HomeScreen({super.key, required this.userName});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;
  Widget? customPage;
  bool isCheckingQueue = false;

  bool get shouldShowBackButton => customPage != null || selectedIndex != 0;

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
              onPressed: () => Navigator.pop(context, false),
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
              onPressed: () => Navigator.pop(context, true),
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

  void backToHome() {
    FocusManager.instance.primaryFocus?.unfocus();

    setState(() {
      selectedIndex = 0;
      customPage = null;
    });
  }

  Future<bool> handleBackButton() async {
    if (shouldShowBackButton) {
      backToHome();
      return false;
    }

    return true;
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

  QueueRegisterScreen queueRegisterPage() {
    return QueueRegisterScreen(
      onSuccess: () {
        openTab(2);
      },
    );
  }

  Future<void> handleQrButtonTap() async {
    if (isCheckingQueue) return;

    FocusManager.instance.primaryFocus?.unfocus();

    setState(() {
      isCheckingQueue = true;
    });

    final storage = SecureStorageService();
    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      final currentQueue = await queueService.getMyCurrentQueue();

      if (!mounted) return;

      if (currentQueue == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Kamu belum punya antrean aktif. Silakan daftar antrean dulu.',
            ),
          ),
        );

        openFeature(queueRegisterPage());
        return;
      }

      openTab(2);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          isCheckingQueue = false;
        });
      }
    }
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

  String currentPageTitle() {
    if (customPage != null) {
      if (customPage is QueueRegisterScreen) return 'Daftar Antrean';
      if (customPage is MedicalHistoryScreen) return 'Riwayat Kesehatan';
      if (customPage is SickLettersScreen) return 'Surat Izin Sakit';
      if (customPage is LiftRecommendationScreen) return 'Rekomendasi Lift';
      if (customPage is HealthProfileScreen) return 'Profil Kesehatan';

      return 'Satya Care';
    }

    switch (selectedIndex) {
      case 1:
        return 'Cek Antrean';
      case 2:
        return 'QR Antrean';
      case 3:
        return 'Pantau Antrean';
      case 4:
        return 'Profil';
      default:
        return 'Satya Care';
    }
  }

  Widget bodyWithBackHeader() {
    if (!shouldShowBackButton) {
      return currentBody();
    }

    return Column(
      children: [
        SafeArea(
          bottom: false,
          child: Container(
            height: 64,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            color: AppColors.background,
            child: Row(
              children: [
                _BackHeaderButton(onTap: backToHome),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    currentPageTitle(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.textDark,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(child: currentBody()),
      ],
    );
  }

  Widget homeContent() {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 128),
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
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Halo, ${widget.userName} 👋',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      'Pantau layanan klinik kampus hari ini.',
                      style: TextStyle(
                        fontSize: 13.5,
                        color: AppColors.textGray,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.notifications_none_rounded,
                  color: AppColors.primaryGreen,
                  size: 25,
                ),
              ),
            ],
          ),

          const SizedBox(height: 22),

          const _ClinicStatusCard(),

          const SizedBox(height: 18),

          _QueueHeroCard(
            onRegisterTap: () => openFeature(queueRegisterPage()),
            onStatusTap: () => openTab(1),
          ),

          const SizedBox(height: 24),

          const Text(
            'Layanan Satya Care',
            style: TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w800,
              color: AppColors.textDark,
            ),
          ),

          const SizedBox(height: 14),

          Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _ServiceGridCard(
                      title: 'Profil Kesehatan',
                      subtitle: 'Alergi dan kontak darurat.',
                      icon: Icons.health_and_safety_outlined,
                      onTap: () => openTab(4),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ServiceGridCard(
                      title: 'Riwayat Kesehatan',
                      subtitle: 'Kunjungan dan pemeriksaan.',
                      icon: Icons.history_outlined,
                      onTap: () => openFeature(const MedicalHistoryScreen()),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _ServiceGridCard(
                      title: 'Surat Izin Sakit',
                      subtitle: 'Dokumen digital klinik.',
                      icon: Icons.description_outlined,
                      onTap: () => openFeature(const SickLettersScreen()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ServiceGridCard(
                      title: 'Rekomendasi Lift',
                      subtitle: 'Akses fasilitas kampus.',
                      icon: Icons.accessible_forward_outlined,
                      onTap: () =>
                          openFeature(const LiftRecommendationScreen()),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget profileContent() {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 128),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Profil',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                        height: 1,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Kelola data diri dan layanan kesehatanmu.',
                      style: TextStyle(
                        fontSize: 13.5,
                        color: AppColors.textGray,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Icon(
                  Icons.notifications_none_rounded,
                  color: AppColors.primaryGreen,
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
                  color: Colors.black.withOpacity(0.035),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 78,
                  height: 78,
                  decoration: BoxDecoration(
                    color: AppColors.softMint,
                    borderRadius: BorderRadius.circular(26),
                  ),
                  child: const Icon(
                    Icons.person_rounded,
                    color: AppColors.primaryGreen,
                    size: 42,
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
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 5),
                      const Text(
                        'Mahasiswa Satya Care',
                        style: TextStyle(
                          color: AppColors.textGray,
                          fontSize: 13.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: const [
                          _SmallBadge(
                            text: 'Mahasiswa Aktif',
                            icon: Icons.check_circle,
                          ),
                          _SmallBadge(
                            text: 'Data Kesehatan',
                            icon: Icons.verified_user,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _ProfileMenuCard(
                  title: 'Profil Kesehatan',
                  subtitle: 'Alergi, penyakit bawaan, dan kontak darurat.',
                  icon: Icons.health_and_safety_outlined,
                  onTap: () => openFeature(const HealthProfileScreen()),
                ),
                const _DividerLine(),
                _ProfileMenuCard(
                  title: 'Riwayat Kesehatan',
                  subtitle: 'Lihat riwayat kunjungan dan pemeriksaan klinik.',
                  icon: Icons.history_outlined,
                  onTap: () => openFeature(const MedicalHistoryScreen()),
                ),
                const _DividerLine(),
                _ProfileMenuCard(
                  title: 'Surat Izin Sakit',
                  subtitle: 'Lihat surat izin sakit digital dari klinik.',
                  icon: Icons.description_outlined,
                  onTap: () => openFeature(const SickLettersScreen()),
                ),
                const _DividerLine(),
                _ProfileMenuCard(
                  title: 'Rekomendasi Lift',
                  subtitle: 'Lihat rekomendasi akses fasilitas kampus.',
                  icon: Icons.accessible_forward_outlined,
                  onTap: () => openFeature(const LiftRecommendationScreen()),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Material(
            color: const Color(0xFFFFE4E6),
            borderRadius: BorderRadius.circular(22),
            child: InkWell(
              borderRadius: BorderRadius.circular(22),
              onTap: () => showLogoutConfirmation(context),
              child: Container(
                padding: const EdgeInsets.all(17),
                child: const Row(
                  children: [
                    Icon(Icons.logout_rounded, color: Colors.red),
                    SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Logout',
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
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

    return WillPopScope(
      onWillPop: handleBackButton,
      child: Scaffold(
        backgroundColor: AppColors.background,
        resizeToAvoidBottomInset: true,
        body: bodyWithBackHeader(),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        floatingActionButton: isKeyboardOpen
            ? null
            : _CenterQrButton(
                active: isQrActive,
                isLoading: isCheckingQueue,
                onTap: handleQrButtonTap,
              ),
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
      ),
    );
  }
}

class _BackHeaderButton extends StatelessWidget {
  final VoidCallback onTap;

  const _BackHeaderButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(15),
      child: InkWell(
        borderRadius: BorderRadius.circular(15),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.045),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.arrow_back_rounded,
            color: AppColors.textDark,
            size: 23,
          ),
        ),
      ),
    );
  }
}

class _ClinicStatusCard extends StatelessWidget {
  const _ClinicStatusCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.035),
            blurRadius: 16,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 58,
                height: 58,
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
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Klinik Sedang Buka',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Kami siap melayani Anda',
                      style: TextStyle(
                        color: AppColors.textGray,
                        fontSize: 13.5,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: AppColors.softMint,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Buka',
                  style: TextStyle(
                    color: AppColors.primaryGreen,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          const Row(
            children: [
              Icon(
                Icons.schedule_outlined,
                color: AppColors.textGray,
                size: 18,
              ),
              SizedBox(width: 7),
              Text(
                '08.00 - 16.00 WIB',
                style: TextStyle(
                  color: AppColors.textGray,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Spacer(),
              Icon(
                Icons.people_alt_outlined,
                color: AppColors.textGray,
                size: 18,
              ),
              SizedBox(width: 7),
              Text(
                'Real-time',
                style: TextStyle(
                  color: AppColors.textGray,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QueueHeroCard extends StatelessWidget {
  final VoidCallback onRegisterTap;
  final VoidCallback onStatusTap;

  const _QueueHeroCard({
    required this.onRegisterTap,
    required this.onStatusTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF06734F), AppColors.primaryGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.25),
            blurRadius: 20,
            offset: const Offset(0, 9),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            top: -6,
            child: Icon(
              Icons.medical_services_outlined,
              color: Colors.white.withOpacity(0.10),
              size: 92,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Antrean Digital',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Ambil nomor antrean dan pantau status pemeriksaan kapan saja.',
                style: TextStyle(
                  color: Colors.white70,
                  height: 1.35,
                  fontSize: 13.5,
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primaryGreen,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(17),
                          ),
                        ),
                        onPressed: onRegisterTap,
                        icon: const Icon(Icons.confirmation_number_outlined),
                        label: const Text(
                          'Ambil Antrean',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    height: 52,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withOpacity(0.55)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(17),
                        ),
                      ),
                      onPressed: onStatusTap,
                      icon: const Icon(Icons.manage_search_rounded),
                      label: const Text(
                        'Cek',
                        style: TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ServiceGridCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _ServiceGridCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 148,
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.025),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.softMint,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Icon(icon, color: AppColors.primaryGreen, size: 23),
                ),
                const Spacer(),
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 11.5,
                    height: 1.25,
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

class _SmallBadge extends StatelessWidget {
  final String text;
  final IconData icon;

  const _SmallBadge({required this.text, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.softMint,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.primaryGreen, size: 14),
          const SizedBox(width: 5),
          Text(
            text,
            style: const TextStyle(
              color: AppColors.primaryGreen,
              fontSize: 11.5,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
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
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.softMint,
                  borderRadius: BorderRadius.circular(17),
                ),
                child: Icon(icon, color: AppColors.primaryGreen, size: 26),
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
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.textGray,
                        fontSize: 12.8,
                        height: 1.32,
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

class _DividerLine extends StatelessWidget {
  const _DividerLine();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 82),
      height: 1,
      color: AppColors.border,
    );
  }
}

class _CenterQrButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool active;
  final bool isLoading;

  const _CenterQrButton({
    required this.onTap,
    required this.active,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: const Offset(0, 7),
      child: GestureDetector(
        onTap: isLoading ? null : onTap,
        child: Container(
          width: 74,
          height: 74,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: active
                  ? [AppColors.leafGreen, AppColors.primaryGreen]
                  : [AppColors.primaryGreen, AppColors.leafGreen],
            ),
            border: Border.all(color: Colors.white, width: 5),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryGreen.withOpacity(0.30),
                blurRadius: 18,
                offset: const Offset(0, 7),
              ),
            ],
          ),
          child: isLoading
              ? const Center(
                  child: SizedBox(
                    width: 23,
                    height: 23,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.4,
                      color: Colors.white,
                    ),
                  ),
                )
              : const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.qr_code_2_rounded,
                      color: Colors.white,
                      size: 27,
                    ),
                    SizedBox(height: 1),
                    Text(
                      'QR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
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
      height: 86,
      padding: const EdgeInsets.fromLTRB(18, 9, 18, 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 22,
            offset: const Offset(0, -5),
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
          const SizedBox(width: 74),
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
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 23),
            const SizedBox(height: 3),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: active ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
