import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/info_banner.dart';
import 'queue_qr_screen.dart';
import 'services/queue_service.dart';

class QueueRegisterScreen extends StatefulWidget {
  const QueueRegisterScreen({super.key});

  @override
  State<QueueRegisterScreen> createState() => _QueueRegisterScreenState();
}

class _QueueRegisterScreenState extends State<QueueRegisterScreen> {
  final complaintController = TextEditingController();
  final storage = SecureStorageService();

  String selectedService = 'Pemeriksaan Umum';
  String selectedPriority = 'light';
  bool isLoading = false;

  @override
  void dispose() {
    complaintController.dispose();
    super.dispose();
  }

  Future<void> submitQueue() async {
    final complaint = complaintController.text.trim();

    if (complaint.isEmpty) {
      showMessage('Keluhan wajib diisi');
      return;
    }

    setState(() {
      isLoading = true;
    });

    final apiClient = ApiClient(storage: storage);
    final queueService = QueueService(apiClient: apiClient);

    try {
      final queue = await queueService.registerQueue(
        complaint: complaint,
        serviceType: selectedService,
        priorityLevel: selectedPriority,
      );

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => QueueQrScreen(queue: queue)),
      );
    } catch (e) {
      showMessage(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.danger),
    );
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.bold,
          fontSize: 15,
        ),
      ),
    );
  }

  Widget header() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Row(
        children: [
          Icon(Icons.add_circle_outline, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Daftar Antrean',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Isi keluhan awal agar petugas dapat melakukan triage sederhana.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String priorityLabel(String value) {
    switch (value) {
      case 'light':
        return 'Ringan';
      case 'medium':
        return 'Sedang';
      case 'priority':
        return 'Prioritas';
      default:
        return value;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Daftar Antrean')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          header(),
          const SizedBox(height: 16),

          const InfoBanner(
            title: 'Antrean Digital',
            message:
                'Data antrean akan dikirim ke backend dan QR dibuat dari token antrean asli.',
            icon: Icons.qr_code_2,
          ),

          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextField(
                  controller: complaintController,
                  label: 'Keluhan',
                  hint: 'Contoh: sakit kepala, demam ringan, sakit gigi...',
                  maxLines: 4,
                ),

                const SizedBox(height: 18),

                sectionTitle('Jenis Layanan'),
                DropdownButtonFormField<String>(
                  value: selectedService,
                  decoration: const InputDecoration(),
                  items: const [
                    DropdownMenuItem(
                      value: 'Pemeriksaan Umum',
                      child: Text('Pemeriksaan Umum'),
                    ),
                    DropdownMenuItem(
                      value: 'Konsultasi Ringan',
                      child: Text('Konsultasi Ringan'),
                    ),
                    DropdownMenuItem(
                      value: 'Cedera Ringan',
                      child: Text('Cedera Ringan'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() {
                      selectedService = value;
                    });
                  },
                ),

                const SizedBox(height: 18),

                sectionTitle('Kategori Keluhan'),
                DropdownButtonFormField<String>(
                  value: selectedPriority,
                  decoration: const InputDecoration(),
                  items: const [
                    DropdownMenuItem(value: 'light', child: Text('Ringan')),
                    DropdownMenuItem(value: 'medium', child: Text('Sedang')),
                    DropdownMenuItem(
                      value: 'priority',
                      child: Text('Prioritas'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value == null) return;
                    setState(() {
                      selectedPriority = value;
                    });
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.fact_check_outlined,
                  color: AppColors.primaryGreen,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Layanan: $selectedService • Kategori: ${priorityLabel(selectedPriority)}',
                    style: const TextStyle(
                      color: AppColors.textDark,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          AppButton(
            text: 'Ambil Nomor Antrean',
            icon: Icons.qr_code_2,
            isLoading: isLoading,
            onPressed: submitQueue,
          ),
        ],
      ),
    );
  }
}
