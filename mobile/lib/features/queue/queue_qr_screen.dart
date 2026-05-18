import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../models/queue_model.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/loading_view.dart';
import '../../shared/widgets/status_badge.dart';
import 'queue_tracking_screen.dart';
import 'services/queue_service.dart';

class QueueQrScreen extends StatefulWidget {
  final QueueModel? queue;

  const QueueQrScreen({super.key, this.queue});

  @override
  State<QueueQrScreen> createState() => _QueueQrScreenState();
}

class _QueueQrScreenState extends State<QueueQrScreen> {
  final storage = SecureStorageService();

  bool isLoading = true;
  String? errorMessage;
  QueueModel? queue;

  @override
  void initState() {
    super.initState();

    if (widget.queue != null) {
      queue = widget.queue;
      isLoading = false;
    } else {
      loadCurrentQueue();
    }
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

  void openTracking(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const QueueTrackingScreen()),
    );
  }

  Widget qrContent(QueueModel data) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 12,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            children: [
              const Text(
                'Nomor Antrean',
                style: TextStyle(color: AppColors.textGray),
              ),
              const SizedBox(height: 6),

              Text(
                data.queueNumber,
                style: const TextStyle(
                  color: AppColors.primaryGreen,
                  fontSize: 42,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 12),

              StatusBadge(status: data.status),

              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.border),
                ),
                child: QrImageView(
                  data: data.qrToken,
                  version: QrVersions.auto,
                  size: 220,
                  backgroundColor: Colors.white,
                ),
              ),

              const SizedBox(height: 22),

              Text(
                'Estimasi pemeriksaan ±${data.estimatedMinutes} menit',
                style: const TextStyle(
                  color: AppColors.textDark,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                data.complaint,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textGray, height: 1.4),
              ),

              const SizedBox(height: 22),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryGreen,
                    side: const BorderSide(color: AppColors.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  onPressed: () => openTracking(context),
                  icon: const Icon(Icons.track_changes_outlined),
                  label: const Text(
                    'Lihat Tracking Antrean',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        const InfoBanner(
          title: 'QR Antrean',
          message:
              'QR ini berasal dari token antrean yang dibuat backend. Tunjukkan QR ini saat check-in di klinik.',
          icon: Icons.qr_code_2,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget body;

    if (isLoading) {
      body = const LoadingView(message: 'Memuat QR antrean...');
    } else if (errorMessage != null) {
      body = ErrorView(message: errorMessage!, onRetry: loadCurrentQueue);
    } else if (queue == null) {
      body = const Center(
        child: Text(
          'Belum ada antrean aktif.',
          style: TextStyle(color: AppColors.textGray),
        ),
      );
    } else {
      body = qrContent(queue!);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('QR Antrean')),
      body: body,
    );
  }
}
