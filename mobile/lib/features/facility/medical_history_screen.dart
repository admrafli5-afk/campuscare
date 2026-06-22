import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../models/medical_history_model.dart';
import '../history/services/medical_history_service.dart';

class MedicalHistoryScreen extends StatefulWidget {
  const MedicalHistoryScreen({super.key});

  @override
  State<MedicalHistoryScreen> createState() => _MedicalHistoryScreenState();
}

class _MedicalHistoryScreenState extends State<MedicalHistoryScreen> {
  bool isLoading = true;
  String? errorMessage;
  List<MedicalHistoryItem> items = [];

  @override
  void initState() {
    super.initState();
    loadHistory();
  }

  Future<void> loadHistory({bool silent = false}) async {
    if (!mounted) return;

    if (!silent) {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });
    }

    try {
      final storage = SecureStorageService();
      final apiClient = ApiClient(storage: storage);
      final service = MedicalHistoryService(apiClient: apiClient);

      final result = await service.getMyMedicalHistory();

      if (!mounted) return;

      setState(() {
        items = result;
        isLoading = false;
        errorMessage = null;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  void showItemDetail(MedicalHistoryItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _MedicalHistoryDetailSheet(item: item),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: RefreshIndicator(
        onRefresh: () => loadHistory(silent: false),
        child: buildBody(),
      ),
    );
  }

  Widget buildBody() {
    if (isLoading && items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errorMessage != null && items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 80, 20, 40),
        children: [
          const Icon(Icons.error_outline_rounded, color: Colors.red, size: 48),
          const SizedBox(height: 14),
          Text(
            errorMessage!,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textGray, fontSize: 13.5),
          ),
          const SizedBox(height: 18),
          Center(
            child: ElevatedButton(
              onPressed: () => loadHistory(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Coba Lagi'),
            ),
          ),
        ],
      );
    }

    if (items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 80, 20, 40),
        children: const [
          Icon(Icons.folder_off_outlined, color: AppColors.textGray, size: 48),
          SizedBox(height: 14),
          Text(
            'Belum ada riwayat kesehatan.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textGray, fontSize: 13.5),
          ),
        ],
      );
    }

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 40),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _MedicalHistoryCard(
          item: items[index],
          onTap: () => showItemDetail(items[index]),
        );
      },
    );
  }
}

IconData typeIcon(String type) {
  switch (type) {
    case 'health_check':
    case 'health_checks':
      return Icons.health_and_safety_outlined;
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
      return Icons.badge_outlined;
    default:
      return Icons.history_outlined;
  }
}

Color statusColor(String status) {
  final normalized = status.toLowerCase();

  if (normalized.contains('selesai') ||
      normalized.contains('completed') ||
      normalized.contains('done')) {
    return AppColors.primaryGreen;
  }
  if (normalized.contains('proses') ||
      normalized.contains('pending') ||
      normalized.contains('waiting')) {
    return Colors.orange;
  }
  if (normalized.contains('batal') ||
      normalized.contains('cancel') ||
      normalized.contains('reject')) {
    return Colors.red;
  }

  return AppColors.textGray;
}

String formatDate(String value) {
  final parsed = DateTime.tryParse(value);
  if (parsed == null) return value.isEmpty ? '-' : value;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];

  final day = parsed.day.toString().padLeft(2, '0');
  final month = months[parsed.month - 1];
  final hour = parsed.hour.toString().padLeft(2, '0');
  final minute = parsed.minute.toString().padLeft(2, '0');

  return '$day $month ${parsed.year}, $hour:$minute';
}

class _MedicalHistoryCard extends StatelessWidget {
  final MedicalHistoryItem item;
  final VoidCallback onTap;

  const _MedicalHistoryCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = statusColor(item.status);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.softMint,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  typeIcon(item.type),
                  color: AppColors.primaryGreen,
                  size: 24,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textDark,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 9,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            item.status == '-' ? 'Info' : item.status,
                            style: TextStyle(
                              color: color,
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      item.doctorName != '-'
                          ? 'dr. ${item.doctorName}'
                          : (item.chiefComplaint != '-'
                              ? item.chiefComplaint
                              : 'Tidak ada keterangan tambahan'),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.textGray,
                        fontSize: 12.5,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Row(
                      children: [
                        const Icon(
                          Icons.schedule_outlined,
                          color: AppColors.textGray,
                          size: 14,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          formatDate(item.date),
                          style: const TextStyle(
                            color: AppColors.textGray,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textGray),
            ],
          ),
        ),
      ),
    );
  }
}

class _MedicalHistoryDetailSheet extends StatelessWidget {
  final MedicalHistoryItem item;

  const _MedicalHistoryDetailSheet({required this.item});

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.of(context).size.height * 0.85;

    return Container(
      constraints: BoxConstraints(maxHeight: maxHeight),
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 30),
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
            const SizedBox(height: 18),
            Text(
              item.title,
              style: const TextStyle(
                color: AppColors.textDark,
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              formatDate(item.date),
              style: const TextStyle(color: AppColors.textGray, fontSize: 13),
            ),
            const SizedBox(height: 18),
            detailRow('Dokter', item.doctorName),
            detailRow('No. Antrean', item.queueNumber),
            detailRow('Status', item.status),
            const Divider(height: 28, color: AppColors.border),
            detailRow('Keluhan Utama', item.chiefComplaint),
            detailRow('Keluhan', item.complaint),
            detailRow('Diagnosis', item.diagnosis),
            detailRow('Tindakan', item.actionTaken),
            detailRow('Obat', item.medicine),
            detailRow('Catatan', item.note),
            const Divider(height: 28, color: AppColors.border),
            Row(
              children: [
                Expanded(child: vitalCard('Suhu', '${item.temperature}°C')),
                const SizedBox(width: 10),
                Expanded(child: vitalCard('Tekanan Darah', item.bloodPressure)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: vitalCard('Nadi', '${item.pulse} bpm')),
                const SizedBox(width: 10),
                Expanded(child: vitalCard('Respirasi', '${item.respiration} /menit')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget detailRow(String label, String value) {
    if (value == '-' || value.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textGray,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.textDark,
              fontSize: 14.5,
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }

  Widget vitalCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textGray,
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.textDark,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}