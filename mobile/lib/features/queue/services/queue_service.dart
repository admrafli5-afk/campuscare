import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../models/queue_model.dart';

class QueueService {
  final ApiClient apiClient;

  QueueService({required this.apiClient});

  Future<Map<String, dynamic>> getPublicStatus() async {
    final response = await apiClient.get(
      ApiConstants.queuePublicStatus,
      withAuth: true,
    );

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Gagal mengambil status antrean');
    }

    final data = response['data'];

    if (data == null || data is! Map<String, dynamic>) {
      return {};
    }

    return data;
  }

  Future<QueueModel> registerQueue({
    required String complaint,
    required String serviceType,
    required String priorityLevel,
  }) async {
    final response = await apiClient.post(
      ApiConstants.queueRegister,
      withAuth: true,
      body: {
        'complaint': complaint,
        'service_type': serviceType,
        'priority_level': priorityLevel,
      },
    );

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Gagal mendaftar antrean');
    }

    final data = response['data']?['queue'] ?? response['data'];

    if (data == null || data is! Map<String, dynamic>) {
      throw Exception('Response antrean tidak valid');
    }

    return QueueModel.fromJson(data);
  }

  Future<QueueModel?> getMyCurrentQueue() async {
    final response = await apiClient.get(
      ApiConstants.queueMyCurrent,
      withAuth: true,
    );

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Gagal mengambil antrean aktif');
    }

    final data = response['data'];

    if (data == null) {
      return null;
    }

    if (data is! Map<String, dynamic>) {
      throw Exception('Response antrean aktif tidak valid');
    }

    return QueueModel.fromJson(data);
  }

  Future<List<QueueModel>> getMyQueueHistory() async {
    final response = await apiClient.get(
      ApiConstants.queueMyHistory,
      withAuth: true,
    );

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Gagal mengambil riwayat antrean');
    }

    final data = response['data'];

    if (data == null) {
      return [];
    }

    if (data is! List) {
      throw Exception('Response riwayat antrean tidak valid');
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map((item) => QueueModel.fromJson(item))
        .toList();
  }
}
