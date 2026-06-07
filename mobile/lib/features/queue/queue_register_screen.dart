import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../services/clinic_status_service.dart';
import 'services/queue_service.dart';

class QueueRegisterScreen extends StatefulWidget {
  final VoidCallback? onSuccess;

  const QueueRegisterScreen({super.key, this.onSuccess});

  @override
  State<QueueRegisterScreen> createState() => _QueueRegisterScreenState();
}

class _QueueRegisterScreenState extends State<QueueRegisterScreen> {
  final storage = SecureStorageService();
  final complaintController = TextEditingController();

  ClinicStatus? clinicStatus;
  bool isLoadingClinicStatus = false;
  String? clinicStatusError;

  bool isLoading = false;
  bool isChecking = true;
  String? errorMessage;

  String selectedServiceType = 'Pemeriksaan Umum';
  String selectedPriority = 'light';

  bool get isClinicOpen => clinicStatus?.isOpen == true;

  final serviceTypes = const [
    'Pemeriksaan Umum',
    'Cedera Ringan',
    'Konsultasi Kesehatan',
    'Keluhan Mendesak',
  ];

  @override
  void initState() {
    super.initState();

    loadInitialData();
  }

  @override
  void dispose() {
    complaintController.dispose();
    super.dispose();
  }

  Future<void> loadInitialData() async {
    await loadClinicStatus();
    await checkExistingQueue();
  }

  Future<void> loadClinicStatus() async {
    if (!mounted) return;

    setState(() {
      isLoadingClinicStatus = true;
      clinicStatusError = null;
    });

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

  Future<void> refreshPage() async {
    await loadClinicStatus();
    await checkExistingQueue(showLoading: false);
  }

  Future<void> checkExistingQueue({bool showLoading = true}) async {
    if (showLoading) {
      setState(() {
        isChecking = true;
        errorMessage = null;
      });
    } else {
      setState(() {
        errorMessage = null;
      });
    }

    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      final currentQueue = await queueService.getMyCurrentQueue();

      if (!mounted) return;

      if (currentQueue != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Kamu sudah memiliki antrean aktif. Membuka QR antrean.',
            ),
            backgroundColor: AppColors.primaryGreen,
          ),
        );

