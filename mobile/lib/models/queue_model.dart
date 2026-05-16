class QueueModel {
  final int? id;
  final String queueNumber;
  final String complaint;
  final String serviceType;
  final String priorityLevel;
  final String status;
  final int estimatedMinutes;
  final String qrToken;

  QueueModel({
    this.id,
    required this.queueNumber,
    required this.complaint,
    required this.serviceType,
    required this.priorityLevel,
    required this.status,
    required this.estimatedMinutes,
    required this.qrToken,
  });

  factory QueueModel.fromJson(Map<String, dynamic> json) {
    return QueueModel(
      id: json['id'],
      queueNumber:
          json['queue_number']?.toString() ??
          json['queueNumber']?.toString() ??
          '-',
      complaint: json['complaint']?.toString() ?? '-',
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
    );
  }

  factory QueueModel.dummy() {
    return QueueModel(
      id: 1,
      queueNumber: 'A001',
      complaint: 'Sakit kepala dan demam ringan',
      serviceType: 'Pemeriksaan Umum',
      priorityLevel: 'light',
      status: 'waiting',
      estimatedMinutes: 20,
      qrToken: 'CC-QUEUE-DUMMY-A001',
    );
  }
}
