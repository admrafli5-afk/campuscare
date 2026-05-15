import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  String get label {
    switch (status) {
      case 'waiting':
        return 'Menunggu';
      case 'called':
        return 'Dipanggil';
      case 'on_the_way':
        return 'Menuju Klinik';
      case 'checked_in':
        return 'Hadir';
      case 'in_checkup':
        return 'Sedang Diperiksa';
      case 'completed':
        return 'Selesai';
      case 'missed':
        return 'Terlewat';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  Color get backgroundColor {
    switch (status) {
      case 'waiting':
        return AppColors.softMint;
      case 'called':
        return const Color(0xFFDBEAFE);
      case 'on_the_way':
        return const Color(0xFFE0F2FE);
      case 'checked_in':
        return const Color(0xFFDCFCE7);
      case 'in_checkup':
        return const Color(0xFFFEF3C7);
      case 'completed':
        return const Color(0xFFDCFCE7);
      case 'missed':
      case 'cancelled':
        return const Color(0xFFFEE2E2);
      default:
        return AppColors.softMint;
    }
  }

  Color get textColor {
    switch (status) {
      case 'waiting':
        return AppColors.primaryGreen;
      case 'called':
        return AppColors.info;
      case 'on_the_way':
        return AppColors.info;
      case 'checked_in':
        return AppColors.success;
      case 'in_checkup':
        return AppColors.warning;
      case 'completed':
        return AppColors.success;
      case 'missed':
      case 'cancelled':
        return AppColors.danger;
      default:
        return AppColors.primaryGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
