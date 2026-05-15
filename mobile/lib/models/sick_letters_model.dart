class SickLetterModel {
  final String letterNumber;
  final String studentName;
  final String nim;
  final String className;
  final String reason;
  final String startDate;
  final String endDate;
  final String duration;
  final String status;
  final String createdBy;

  SickLetterModel({
    required this.letterNumber,
    required this.studentName,
    required this.nim,
    required this.className,
    required this.reason,
    required this.startDate,
    required this.endDate,
    required this.duration,
    required this.status,
    required this.createdBy,
  });

  factory SickLetterModel.dummy() {
    return SickLetterModel(
      letterNumber: 'CC/SKS/2026/001',
      studentName: 'Rafli Akbar',
      nim: '2301001',
      className: 'TI-2A',
      reason: 'Demam ringan dan sakit kepala',
      startDate: '16 Mei 2026',
      endDate: '17 Mei 2026',
      duration: '2 Hari',
      status: 'approved',
      createdBy: 'Petugas Klinik CampusCare',
    );
  }
}
