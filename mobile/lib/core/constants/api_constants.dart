class ApiConstants {
  // Untuk HP fisik, gunakan IP laptop.
  // Pastikan HP dan laptop berada di jaringan WiFi/hotspot yang sama.
  static const String baseUrl = 'http://192.168.1.134:5000/api';

  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';
  static const String logout = '$baseUrl/auth/logout';
}
