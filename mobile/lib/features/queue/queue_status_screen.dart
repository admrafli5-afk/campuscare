import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
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

  IconData crowdIcon(String? level) {
    switch (level) {
      case 'sepi':
        return Icons.sentiment_satisfied_alt_outlined;
      case 'sedang':
        return Icons.people_alt_outlined;
      case 'ramai':
        return Icons.groups_2_outlined;
      default:
        return Icons.info_outline;
    }
  }

  Widget summaryCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.softMint,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppColors.primaryGreen, size: 23),
            ),
            const SizedBox(height: 14),
            Text(
              value,
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(color: AppColors.textGray, fontSize: 13),
            ),
          ],
        ),
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
    final note =
        data['note']?.toString() ??
        'Estimasi dapat berubah sesuai kondisi klinik.';

    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: loadQueueStatus,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
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
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        clinicStatusLabel(clinicStatus),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 21,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Data antrean diambil langsung dari backend.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.82),
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Row(
            children: [
              summaryCard(
                title: 'Antrean Aktif',
                value: activeQueueCount,
                icon: Icons.people_alt_outlined,
              ),
              const SizedBox(width: 12),
              summaryCard(
                title: 'Estimasi Tunggu',
                value: '±$estimatedWaitMinutes m',
                icon: Icons.schedule_outlined,
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              summaryCard(
                title: 'Sedang Dilayani',
                value:
                    currentlyServing == null ||
                        currentlyServing == 'null' ||
                        currentlyServing.isEmpty
                    ? '-'
                    : currentlyServing,
                icon: Icons.medical_services_outlined,
              ),
              const SizedBox(width: 12),
              summaryCard(
                title: 'Kondisi Klinik',
                value: crowdLabel(crowdLevel),
                icon: crowdIcon(crowdLevel),
              ),
            ],
          ),

          const SizedBox(height: 18),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(22),
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
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: const Icon(
                    Icons.info_outline,
                    color: AppColors.primaryGreen,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    note,
                    style: const TextStyle(
                      color: AppColors.textGray,
                      height: 1.45,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          SizedBox(
            height: 52,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: loadQueueStatus,
              icon: const Icon(Icons.refresh),
              label: const Text(
                'Refresh Status',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
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

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Cek Antrean Klinik')),
      body: body,
    );
  }
}
