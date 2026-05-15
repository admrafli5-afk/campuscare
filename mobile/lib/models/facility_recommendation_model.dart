class FacilityRecommendationModel {
  final String recommendationNumber;
  final String studentName;
  final String nim;
  final String className;
  final String conditionSummary;
  final String recommendationReason;
  final String startDate;
  final String endDate;
  final String status;
  final String createdBy;

  FacilityRecommendationModel({
    required this.recommendationNumber,
    required this.studentName,
    required this.nim,
    required this.className,
    required this.conditionSummary,
    required this.recommendationReason,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.createdBy,
  });

  factory FacilityRecommendationModel.dummy() {
    return FacilityRecommendationModel(
      recommendationNumber: 'CC/RLF/2026/001',
      studentName: 'Rafli Akbar',
      nim: '2301001',
      className: 'TI-2A',
      conditionSummary: 'Cedera ringan pada kaki kanan',
      recommendationReason:
          'Disarankan mendapatkan pertimbangan penggunaan lift sementara untuk mengurangi aktivitas naik turun tangga.',
      startDate: '16 Mei 2026',
      endDate: '23 Mei 2026',
      status: 'recommended_by_clinic',
      createdBy: 'Petugas Klinik CampusCare',
    );
  }
}
