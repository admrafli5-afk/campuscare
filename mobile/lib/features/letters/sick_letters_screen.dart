import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../models/sick_letters_model.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class SickLettersScreen extends StatelessWidget {
  const SickLettersScreen({super.key});

  Widget headerCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Row(
        children: [
          Icon(Icons.description_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Surat Izin Sakit',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Lihat status surat izin sakit yang diterbitkan oleh klinik kampus.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget detailItem({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
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
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primaryGreen, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget letterCard(SickLetterModel letter) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Surat Terbaru',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              StatusBadge(status: letter.status),
            ],
          ),
          const SizedBox(height: 16),
          detailItem(
            title: 'Nomor Surat',
            value: letter.letterNumber,
            icon: Icons.numbers_outlined,
          ),
          detailItem(
            title: 'Nama Mahasiswa',
            value: letter.studentName,
            icon: Icons.person_outline,
          ),
          detailItem(
            title: 'NIM / Kelas',
            value: '${letter.nim} • ${letter.className}',
            icon: Icons.school_outlined,
          ),
          detailItem(
            title: 'Keterangan Sakit',
            value: letter.reason,
            icon: Icons.medical_information_outlined,
          ),
          detailItem(
            title: 'Tanggal Izin',
            value: '${letter.startDate} - ${letter.endDate}',
            icon: Icons.date_range_outlined,
          ),
          detailItem(
            title: 'Lama Izin',
            value: letter.duration,
            icon: Icons.schedule_outlined,
          ),
          detailItem(
            title: 'Dibuat Oleh',
            value: letter.createdBy,
            icon: Icons.verified_user_outlined,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final letter = SickLetterModel.dummy();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Surat Izin Sakit')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          headerCard(),
          const SizedBox(height: 16),
          const InfoBanner(
            title: 'Data Dummy',
            message:
                'Surat izin sakit ini masih dummy. Data asli akan tampil setelah klinik membuat surat melalui dashboard.',
            icon: Icons.info_outline,
          ),
          const SizedBox(height: 20),
          letterCard(letter),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Text(
              'Surat digital dikirimkan ke pihak kemahasiswaan melalui sistem. Jika perlu dicetak, dokumen fisik tetap membutuhkan stempel klinik.',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w600,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
