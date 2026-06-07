import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import 'services/sick_letter_service.dart';

class SickLettersScreen extends StatefulWidget {
  const SickLettersScreen({super.key});

  @override
  State<SickLettersScreen> createState() => _SickLettersScreenState();
}

class _SickLettersScreenState extends State<SickLettersScreen> {
  final SickLetterService sickLetterService = SickLetterService(
    storage: SecureStorageService(),
  );

  bool isLoading = true;
  String? errorMessage;
  List<SickLetter> sickLetters = [];

  @override
  void initState() {
    super.initState();
    loadSickLetters();
  }

  Future<void> loadSickLetters() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final result = await sickLetterService.getMySickLetters();

      if (!mounted) return;

      setState(() {
        sickLetters = result;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  String mapStatus(String status) {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'waiting_validation':
        return 'Menunggu Validasi';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'sent_to_student_affairs':
        return 'Dikirim ke Kemahasiswaan';
      case 'printed':
        return 'Dicetak';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  Color getStatusColor(String status) {
    switch (status) {
      case 'approved':
      case 'sent_to_student_affairs':
        return AppColors.primaryGreen;
      case 'waiting_validation':
        return const Color(0xFFF59E0B);
      case 'rejected':
      case 'cancelled':
        return Colors.red;
      default:
        return AppColors.textGray;
    }
  }

  Color getStatusBackground(String status) {
    switch (status) {
      case 'approved':
      case 'sent_to_student_affairs':
        return AppColors.softMint;
      case 'waiting_validation':
        return const Color(0xFFFFF7ED);
      case 'rejected':
      case 'cancelled':
        return const Color(0xFFFFE4E6);
      default:
        return const Color(0xFFF1F5F9);
    }
  }

  String formatDate(String value) {
    if (value == '-' || value.isEmpty) return '-';

    final date = DateTime.tryParse(value);

    if (date == null) {
      return value.length >= 10 ? value.substring(0, 10) : value;
    }

    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();

    return '$day/$month/$year';
  }

  void showLetterDetail(SickLetter letter) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.78,
          minChildSize: 0.45,
          maxChildSize: 0.92,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(30),
                ),
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
                children: [
                  Center(
                    child: Container(
                      width: 46,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: AppColors.softMint,
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: const Icon(
                          Icons.description_outlined,
                          color: AppColors.primaryGreen,
                          size: 30,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Detail Surat Izin Sakit',
                              style: TextStyle(
                                color: AppColors.textDark,
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              letter.letterNumber,
                              style: const TextStyle(
                                color: AppColors.textGray,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  buildDetailCard(letter),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget buildDetailCard(SickLetter letter) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          buildDetailRow('Nomor Surat', letter.letterNumber),
          buildDivider(),
          buildDetailRow('Status', mapStatus(letter.status)),
          buildDivider(),
          buildDetailRow('Diagnosis', letter.diagnosisSummary),
          buildDivider(),
          buildDetailRow('Alasan/Keterangan', letter.reason),
          buildDivider(),
          buildDetailRow('Lama Istirahat', '${letter.restDays} hari'),
          buildDivider(),
          buildDetailRow(
            'Periode Izin',
            '${formatDate(letter.startDate)} - ${formatDate(letter.endDate)}',
          ),
          buildDivider(),
          buildDetailRow('Tanggal Dibuat', formatDate(letter.createdAt)),
          buildDivider(),
          buildDetailRow(
            'Token Verifikasi',
            letter.verificationToken,
          ),
        ],
      ),
    );
  }

  Widget buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 125,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textGray,
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              value.isEmpty ? '-' : value,
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildDivider() {
    return Container(
      height: 1,
      color: AppColors.border,
    );
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: loadSickLetters,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 128),
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Surat Izin Sakit',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton(
                onPressed: isLoading ? null : loadSickLetters,
                icon: const Icon(
                  Icons.refresh_rounded,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Lihat daftar surat izin sakit digital dari klinik kampus.',
            style: TextStyle(
              color: AppColors.textGray,
              fontSize: 13.5,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),
          if (isLoading)
            buildLoadingState()
          else if (errorMessage != null)
            buildErrorState()
          else if (sickLetters.isEmpty)
            buildEmptyState()
          else
            ...sickLetters.map(buildLetterCard),
        ],
      ),
    );
  }

  Widget buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          CircularProgressIndicator(
            color: AppColors.primaryGreen,
          ),
          SizedBox(height: 14),
          Text(
            'Memuat surat sakit...',
            style: TextStyle(
              color: AppColors.textGray,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget buildErrorState() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFFFE4E6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.red.withOpacity(0.20),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: Colors.red,
            size: 34,
          ),
          const SizedBox(height: 10),
          const Text(
            'Gagal memuat surat sakit',
            style: TextStyle(
              color: Colors.red,
              fontSize: 17,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            errorMessage ?? '-',
            style: const TextStyle(
              color: Colors.red,
              fontSize: 13,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: loadSickLetters,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Coba Lagi'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(
              Icons.description_outlined,
              color: AppColors.primaryGreen,
              size: 36,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'Belum Ada Surat Sakit',
            style: TextStyle(
              color: AppColors.textDark,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Surat izin sakit yang sudah dibuat oleh klinik akan tampil di sini.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textGray,
              fontSize: 13,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget buildLetterCard(SickLetter letter) {
    final statusColor = getStatusColor(letter.status);
    final statusBackground = getStatusBackground(letter.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
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
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () => showLetterDetail(letter),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.softMint,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.description_outlined,
                        color: AppColors.primaryGreen,
                        size: 27,
                      ),
                    ),
                    const SizedBox(width: 13),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            letter.letterNumber,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textDark,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            letter.diagnosisSummary,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textGray,
                              fontSize: 12.8,
                              height: 1.25,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.textGray,
                    ),
                  ],
                ),
                const SizedBox(height: 13),
                Container(height: 1, color: AppColors.border),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.date_range_rounded,
                      color: AppColors.textGray.withOpacity(0.85),
                      size: 18,
                    ),
                    const SizedBox(width: 7),
                    Expanded(
                      child: Text(
                        '${formatDate(letter.startDate)} - ${formatDate(letter.endDate)}',
                        style: const TextStyle(
                          color: AppColors.textGray,
                          fontSize: 12.8,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusBackground,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        mapStatus(letter.status),
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}