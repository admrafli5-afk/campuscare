class ApiConstants {
  // Untuk HP fisik, gunakan IP laptop.
  // Pastikan HP dan laptop berada di jaringan WiFi/hotspot yang sama.
  static const String baseUrl = 'http://192.168.1.116:5000/api';

  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';
  static const String logout = '$baseUrl/auth/logout';
  static const String queuePublicStatus = '$baseUrl/queue/public-status';
  static const String queueRegister = '$baseUrl/queue/register';
  static const String queueMyCurrent = '$baseUrl/queue/my-current';
  static const String queueMyHistory = '$baseUrl/queue/my-history';
  static const String medicalHistory = '$baseUrl/students/me/medical-history';
  static const String medicalRecordsMe = '$baseUrl/health-checks/me';
}
