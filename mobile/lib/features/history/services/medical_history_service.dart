import '../../../../core/network/api_client.dart';
import '../../../../models/medical_history_model.dart';
import '../../../../core/constants/api_constants.dart';
class MedicalHistoryService {
  final ApiClient apiClient;

  MedicalHistoryService({required this.apiClient});

  Future<List<MedicalHistoryItem>> getMyMedicalHistory() async {
    try {
      final response = await apiClient.get(
        ApiConstants.medicalRecordsMe,
        withAuth: true,
      );

      print('📦 FULL RESPONSE: $response');
      print('✅ SUCCESS: ${response['success']}');
      print('📝 MESSAGE: ${response['message']}');
      print('📊 DATA: ${response['data']}');

      if (response['success'] != true) {
        throw Exception(response['message'] ?? 'Gagal mengambil riwayat');
      }

      final data = response['data'];
      if (data == null) return [];
      if (data is List) {
        return data.map((item) =>
          MedicalHistoryItem.fromJson(item as Map<String, dynamic>)
        ).toList();
      }
      return [];
    } catch (e) {
      print('🔴 ERROR SERVICE: $e');
      rethrow;
    }
  }
}