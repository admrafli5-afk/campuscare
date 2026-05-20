import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../queue/queue_register_screen.dart';
import 'services/queue_service.dart';

class QueueStatusScreen extends StatefulWidget {
  const QueueStatusScreen({super.key});

  @override
  State<QueueStatusScreen> createState() => _QueueStatusScreenState();
}

class _QueueStatusScreenState extends State<QueueStatusScreen> {
  final storage = SecureStorageService();

  bool isLoading = true;
  String? errorMessage;
  Map<String, dynamic>? queueStatus;

  @override
  void initState() {
    super.initState();
    loadQueueStatus();
  }

  Future<void> loadQueueStatus() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      final result = await queueService.getPublicStatus();

      if (!mounted) return;

      setState(() {
        queueStatus = result;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        isLoading = false;
      });
    }
  }

  String clinicStatusLabel(String? status) {
    switch (status) {
      case 'open':
        return 'Klinik Sedang Buka';
      case 'closed':
        return 'Klinik Tutup';
      default:
        return 'Status Klinik';
    }
  }

  String crowdLabel(String? level) {
    switch (level) {
      case 'sepi':
        return 'Sepi';
      case 'sedang':
        return 'Sedang';
      case 'ramai':
        return 'Ramai';
      default:
        return '-';
    }
  }

  String recommendationTitle(String? level) {
    switch (level) {
      case 'sepi':
        return 'Klinik sedang sepi!';
      case 'sedang':
        return 'Antrean cukup stabil';
      case 'ramai':
        return 'Klinik sedang ramai';
      default:
        return 'Pantau antrean klinik';
    }
  }

  String recommendationMessage(String? level) {
    switch (level) {
      case 'sepi':
        return 'Waktu yang tepat untuk berkunjung. Kamu bisa mengambil antrean sekarang.';
      case 'sedang':
        return 'Masih aman untuk mengambil antrean. Tetap pantau estimasi tunggu.';
      case 'ramai':
        return 'Pertimbangkan waktu kedatangan dan pantau status antrean secara berkala.';
      default:
        return 'Cek status antrean sebelum datang ke klinik.';
    }
  }

  Widget statCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
  }) {
    return Container(
      height: 176,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.surface,
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
            child: Icon(icon, color: AppColors.primaryGreen, size: 22),
          ),

          const SizedBox(height: 18),

          SizedBox(
            height: 34,
            width: double.infinity,
            child: FittedBox(
              alignment: Alignment.centerLeft,
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                maxLines: 1,
                style: const TextStyle(
                  color: AppColors.textDark,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),

          const SizedBox(height: 7),

          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.textDark,
              fontSize: 13,
              fontWeight: FontWeight.w800,
              height: 1.1,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            subtitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.textGray,
              fontSize: 11.2,
              height: 1.25,
            ),
          ),
        ],
      ),
    );
  }

  Widget statusContent() {
    final data = queueStatus ?? {};

    final clinicStatus = data['clinic_status']?.toString();
    final currentlyServing = data['currently_serving']?.toString();
    final activeQueueCount = data['active_queue_count']?.toString() ?? '0';
    final estimatedWaitMinutes =
        data['estimated_wait_minutes']?.toString() ?? '0';
    final crowdLevel = data['crowd_level']?.toString();

    final servingText =
        currentlyServing == null ||
            currentlyServing == 'null' ||
            currentlyServing.isEmpty
        ? '-'
        : currentlyServing;

    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: loadQueueStatus,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 140),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cek Antrean Klinik',
                      style: TextStyle(
                        color: AppColors.textDark,
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Data antrean diperbarui secara real-time.',
                      style: TextStyle(
                        color: AppColors.textGray,
                        fontSize: 13.5,
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: loadQueueStatus,
                borderRadius: BorderRadius.circular(15),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Icon(
                    Icons.refresh_rounded,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          Container(
            padding: const EdgeInsets.all(19),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF06734F), AppColors.primaryGreen],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryGreen.withOpacity(0.22),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.local_hospital_outlined,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        clinicStatusLabel(clinicStatus),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF7CFFB2),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 7),
                          Expanded(
                            child: Text(
                              'Kondisi saat ini: ${crowdLabel(crowdLevel)}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Live',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Row(
            children: [
              Expanded(
                child: statCard(
                  title: 'Antrean Aktif',
                  value: activeQueueCount,
                  subtitle: 'Saat ini',
                  icon: Icons.people_alt_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: statCard(
                  title: 'Estimasi Tunggu',
                  value: '±$estimatedWaitMinutes m',
                  subtitle: 'Perkiraan waktu',
                  icon: Icons.schedule_outlined,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: statCard(
                  title: 'Sedang Dilayani',
                  value: servingText,
                  subtitle: 'Pasien',
                  icon: Icons.medical_services_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: statCard(
                  title: 'Kondisi Klinik',
                  value: crowdLabel(crowdLevel),
                  subtitle: 'Tingkat keramaian',
                  icon: Icons.sentiment_satisfied_alt_outlined,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.volunteer_activism_outlined,
                        color: AppColors.primaryGreen,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            recommendationTitle(crowdLevel),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.primaryGreen,
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            recommendationMessage(crowdLevel),
                            style: const TextStyle(
                              color: AppColors.primaryGreen,
                              fontSize: 13.2,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                SizedBox(
                  height: 50,
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const QueueRegisterScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.confirmation_number_outlined),
                    label: const Text(
                      'Ambil Antrean Sekarang',
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                SizedBox(
                  height: 48,
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryGreen,
                      side: const BorderSide(color: AppColors.primaryGreen),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: loadQueueStatus,
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text(
                      'Refresh Status',
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
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
    Widget body;

    if (isLoading) {
      body = const LoadingView(message: 'Memuat status antrean klinik...');
    } else if (errorMessage != null) {
      body = ErrorView(message: errorMessage!, onRetry: loadQueueStatus);
    } else {
      body = statusContent();
    }

    return Scaffold(backgroundColor: AppColors.background, body: body);
  }
}
