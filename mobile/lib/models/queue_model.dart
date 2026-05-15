class QueueModel {
  final String queueNumber;
  final String complaint;
  final String serviceType;
  final String status;
  final int estimatedMinutes;
  final String qrToken;

  QueueModel({
    required this.queueNumber,
    required this.complaint,
    required this.serviceType,
    required this.status,
    required this.estimatedMinutes,
    required this.qrToken,
  });

  factory QueueModel.dummy() {
    return QueueModel(
      queueNumber: 'A001',
      complaint: 'Sakit kepala dan demam ringan',
      serviceType: 'Pemeriksaan Umum',
      status: 'waiting',
      estimatedMinutes: 20,
      qrToken: 'CC-QUEUE-DUMMY-A001',
    );
  }
}
