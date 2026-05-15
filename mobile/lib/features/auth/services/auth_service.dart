import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../../../models/user_model.dart';

class AuthService {
  final SecureStorageService storage;
  final ApiClient apiClient;

  AuthService({required this.storage, required this.apiClient});

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await apiClient.post(
      ApiConstants.login,
      body: {'email': email, 'password': password},
    );

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Login gagal');
    }

    final data = response['data'];
    final token = data['token'];
    final userJson = data['user'];

    if (token == null || userJson == null) {
      throw Exception('Response login tidak lengkap');
    }

    await storage.saveToken(token);

    return UserModel.fromJson(userJson);
  }

  Future<UserModel> getCurrentUser() async {
    final response = await apiClient.get(ApiConstants.me, withAuth: true);

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Token tidak valid');
    }

    return UserModel.fromJson(response['data']);
  }

  Future<void> logout() async {
    await storage.deleteToken();
  }
}
