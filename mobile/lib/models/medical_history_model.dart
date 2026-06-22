class MedicalHistoryItem {
  final String type;
  final String title;
  final String doctorName; // TAMBAHAN KRUSIAL: Penampung nama dokter
  final String queueNumber;
  final String complaint;
  final String chiefComplaint;
  final String diagnosis;
  final String treatment;
  final String actionTaken;
  final String medicine;
  final String note;
  final String status;
  final String date;

  final String temperature;
  final String bloodPressure;
  final String pulse;
  final String respiration;

  MedicalHistoryItem({
    required this.type,
    required this.title,
    required this.doctorName, // Wajib diinisialisasi
    required this.queueNumber,
    required this.complaint,
    required this.chiefComplaint,
    required this.diagnosis,
    required this.treatment,
    required this.actionTaken,
    required this.medicine,
    required this.note,
    required this.status,
    required this.date,
    required this.temperature,
    required this.bloodPressure,
    required this.pulse,
    required this.respiration,
  });

  factory MedicalHistoryItem.fromJson(
    Map<String, dynamic> json, {
    String fallbackType = 'health_check',
  }) {
    final type = json['type']?.toString() ?? fallbackType;

    final queue = json['queue'];
    final queueMap = queue is Map<String, dynamic>
        ? queue
        : <String, dynamic>{};

    return MedicalHistoryItem(
      type: type,
      title: _resolveTitle(type, json),

      // TAMBAHAN KRUSIAL: Parsing nama dokter dari JSON
      doctorName: 
          json['doctor_name']?.toString() ?? 
          json['doctorName']?.toString() ?? 
          json['doctor']?.toString() ?? 
          '-',

      queueNumber:
          json['queue_number']?.toString() ??
          json['queueNumber']?.toString() ??
          queueMap['queue_number']?.toString() ??
          queueMap['queueNumber']?.toString() ??
          '-',

      complaint:
          json['complaint']?.toString() ??
          json['keluhan']?.toString() ??
          json['main_complaint']?.toString() ??
          json['chief_complaint']?.toString() ??
          queueMap['complaint']?.toString() ??
          '-',

      chiefComplaint:
          json['chief_complaint']?.toString() ??
          json['main_complaint']?.toString() ??
          json['complaint']?.toString() ??
          queueMap['complaint']?.toString() ??
          '-',

      diagnosis:
          json['diagnosis']?.toString() ??
          json['diagnose']?.toString() ??
          json['result']?.toString() ??
          json['health_result']?.toString() ??
          '-',

      treatment:
          json['treatment']?.toString() ??
          json['handling']?.toString() ??
          json['action']?.toString() ??
          json['action_taken']?.toString() ??
          '-',

      actionTaken:
          json['action_taken']?.toString() ??
          json['actionTaken']?.toString() ??
          json['treatment']?.toString() ??
          json['handling']?.toString() ??
          '-',

      medicine:
          json['medicine']?.toString() ??
          json['medication']?.toString() ??
          json['prescription']?.toString() ??
          '-',

      note:
          json['notes']?.toString() ??
          json['note']?.toString() ??
          json['doctor_note']?.toString() ??
          json['staff_note']?.toString() ??
          json['description']?.toString() ??
          '-',

      status:
          json['status']?.toString() ?? queueMap['status']?.toString() ?? '-',

      date:
          json['checked_at']?.toString() ??
          json['created_at']?.toString() ??
          json['completed_at']?.toString() ??
          json['issued_at']?.toString() ??
          json['date']?.toString() ??
          '',

      temperature:
          json['temperature']?.toString() ??
          json['body_temperature']?.toString() ??
          '-',

      bloodPressure:
          json['blood_pressure']?.toString() ??
          json['bloodPressure']?.toString() ??
          '-',

      pulse: json['pulse']?.toString() ?? json['heart_rate']?.toString() ?? '-',

      respiration:
          json['respiration']?.toString() ??
          json['respiratory_rate']?.toString() ??
          '-',
    );
  }

  static String _resolveTitle(String type, Map<String, dynamic> json) {
    final customTitle = json['title']?.toString();

    if (customTitle != null && customTitle.isNotEmpty) {
      return customTitle;
    }

    switch (type) {
      case 'health_check':
      case 'health_checks':
        return 'Pemeriksaan Klinik';
      case 'sick_letter':
      case 'sick_letters':
        return 'Surat Izin Sakit';
      case 'emergency_case':
      case 'emergency_cases':
        return 'Kasus Darurat';
      case 'queue':
      case 'queues':
        return 'Riwayat Antrean';
      case 'student_health_profile':
      case 'student_health_profiles':
        return 'Profil Kesehatan';
      default:
        return 'Riwayat Kesehatan';
    }
  }
}