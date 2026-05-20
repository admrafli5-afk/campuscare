import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../models/medical_history_model.dart';

class MedicalHistoryService {
  final ApiClient apiClient;

  MedicalHistoryService({required this.apiClient});

  Future<List<MedicalHistoryItem>> getMyMedicalHistory() async {
    final response = await apiClient.get(
      ApiConstants.medicalHistory,
      withAuth: true,
    );

    if (response['success'] != true) {
      throw Exception(
        response['message'] ?? 'Gagal mengambil riwayat kesehatan',
      );
    }

    final data = response['data'];

    return _parseMedicalHistoryData(data);
  }

  List<MedicalHistoryItem> _parseMedicalHistoryData(dynamic data) {
    final items = <MedicalHistoryItem>[];

    if (data == null) {
      return items;
    }

    if (data is List) {
      for (final item in data) {
        if (item is Map<String, dynamic>) {
          items.add(MedicalHistoryItem.fromJson(item));
        }
      }

      return items;
    }

    if (data is Map<String, dynamic>) {
      collectItems(
        items: items,
        data: data,
        key: 'health_checks',
        type: 'health_check',
      );

      collectItems(
        items: items,
        data: data,
        key: 'healthChecks',
        type: 'health_check',
      );

      collectItems(
        items: items,
        data: data,
        key: 'sick_letters',
        type: 'sick_letter',
      );

      collectItems(
        items: items,
        data: data,
        key: 'sickLetters',
        type: 'sick_letter',
      );

      collectItems(
        items: items,
        data: data,
        key: 'emergency_cases',
        type: 'emergency_case',
      );

      collectItems(
        items: items,
        data: data,
        key: 'emergencyCases',
        type: 'emergency_case',
      );

      collectItems(items: items, data: data, key: 'queues', type: 'queue');

      collectItems(
        items: items,
        data: data,
        key: 'records',
        type: 'health_check',
      );

      collectItems(
        items: items,
        data: data,
        key: 'history',
        type: 'health_check',
      );

      if (items.isEmpty) {
        items.add(MedicalHistoryItem.fromJson(data));
      }
    }

    items.sort((a, b) {
      final dateA = DateTime.tryParse(a.date);
      final dateB = DateTime.tryParse(b.date);

      if (dateA == null && dateB == null) return 0;
      if (dateA == null) return 1;
      if (dateB == null) return -1;

      return dateB.compareTo(dateA);
    });

    return items;
  }

  void collectItems({
    required List<MedicalHistoryItem> items,
    required Map<String, dynamic> data,
    required String key,
    required String type,
  }) {
    final value = data[key];

    if (value is List) {
      for (final item in value) {
        if (item is Map<String, dynamic>) {
          items.add(MedicalHistoryItem.fromJson(item, fallbackType: type));
        }
      }
    }
  }
}
