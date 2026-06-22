import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/storage/secure_storage_service.dart';

class SickLetter {
  final int id;
  final String letterNumber;
  final int? healthCheckId;
  final String reason;
  final String diagnosisSummary;
  final int restDays;
  final String startDate;
  final String endDate;
  final String status;
  final String verificationToken;
  final String createdAt;
  final String? validatedAt;

  SickLetter({
    required this.id,
    required this.letterNumber,
    required this.healthCheckId,
    required this.reason,
    required this.diagnosisSummary,
    required this.restDays,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.verificationToken,
    required this.createdAt,
    required this.validatedAt,
  });

  factory SickLetter.fromJson(Map<String, dynamic> json) {
    return SickLetter(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      letterNumber: json['letter_number']?.toString() ?? '-',
      healthCheckId: json['health_check_id'] == null
          ? null
          : int.tryParse(json['health_check_id'].toString()),
      reason: json['reason']?.toString() ?? '-',
      diagnosisSummary: json['diagnosis_summary']?.toString() ?? '-',
      restDays: int.tryParse(json['rest_days']?.toString() ?? '0') ?? 0,
      startDate: json['start_date']?.toString() ?? '-',
      endDate: json['end_date']?.toString() ?? '-',
      status: json['status']?.toString() ?? '-',
      verificationToken: json['verification_token']?.toString() ?? '-',
      createdAt: json['created_at']?.toString() ?? '-',
      validatedAt: json['validated_at']?.toString(),
    );
  }
}

class SickLetterService {
  // GANTI IP kalau IP laptop berubah
  static const String baseUrl = 'http://192.168.1.116:5000/api';

  final SecureStorageService storage;

  SickLetterService({
    required this.storage,
  });

  Future<List<SickLetter>> getMySickLetters() async {
    final token = await storage.getToken();

    if (token == null || token.isEmpty) {
      throw Exception('Token login tidak ditemukan. Silakan login ulang.');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/sick-letters/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final body = jsonDecode(response.body);

    if (response.statusCode != 200 || body['success'] != true) {
      throw Exception(body['message'] ?? 'Gagal mengambil surat sakit.');
    }

    final data = body['data'];

    if (data is List) {
      return data
          .map((item) => SickLetter.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    if (data is Map && data['items'] is List) {
      return (data['items'] as List)
          .map((item) => SickLetter.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    if (data is Map && data['sick_letters'] is List) {
      return (data['sick_letters'] as List)
          .map((item) => SickLetter.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    if (data is Map && data['sickLetters'] is List) {
      return (data['sickLetters'] as List)
          .map((item) => SickLetter.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    return [];
  }
}