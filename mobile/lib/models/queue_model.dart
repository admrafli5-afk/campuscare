class QueueModel {
  final int? id;
  final int? studentId;
  final String queueNumber;
  final String complaint;
  final String serviceType;
  final String priorityLevel;
  final String status;
  final int estimatedMinutes;
  final String qrToken;
  final String? createdAt;
  final String? calledAt;
  final String? checkedInAt;
  final String? completedAt;

  QueueModel({
    this.id,
    this.studentId,
    required this.queueNumber,
    required this.complaint,
    required this.serviceType,
    required this.priorityLevel,
    required this.status,
    required this.estimatedMinutes,
    required this.qrToken,
    this.createdAt,
    this.calledAt,
    this.checkedInAt,
    this.completedAt,
  });

  factory QueueModel.fromJson(Map<String, dynamic> json) {
    return QueueModel(
      id: int.tryParse(json['id']?.toString() ?? ''),
      studentId: int.tryParse(json['student_id']?.toString() ?? ''),
      queueNumber:
          json['queue_number']?.toString() ??
          json['queueNumber']?.toString() ??
          '-',
      complaint:
          json['complaint']?.toString() ??
          json['keluhan']?.toString() ??
          json['description']?.toString() ??
          '-',
      serviceType:
          json['service_type']?.toString() ??
          json['serviceType']?.toString() ??
          'Pemeriksaan Umum',
      priorityLevel:
          json['priority_level']?.toString() ??
          json['priorityLevel']?.toString() ??
          'light',
      status: json['status']?.toString() ?? 'waiting',
      estimatedMinutes:
          int.tryParse(
            json['estimated_minutes']?.toString() ??
                json['estimatedMinutes']?.toString() ??
                '0',
          ) ??
          0,
      qrToken:
          json['qr_token']?.toString() ?? json['qrToken']?.toString() ?? '',
      createdAt: json['created_at']?.toString(),
      calledAt: json['called_at']?.toString(),
      checkedInAt: json['checked_in_at']?.toString(),
      completedAt: json['completed_at']?.toString(),
    );
  }

  factory QueueModel.dummy() {
    return QueueModel(
      id: 1,
      studentId: 1,
      queueNumber: 'A001',
      complaint: 'Sakit kepala dan demam ringan',
      serviceType: 'Pemeriksaan Umum',
      priorityLevel: 'light',
      status: 'waiting',
      estimatedMinutes: 20,
      qrToken: 'CC-QUEUE-DUMMY-A001',
      createdAt: '2026-05-18 10:00:00',
    );
  }
}
