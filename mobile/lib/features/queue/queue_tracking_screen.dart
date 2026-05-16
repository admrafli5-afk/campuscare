import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/loading_view.dart';
import '../../shared/widgets/status_badge.dart';
import 'services/queue_service.dart';

class QueueTrackingScreen extends StatefulWidget {
  const QueueTrackingScreen({super.key});

  @override
  State<QueueTrackingScreen> createState() => _QueueTrackingScreenState();
}

class _QueueTrackingScreenState extends State<QueueTrackingScreen> {
  final storage = SecureStorageService();

  bool isLoading = true;
  String? errorMessage;
  QueueModel? queue;

  @override
  void initState() {
    super.initState();
    loadCurrentQueue();
  }

  Future<void> loadCurrentQueue() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      final result = await queueService.getMyCurrentQueue();

      if (!mounted) return;

      setState(() {
        queue = result;
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

  bool isCompletedStep(String currentStatus, String stepStatus) {
    final order = [
      'waiting',
      'called',
      'on_the_way',
      'checked_in',
      'in_checkup',
      'completed',
    ];

    final currentIndex = order.indexOf(currentStatus);
    final stepIndex = order.indexOf(stepStatus);

    if (currentIndex == -1 || stepIndex == -1) return false;

    return currentIndex > stepIndex;
  }

  bool isActiveStep(String currentStatus, String stepStatus) {
    return currentStatus == stepStatus;
  }

  Widget timelineItem({
    required String title,
    required String description,
    required bool active,
    required bool completed,
    required IconData icon,
    bool isLast = false,
  }) {
    final color = completed || active
        ? AppColors.primaryGreen
        : AppColors.border;
    final iconColor = completed || active ? Colors.white : AppColors.textGray;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: color,
              child: Icon(icon, color: iconColor, size: 20),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 42,
                color: completed ? AppColors.primaryGreen : AppColors.border,
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Container(
            padding: EdgeInsets.only(bottom: isLast ? 4 : 22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: active || completed
                        ? AppColors.textDark
                        : AppColors.textGray,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget activeQueueCard(QueueModel queue) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Antrean Aktif',
            style: TextStyle(color: AppColors.textGray),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              Expanded(
                child: Text(
                  queue.queueNumber,
                  style: const TextStyle(
                    color: AppColors.primaryGreen,
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              StatusBadge(status: queue.status),
            ],
          ),

          const SizedBox(height: 12),

          Text(
            queue.serviceType,
            style: const TextStyle(
              color: AppColors.textDark,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          Text(
            queue.complaint,
            style: const TextStyle(color: AppColors.textGray, height: 1.35),
          ),

          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.schedule_outlined,
                  color: AppColors.primaryGreen,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Estimasi pemeriksaan ±${queue.estimatedMinutes} menit',
                    style: const TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          AppButton(
            text: 'Refresh Status',
            icon: Icons.refresh,
            onPressed: loadCurrentQueue,
          ),
        ],
      ),
    );
  }

  Widget trackingContent(QueueModel queue) {
    final status = queue.status;

    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: loadCurrentQueue,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          activeQueueCard(queue),

          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Status Real-time',
            message:
                'Tarik layar ke bawah atau tekan Refresh Status setelah petugas melakukan check-in QR.',
            icon: Icons.notifications_active_outlined,
          ),

          const SizedBox(height: 24),

          const Text(
            'Perjalanan Antrean',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                timelineItem(
                  title: 'Menunggu',
                  description: 'Pendaftaran antrean berhasil dibuat.',
                  active: isActiveStep(status, 'waiting'),
                  completed: isCompletedStep(status, 'waiting'),
                  icon: Icons.schedule,
                ),
                timelineItem(
                  title: 'Dipanggil',
                  description:
                      'Petugas akan memanggil nomor antrean kamu melalui dashboard klinik.',
                  active: isActiveStep(status, 'called'),
                  completed: isCompletedStep(status, 'called'),
                  icon: Icons.campaign_outlined,
                ),
                timelineItem(
                  title: 'Menuju Klinik',
                  description:
                      'Mahasiswa bersiap menuju klinik setelah nomor antrean mendekat.',
                  active: isActiveStep(status, 'on_the_way'),
                  completed: isCompletedStep(status, 'on_the_way'),
                  icon: Icons.directions_walk_outlined,
                ),
                timelineItem(
                  title: 'Hadir di Klinik',
                  description: 'QR sudah discan oleh petugas klinik.',
                  active: isActiveStep(status, 'checked_in'),
                  completed: isCompletedStep(status, 'checked_in'),
                  icon: Icons.qr_code_scanner,
                ),
                timelineItem(
                  title: 'Sedang Diperiksa',
                  description: 'Mahasiswa sedang dalam proses pemeriksaan.',
                  active: isActiveStep(status, 'in_checkup'),
                  completed: isCompletedStep(status, 'in_checkup'),
                  icon: Icons.medical_services_outlined,
                ),
                timelineItem(
                  title: 'Selesai',
                  description:
                      'Pemeriksaan selesai dan riwayat kunjungan diperbarui.',
                  active: isActiveStep(status, 'completed'),
                  completed: false,
                  icon: Icons.check_circle_outline,
                  isLast: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget emptyQueueView() {
    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: loadCurrentQueue,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          SizedBox(height: 120),
          Icon(Icons.event_busy_outlined, color: AppColors.textGray, size: 64),
          SizedBox(height: 16),
          Text(
            'Belum Ada Antrean Aktif',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Silakan daftar antrean terlebih dahulu untuk melihat tracking antrean.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textGray, height: 1.4),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget body;

    if (isLoading) {
      body = const LoadingView(message: 'Memuat tracking antrean...');
    } else if (errorMessage != null) {
      body = ErrorView(message: errorMessage!, onRetry: loadCurrentQueue);
    } else if (queue == null) {
      body = emptyQueueView();
    } else {
      body = trackingContent(queue!);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Tracking Antrean')),
      body: body,
    );
  }
}
