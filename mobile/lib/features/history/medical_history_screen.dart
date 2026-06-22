import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../models/medical_history_model.dart';
import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import 'services/medical_history_service.dart';

class MedicalHistoryScreen extends StatefulWidget {
  const MedicalHistoryScreen({super.key});

  @override
  State<MedicalHistoryScreen> createState() => _MedicalHistoryScreenState();
}

class _MedicalHistoryScreenState extends State<MedicalHistoryScreen> {
  final storage = SecureStorageService();

  bool isLoading = true;
  String? errorMessage;
  List<MedicalHistoryItem> histories = [];

  @override
  void initState() {
    super.initState();
    loadMedicalHistory();
  }

  Future<void> loadMedicalHistory() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final apiClient = ApiClient(storage: storage);
    final service = MedicalHistoryService(apiClient: apiClient);

    try {
      final result = await service.getMyMedicalHistory();

      if (!mounted) return;

      setState(() {
        histories = result;
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

  String formatDate(String rawDate) {
    if (rawDate.isEmpty || rawDate == 'null') {
      return '-';
    }

    try {
      final date = DateTime.parse(rawDate).toLocal();

      final day = date.day.toString().padLeft(2, '0');
      final month = monthName(date.month);
      final year = date.year.toString();
      final hour = date.hour.toString().padLeft(2, '0');
      final minute = date.minute.toString().padLeft(2, '0');

      return '$day $month $year, $hour:$minute';
    } catch (_) {
      return rawDate;
    }
  }

  String monthName(int month) {
    switch (month) {
      case 1: return 'Jan';
      case 2: return 'Feb';
      case 3: return 'Mar';
      case 4: return 'Apr';
      case 5: return 'Mei';
      case 6: return 'Jun';
      case 7: return 'Jul';
      case 8: return 'Agu';
      case 9: return 'Sep';
      case 10: return 'Okt';
      case 11: return 'Nov';
      case 12: return 'Des';
      default: return '';
    }
  }

  IconData iconByType(String type) {
    switch (type) {
      case 'health_check':
      case 'health_checks':
        return Icons.medical_services_outlined;
      case 'sick_letter':
      case 'sick_letters':
        return Icons.description_outlined;
      case 'emergency_case':
      case 'emergency_cases':
        return Icons.emergency_outlined;
      case 'queue':
      case 'queues':
        return Icons.confirmation_number_outlined;
      case 'student_health_profile':
      case 'student_health_profiles':
        return Icons.health_and_safety_outlined;
      default:
        return Icons.history_outlined;
    }
  }

  Color colorByType(String type) {
    switch (type) {
      case 'emergency_case':
      case 'emergency_cases':
        return Colors.red;
      default:
        return AppColors.primaryGreen;
    }
  }

  bool hasValue(String value) {
    return value.isNotEmpty && value != 'null' && value != '-';
  }

  Widget emptyState() {
    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: loadMedicalHistory,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
        children: [
          const SizedBox(height: 80),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              children: [
                Icon(
                  Icons.history_toggle_off_outlined,
                  color: AppColors.primaryGreen,
                  size: 58,
                ),
                SizedBox(height: 16),
                Text(
                  'Belum Ada Riwayat Kesehatan',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Riwayat pemeriksaan akan muncul setelah petugas klinik menyimpan hasil pemeriksaan.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textGray, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void showHistoryDetail(MedicalHistoryItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.82,
          minChildSize: 0.55,
          maxChildSize: 0.94,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 30),
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          color: item.type.contains('emergency')
                              ? const Color(0xFFFFE4E6)
                              : AppColors.softMint,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Icon(
                          iconByType(item.type),
                          color: colorByType(item.type),
                          size: 30,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: const TextStyle(
                                color: AppColors.textDark,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              formatDate(item.date),
                              style: const TextStyle(
                                color: AppColors.textGray,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _DetailRow(label: 'No. Antrean', value: item.queueNumber),
                        _DetailRow(label: 'Dokter', value: item.doctorName),
                        _DetailRow(label: 'Status', value: item.status),
                        _DetailRow(
                          label: 'Tanggal',
                          value: formatDate(item.date),
                          isLast: true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _SectionTitle(
                          icon: Icons.chat_bubble_outline_rounded,
                          title: 'Keluhan dan Pemeriksaan',
                        ),
                        const SizedBox(height: 14),
                        _DetailBlock(label: 'Keluhan Antrean', value: item.complaint),
                        _DetailBlock(label: 'Keluhan Utama', value: item.chiefComplaint),
                        _DetailBlock(label: 'Catatan Pemeriksaan', value: item.note),
                        _DetailBlock(
                          label: 'Tindakan / Saran Awal',
                          value: item.actionTaken,
                          isLast: true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _SectionTitle(
                          icon: Icons.monitor_heart_outlined,
                          title: 'Tanda Vital',
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _VitalCard(
                                label: 'Suhu',
                                value: hasValue(item.temperature) ? '${item.temperature} °C' : '-',
                                icon: Icons.thermostat_outlined,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _VitalCard(
                                label: 'Tekanan',
                                value: item.bloodPressure,
                                icon: Icons.bloodtype_outlined,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _VitalCard(
                                label: 'Nadi',
                                value: hasValue(item.pulse) ? '${item.pulse} / menit' : '-',
                                icon: Icons.favorite_border_rounded,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _VitalCard(
                                label: 'Napas',
                                value: hasValue(item.respiration) ? '${item.respiration} / menit' : '-',
                                icon: Icons.air_rounded,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  if (hasValue(item.diagnosis) ||
                      hasValue(item.treatment) ||
                      hasValue(item.medicine))
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const _SectionTitle(
                            icon: Icons.medical_information_outlined,
                            title: 'Hasil Lanjutan',
                          ),
                          const SizedBox(height: 14),
                          _DetailBlock(label: 'Diagnosis', value: item.diagnosis),
                          _DetailBlock(label: 'Tindakan', value: item.treatment),
                          _DetailBlock(
                            label: 'Obat',
                            value: item.medicine,
                            isLast: true,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget historyCard(MedicalHistoryItem item) {
    final iconColor = colorByType(item.type);

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => showHistoryDetail(item),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: item.type.contains('emergency')
                        ? const Color(0xFFFFE4E6)
                        : AppColors.softMint,
                    borderRadius: BorderRadius.circular(17),
                  ),
                  child: Icon(
                    iconByType(item.type),
                    color: iconColor,
                    size: 27,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: const TextStyle(
                          color: AppColors.textDark,
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formatDate(item.date),
                        style: const TextStyle(
                          color: AppColors.textGray,
                          fontSize: 12.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Dokter: ${item.doctorName}',
                        style: const TextStyle(
                          color: AppColors.primaryGreen,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 7),
                      Text(
                        hasValue(item.chiefComplaint)
                            ? item.chiefComplaint
                            : item.complaint,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textGray,
                          height: 1.35,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (item.queueNumber != '-')
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.softMint,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          item.queueNumber,
                          style: const TextStyle(
                            color: AppColors.primaryGreen,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    const SizedBox(height: 10),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.textGray,
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 14),

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.softMint,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.touch_app_outlined,
                    color: AppColors.primaryGreen,
                    size: 19,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Ketuk untuk melihat detail hasil pemeriksaan.',
                      style: TextStyle(
                        color: AppColors.primaryGreen,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title