import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
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

  bool isLoading = false;
  bool isChecking = true;
  String? errorMessage;

  String selectedServiceType = 'Pemeriksaan Umum';
  String selectedPriority = 'light';

  final serviceTypes = const [
    'Pemeriksaan Umum',
    'Cedera Ringan',
    'Konsultasi Kesehatan',
    'Keluhan Mendesak',
  ];

  @override
  void initState() {
    super.initState();
    checkExistingQueue();
  }

  @override
  void dispose() {
    complaintController.dispose();
    super.dispose();
  }

  Future<void> checkExistingQueue() async {
    setState(() {
      isChecking = true;
      errorMessage = null;
    });

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

  Future<void> submitQueue() async {
    FocusManager.instance.primaryFocus?.unfocus();

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
      onTap: () {
        setState(() {
          selectedServiceType = value;
        });
      },
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
    );
  }

  Widget formContent() {
    return ListView(
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

        const SizedBox(height: 20),

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

        Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            controller: complaintController,
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

        const SizedBox(height: 18),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.softMint,
            borderRadius: BorderRadius.circular(22),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: AppColors.primaryGreen),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Setelah berhasil daftar, aplikasi akan langsung membuka QR antrean kamu.',
                  style: TextStyle(
                    color: AppColors.primaryGreen,
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
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
            ),
            onPressed: isLoading ? null : submitQueue,
            icon: isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.arrow_forward_rounded),
            label: Text(
              isLoading ? 'Mendaftarkan...' : 'Ambil Nomor Antrean',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
            ),
          ),
        ),
      ],
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
        body: ErrorView(message: errorMessage!, onRetry: checkExistingQueue),
      );
    }

    return Scaffold(backgroundColor: AppColors.background, body: formContent());
  }
}
