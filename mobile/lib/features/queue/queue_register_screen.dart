import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/info_banner.dart';
import 'queue_qr_screen.dart';

class QueueRegisterScreen extends StatefulWidget {
  const QueueRegisterScreen({super.key});

  @override
  State<QueueRegisterScreen> createState() => _QueueRegisterScreenState();
}

class _QueueRegisterScreenState extends State<QueueRegisterScreen> {
  final complaintController = TextEditingController();

  String selectedService = 'Pemeriksaan Umum';
  String selectedPriority = 'light';

  @override
  void dispose() {
    complaintController.dispose();
    super.dispose();
  }

  void submitDummyQueue() {
    final complaint = complaintController.text.trim();

    if (complaint.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Keluhan wajib diisi'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const QueueQrScreen()),
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

  Widget formCard({required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
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
            title: 'Mode Dummy',
            message:
                'Pendaftaran antrean ini belum tersimpan ke database. Integrasi API dilakukan saat Checkpoint 2 resmi dibuka.',
            icon: Icons.eco_outlined,
          ),

          const SizedBox(height: 20),

          formCard(
            children: [
              sectionTitle('Keluhan'),
              TextField(
                controller: complaintController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Contoh: sakit kepala, demam ringan, sakit gigi...',
                ),
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
                  DropdownMenuItem(value: 'priority', child: Text('Prioritas')),
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
            text: 'Ambil Nomor Antrean Dummy',
            icon: Icons.qr_code_2,
            onPressed: submitDummyQueue,
          ),
        ],
      ),
    );
  }
}
