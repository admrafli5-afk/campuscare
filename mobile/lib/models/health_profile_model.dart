class HealthProfileModel {
  final String bloodType;
  final String congenitalDisease;
  final String chronicDisease;
  final String drugAllergy;
  final String medicalNotes;
  final String emergencyContactName;
  final String emergencyContactPhone;
  final String emergencyContactRelation;

  HealthProfileModel({
    required this.bloodType,
    required this.congenitalDisease,
    required this.chronicDisease,
    required this.drugAllergy,
    required this.medicalNotes,
    required this.emergencyContactName,
    required this.emergencyContactPhone,
    required this.emergencyContactRelation,
  });

  factory HealthProfileModel.dummy() {
    return HealthProfileModel(
      bloodType: 'O',
      congenitalDisease: 'Tidak ada',
      chronicDisease: 'Tidak ada',
      drugAllergy: 'Tidak ada',
      medicalNotes: 'Mahasiswa dalam kondisi umum baik.',
      emergencyContactName: 'Orang Tua / Wali',
      emergencyContactPhone: '0812-0000-0000',
      emergencyContactRelation: 'Orang Tua',
    );
  }
}
