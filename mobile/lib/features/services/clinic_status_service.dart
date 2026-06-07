import 'dart:convert';
import 'package:http/http.dart' as http;

class ClinicStatus {
  final bool isOpen;
  final String openTime;
  final String closeTime;
  final String statusText;
  final String localTime;
  final String localDate;
  final String localDay;

  ClinicStatus({
    required this.isOpen,
    required this.openTime,
    required this.closeTime,
    required this.statusText,
    required this.localTime,
    required this.localDate,
    required this.localDay,
  });

  factory ClinicStatus.fromJson(Map<String, dynamic> json) {
    final bool open = json['is_open'] == true || json['is_open'] == 1;

    return ClinicStatus(
      isOpen: open,
      openTime: json['open_time']?.toString() ?? '08:00',
      closeTime: json['close_time']?.toString() ?? '16:00',
      statusText: json['status_text']?.toString() ??
          (open ? 'Klinik Buka' : 'Klinik Tutup'),
      localTime: json['local_time']?.toString() ?? '-',
      localDate: json['local_date']?.toString() ?? '-',
      localDay: json['local_day']?.toString() ?? '-',
    );
  }
}

class ClinicStatusService {
  // GANTI IP kalau IP laptop kamu berubah
  static const String baseUrl = 'http://192.168.1.5:5000/api';

  static Future<ClinicStatus> getClinicStatus() async {
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard/clinic/status'),
      headers: {
        'Content-Type': 'application/json',
      },
    );

    final body = jsonDecode(response.body);

    if (response.statusCode != 200 || body['success'] != true) {
      throw Exception(body['message'] ?? 'Gagal mengambil status klinik');
    }

    return ClinicStatus.fromJson(body['data']);
  }
}