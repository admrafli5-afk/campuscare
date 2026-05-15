import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../storage/secure_storage_service.dart';

class ApiClient {
  final SecureStorageService storage;

  ApiClient({required this.storage});

  Future<Map<String, String>> _headers({bool withAuth = false}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (withAuth) {
      final token = await storage.getToken();

      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<Map<String, dynamic>> post(
    String url, {
    Map<String, dynamic>? body,
    bool withAuth = false,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(url),
            headers: await _headers(withAuth: withAuth),
            body: jsonEncode(body ?? {}),
          )
          .timeout(const Duration(seconds: 10));

      return _decodeResponse(response);
    } on TimeoutException {
      return {
        'success': false,
        'message':
            'Koneksi ke server terlalu lama. Pastikan backend berjalan dan base URL benar.',
        'errors': ['Request timeout'],
      };
    } catch (e) {
      return {
        'success': false,
        'message':
            'Tidak dapat terhubung ke server. Periksa backend, jaringan, dan base URL.',
        'errors': [e.toString()],
      };
    }
  }

  Future<Map<String, dynamic>> get(String url, {bool withAuth = false}) async {
    try {
      final response = await http
          .get(Uri.parse(url), headers: await _headers(withAuth: withAuth))
          .timeout(const Duration(seconds: 10));

      return _decodeResponse(response);
    } on TimeoutException {
      return {
        'success': false,
        'message':
            'Koneksi ke server terlalu lama. Pastikan backend berjalan dan base URL benar.',
        'errors': ['Request timeout'],
      };
    } catch (e) {
      return {
        'success': false,
        'message':
            'Tidak dapat terhubung ke server. Periksa backend, jaringan, dan base URL.',
        'errors': [e.toString()],
      };
    }
  }

  Future<Map<String, dynamic>> patch(
    String url, {
    Map<String, dynamic>? body,
    bool withAuth = false,
  }) async {
    try {
      final response = await http
          .patch(
            Uri.parse(url),
            headers: await _headers(withAuth: withAuth),
            body: jsonEncode(body ?? {}),
          )
          .timeout(const Duration(seconds: 10));

      return _decodeResponse(response);
    } on TimeoutException {
      return {
        'success': false,
        'message':
            'Koneksi ke server terlalu lama. Pastikan backend berjalan dan base URL benar.',
        'errors': ['Request timeout'],
      };
    } catch (e) {
      return {
        'success': false,
        'message':
            'Tidak dapat terhubung ke server. Periksa backend, jaringan, dan base URL.',
        'errors': [e.toString()],
      };
    }
  }

  Future<Map<String, dynamic>> delete(
    String url, {
    bool withAuth = false,
  }) async {
    try {
      final response = await http
          .delete(Uri.parse(url), headers: await _headers(withAuth: withAuth))
          .timeout(const Duration(seconds: 10));

      return _decodeResponse(response);
    } on TimeoutException {
      return {
        'success': false,
        'message':
            'Koneksi ke server terlalu lama. Pastikan backend berjalan dan base URL benar.',
        'errors': ['Request timeout'],
      };
    } catch (e) {
      return {
        'success': false,
        'message':
            'Tidak dapat terhubung ke server. Periksa backend, jaringan, dan base URL.',
        'errors': [e.toString()],
      };
    }
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);

      if (decoded is Map<String, dynamic>) {
        return decoded;
      }

      return {
        'success': false,
        'message': 'Format response server tidak valid.',
        'errors': [],
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Gagal membaca response dari server.',
        'errors': [
          'Status code: ${response.statusCode}',
          'Body: ${response.body}',
          e.toString(),
        ],
      };
    }
  }
}
