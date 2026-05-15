import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../shared/widgets/app_button.dart';
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
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.textDark,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Daftar Antrean')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Text(
              'Isi keluhan dengan jelas agar petugas klinik dapat melakukan triage awal.',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 20),
          sectionTitle('Keluhan'),
          const SizedBox(height: 8),
          TextField(
            controller: complaintController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Contoh: sakit kepala, demam ringan, sakit gigi...',
            ),
          ),
          const SizedBox(height: 18),
          sectionTitle('Jenis Layanan'),
          const SizedBox(height: 8),
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
          const SizedBox(height: 8),
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
          const SizedBox(height: 24),
          AppButton(
            text: 'Ambil Nomor Antrean Dummy',
            onPressed: submitDummyQueue,
          ),
        ],
      ),
    );
  }
}
