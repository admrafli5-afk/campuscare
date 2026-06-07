import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/clinic_status_service.dart';

class HomeScreen extends StatefulWidget {
  final String userName;

  const HomeScreen({
    super.key,
    this.userName = 'Mahasiswa',
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  ClinicStatus? clinicStatus;
  bool isLoadingClinicStatus = false;
  String? clinicStatusError;
  Timer? clinicStatusTimer;

  @override
  void initState() {
    super.initState();

    loadClinicStatus();

    clinicStatusTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => loadClinicStatus(silent: true),
    );
  }

  @override
  void dispose() {
    clinicStatusTimer?.cancel();
    super.dispose();
  }

  Future<void> loadClinicStatus({bool silent = false}) async {
    if (!mounted) return;

    if (!silent) {
      setState(() {
        isLoadingClinicStatus = true;
        clinicStatusError = null;
      });
    }

    try {
      final status = await ClinicStatusService.getClinicStatus();

      if (!mounted) return;

      setState(() {
        clinicStatus = status;
        isLoadingClinicStatus = false;
        clinicStatusError = null;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoadingClinicStatus = false;
        clinicStatusError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove('token');
    await prefs.remove('auth_token');
    await prefs.remove('accessToken');
    await prefs.remove('access_token');

    if (!mounted) return;

    Navigator.pushNamedAndRemoveUntil(
      context,
      '/login',
      (route) => false,
    );
  }

  void goToQueue() {
    if (clinicStatus?.isOpen != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Klinik sedang tutup. Antrean tidak tersedia.'),
        ),
      );
      return;
    }

    // Sesuaikan route ini dengan route antrean di project kamu.
    // Kalau route kamu bukan /queue, ganti di sini.
    Navigator.pushNamed(context, '/queue');
  }

  void goToMedicalHistory() {
    // Sesuaikan route ini dengan route riwayat di project kamu.
    Navigator.pushNamed(context, '/history');
  }

  void goToProfile() {
    // Sesuaikan route ini dengan route profil di project kamu.
    Navigator.pushNamed(context, '/profile');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF047857),
        elevation: 0,
        title: const Text(
          'CampusCare',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
        actions: [
          IconButton(
            onPressed: isLoadingClinicStatus
                ? null
                : () => loadClinicStatus(silent: false),
            icon: const Icon(
              Icons.refresh,
              color: Colors.white,
            ),
            tooltip: 'Refresh Status Klinik',
          ),
          IconButton(
            onPressed: logout,
            icon: const Icon(
              Icons.logout,
              color: Colors.white,
            ),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => loadClinicStatus(silent: false),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              buildHeaderCard(),
              const SizedBox(height: 16),
              buildClinicStatusCard(),
              const SizedBox(height: 16),
              buildQuickActionTitle(),
              const SizedBox(height: 12),
              buildMenuGrid(),
              const SizedBox(height: 24),
              buildInfoCard(),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF047857),
            Color(0xFF10B981),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF047857).withOpacity(0.20),
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
              Icons.local_hospital_rounded,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Halo,',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
                Text(
                  widget.userName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Pantau layanan klinik kampus secara real-time.',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildClinicStatusCard() {
    final bool isOpen = clinicStatus?.isOpen == true;

    Color backgroundColor;
    Color borderColor;
    Color primaryColor;
    IconData icon;
    String title;

    if (isLoadingClinicStatus && clinicStatus == null) {
      backgroundColor = const Color(0xFFEFF6FF);
      borderColor = const Color(0xFF2563EB);
      primaryColor = const Color(0xFF2563EB);
      icon = Icons.sync;
      title = 'Memuat status klinik...';
    } else if (isOpen) {
      backgroundColor = const Color(0xFFE8F8F1);
      borderColor = const Color(0xFF047857);
      primaryColor = const Color(0xFF047857);
      icon = Icons.check_circle_rounded;
      title = 'Klinik Buka';
    } else {
      backgroundColor = const Color(0xFFFFEAEA);
      borderColor = const Color(0xFFDC2626);
      primaryColor = const Color(0xFFDC2626);
      icon = Icons.cancel_rounded;
      title = 'Klinik Tutup';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: borderColor.withOpacity(0.45),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isLoadingClinicStatus && clinicStatus == null)
                SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: primaryColor,
                  ),
                )
              else
                Icon(
                  icon,
                  color: primaryColor,
                  size: 30,
                ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  clinicStatus?.statusText ?? title,
                  style: TextStyle(
                    color: primaryColor,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton(
                onPressed: isLoadingClinicStatus
                    ? null
                    : () => loadClinicStatus(silent: false),
                icon: Icon(
                  Icons.refresh_rounded,
                  color: primaryColor,
                ),
                tooltip: 'Refresh',
              ),
            ],
          ),
          const SizedBox(height: 12),
          buildStatusInfoRow(
            icon: Icons.access_time_rounded,
            label: 'Jam Operasional',
            value: clinicStatus == null
                ? '-'
                : '${clinicStatus!.openTime} - ${clinicStatus!.closeTime}',
          ),
          const SizedBox(height: 8),
          buildStatusInfoRow(
            icon: Icons.calendar_today_rounded,
            label: 'Tanggal',
            value: clinicStatus == null
                ? '-'
                : '${clinicStatus!.localDay}, ${clinicStatus!.localDate}',
          ),
          const SizedBox(height: 8),
          buildStatusInfoRow(
            icon: Icons.schedule_rounded,
            label: 'Waktu Server',
            value: clinicStatus?.localTime ?? '-',
          ),
          if (clinicStatusError != null) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: Colors.red.withOpacity(0.30),
                ),
              ),
              child: Text(
                clinicStatusError!,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget buildStatusInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 18,
          color: const Color(0xFF475569),
        ),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            color: Color(0xFF475569),
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              color: Color(0xFF334155),
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ],
    );
  }

  Widget buildQuickActionTitle() {
    return const Text(
      'Menu Cepat',
      style: TextStyle(
        color: Color(0xFF0F172A),
        fontSize: 20,
        fontWeight: FontWeight.w900,
      ),
    );
  }

  Widget buildMenuGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: 1.05,
      children: [
        buildMenuCard(
          title: clinicStatus?.isOpen == true
              ? 'Ambil Antrean'
              : 'Klinik Tutup',
          subtitle: clinicStatus?.isOpen == true
              ? 'Daftar antrean klinik'
              : 'Antrean dinonaktifkan',
          icon: Icons.confirmation_number_rounded,
          color: const Color(0xFF047857),
          enabled: clinicStatus?.isOpen == true,
          onTap: goToQueue,
        ),
        buildMenuCard(
          title: 'Riwayat Medis',
          subtitle: 'Lihat kunjungan',
          icon: Icons.history_rounded,
          color: const Color(0xFF2563EB),
          enabled: true,
          onTap: goToMedicalHistory,
        ),
        buildMenuCard(
          title: 'Profil',
          subtitle: 'Data mahasiswa',
          icon: Icons.person_rounded,
          color: const Color(0xFF7C3AED),
          enabled: true,
          onTap: goToProfile,
        ),
        buildMenuCard(
          title: 'Refresh',
          subtitle: 'Update status klinik',
          icon: Icons.refresh_rounded,
          color: const Color(0xFFEA580C),
          enabled: !isLoadingClinicStatus,
          onTap: () => loadClinicStatus(silent: false),
        ),
      ],
    );
  }

  Widget buildMenuCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool enabled,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: enabled ? onTap : null,
      borderRadius: BorderRadius.circular(22),
      child: Opacity(
        opacity: enabled ? 1 : 0.55,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: const Color(0xFFE2E8F0),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 28,
                ),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF0F172A),
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
        ),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline_rounded,
            color: Color(0xFF047857),
          ),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Status klinik otomatis diperbarui setiap 10 detik. Kamu juga bisa menekan tombol refresh atau menarik layar ke bawah untuk update manual.',
              style: TextStyle(
                color: Color(0xFF475569),
                fontSize: 13,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}