        widget.onSuccess?.call();
        return;
      }

      setState(() {
        isChecking = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        isChecking = false;
      });
    }
  }

  String detectPriority(String complaint) {
    final value = complaint.toLowerCase();

    if (value.contains('pingsan') ||
        value.contains('sesak') ||
        value.contains('darah') ||
        value.contains('darurat') ||
        value.contains('parah')) {
      return 'urgent';
    }

    if (value.contains('demam') ||
        value.contains('muntah') ||
        value.contains('jatuh') ||
        value.contains('cedera') ||
        value.contains('sakit')) {
      return 'medium';
    }

    return 'light';
  }

  String formatDisplayTime(String? value) {
    if (value == null || value.isEmpty || value == '-') {
      return 'Real-time';
    }

    final cleanValue = value.replaceAll('.', ':');
    final parts = cleanValue.split(':');

    if (parts.length >= 2) {
      return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
    }

    return value;
  }

  Future<void> submitQueue() async {
    FocusManager.instance.primaryFocus?.unfocus();

    if (!isClinicOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            clinicStatus == null
                ? 'Status klinik belum dimuat. Tekan refresh terlebih dahulu.'
                : 'Klinik sedang tutup. Pendaftaran antrean tidak tersedia.',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final complaint = complaintController.text.trim();

    if (complaint.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Keluhan wajib diisi.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
      selectedPriority = detectPriority(complaint);
    });

    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      await queueService.registerQueue(
        complaint: complaint,
        serviceType: selectedServiceType,
        priorityLevel: selectedPriority,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Antrean berhasil dibuat. QR antrean sudah tersedia.'),
          backgroundColor: AppColors.primaryGreen,
        ),
      );

      widget.onSuccess?.call();
    } catch (e) {
      if (!mounted) return;

      final message = e.toString().replaceFirst('Exception: ', '');

      setState(() {
        errorMessage = message;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Widget serviceTypeChip(String value) {
    final active = selectedServiceType == value;

    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: isClinicOpen
          ? () {
              setState(() {
                selectedServiceType = value;
              });
            }
          : null,
      child: Opacity(
        opacity: isClinicOpen ? 1 : 0.55,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: active ? AppColors.primaryGreen : AppColors.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: active ? AppColors.primaryGreen : AppColors.border,
            ),
          ),
          child: Text(
            value,
            style: TextStyle(
              color: active ? Colors.white : AppColors.textDark,
              fontWeight: FontWeight.w700,
              fontSize: 12.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget clinicStatusCard() {
    final bool open = isClinicOpen;

    final Color statusColor = open ? AppColors.primaryGreen : Colors.red;
    final Color statusBackground =
        open ? AppColors.softMint : const Color(0xFFFFE4E6);

    final String title = isLoadingClinicStatus && clinicStatus == null
        ? 'Memuat Status Klinik'
        : clinicStatus?.statusText ?? 'Status Klinik Tidak Tersedia';

    final String description = isLoadingClinicStatus && clinicStatus == null
        ? 'Sedang mengambil status dari server...'
        : open
            ? 'Pendaftaran antrean sedang tersedia.'
            : 'Pendaftaran antrean ditutup sementara.';

    final String operationalTime = clinicStatus == null
        ? '-'
        : '${clinicStatus!.openTime} - ${clinicStatus!.closeTime} WIB';

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
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
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: statusBackground,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: isLoadingClinicStatus && clinicStatus == null
                    ? Padding(
                        padding: const EdgeInsets.all(15),
                        child: CircularProgressIndicator(
                          strokeWidth: 2.3,
                          color: statusColor,
                        ),
                      )
                    : Icon(
                        open
                            ? Icons.local_hospital_outlined
                            : Icons.lock_outline_rounded,
                        color: statusColor,
                        size: 28,
                      ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.textDark,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: const TextStyle(
                        color: AppColors.textGray,
                        fontSize: 12.8,
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: isLoadingClinicStatus ? null : refreshPage,
                icon: Icon(
                  Icons.refresh_rounded,
                  color: statusColor,
                ),
                tooltip: 'Refresh Status Klinik',
              ),
            ],
          ),
          const SizedBox(height: 13),
          Container(height: 1, color: AppColors.border),
          const SizedBox(height: 11),
          Row(
            children: [
              const Icon(
                Icons.schedule_outlined,
                color: AppColors.textGray,
                size: 18,
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  operationalTime,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 12.8,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const Icon(
                Icons.sync_rounded,
                color: AppColors.textGray,
                size: 18,
              ),
              const SizedBox(width: 7),
              Text(
                formatDisplayTime(clinicStatus?.localTime),
                style: const TextStyle(
                  color: AppColors.textGray,
                  fontSize: 12.8,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          if (clinicStatusError != null) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: const Color(0xFFFFE4E6),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                clinicStatusError!,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget formContent() {
    return RefreshIndicator(
      onRefresh: refreshPage,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 140),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
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
            child: const Row(
              children: [
                Icon(
                  Icons.confirmation_number_outlined,
                  color: Colors.white,
                  size: 42,
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Text(
                    'Isi keluhan dan pilih jenis layanan untuk mengambil nomor antrean klinik.',
                    style: TextStyle(
                      color: Colors.white,
                      height: 1.4,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          clinicStatusCard(),

          if (errorMessage != null)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFE4E6),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      errorMessage!,
                      style: const TextStyle(
                        color: Colors.red,
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const Text(
            'Jenis Layanan',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),

          const SizedBox(height: 12),

          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: serviceTypes.map(serviceTypeChip).toList(),
          ),

          const SizedBox(height: 22),

          const Text(
            'Keluhan',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),

          const SizedBox(height: 10),

          Opacity(
            opacity: isClinicOpen ? 1 : 0.55,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
              ),
              child: TextField(
                controller: complaintController,
                enabled: isClinicOpen,
                minLines: 5,
                maxLines: 8,
                textInputAction: TextInputAction.newline,
                decoration: const InputDecoration(
                  hintText:
                      'Contoh: Demam sejak tadi malam dan kepala terasa pusing.',
                  hintStyle: TextStyle(color: AppColors.textGray),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.all(18),
                ),
              ),
            ),
          ),

          const SizedBox(height: 18),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isClinicOpen
                  ? AppColors.softMint
                  : const Color(0xFFFFE4E6),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  isClinicOpen
                      ? Icons.info_outline
                      : Icons.lock_outline_rounded,
                  color: isClinicOpen ? AppColors.primaryGreen : Colors.red,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    isClinicOpen
                        ? 'Setelah berhasil daftar, aplikasi akan langsung membuka QR antrean kamu.'
                        : 'Klinik sedang tutup. Kamu belum bisa mengambil antrean saat ini.',
                    style: TextStyle(
                      color: isClinicOpen ? AppColors.primaryGreen : Colors.red,
                      fontWeight: FontWeight.w700,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          SizedBox(
            height: 54,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                disabledBackgroundColor: const Color(0xFFCBD5E1),
                disabledForegroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
              ),
              onPressed: isLoading || !isClinicOpen ? null : submitQueue,
              icon: isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: Colors.white,
                      ),
                    )
                  : Icon(
                      isClinicOpen
                          ? Icons.arrow_forward_rounded
                          : Icons.lock_outline_rounded,
                    ),
              label: Text(
                isLoading
                    ? 'Mendaftarkan...'
                    : isClinicOpen
                        ? 'Ambil Nomor Antrean'
                        : 'Klinik Sedang Tutup',
                style:
                    const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isChecking) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: LoadingView(message: 'Memeriksa antrean aktif...'),
      );
    }

    if (errorMessage != null && complaintController.text.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: ErrorView(message: errorMessage!, onRetry: refreshPage),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: formContent(),
    );
  }
}