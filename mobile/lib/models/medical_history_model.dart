class MedicalHistoryModel {
  final String visitDate;
  final String complaint;
  final String diagnosis;
  final String serviceType;
  final String status;
  final String officer;
  final String notes;

  MedicalHistoryModel({
    required this.visitDate,
    required this.complaint,
    required this.diagnosis,
    required this.serviceType,
    required this.status,
    required this.officer,
    required this.notes,
  });

  static List<MedicalHistoryModel> dummyList() {
    return [
      MedicalHistoryModel(
        visitDate: '16 Mei 2026',
        complaint: 'Demam ringan dan sakit kepala',
        diagnosis: 'Gejala flu ringan',
        serviceType: 'Pemeriksaan Umum',
        status: 'completed',
        officer: 'Petugas Klinik CampusCare',
        notes: 'Disarankan istirahat cukup dan minum air putih.',
      ),
      MedicalHistoryModel(
        visitDate: '10 Mei 2026',
        complaint: 'Sakit gigi',
        diagnosis: 'Nyeri gigi ringan',
        serviceType: 'Konsultasi Ringan',
        status: 'completed',
        officer: 'Petugas Klinik CampusCare',
        notes: 'Disarankan konsultasi lanjutan ke dokter gigi jika berlanjut.',
      ),
      MedicalHistoryModel(
        visitDate: '02 Mei 2026',
        complaint: 'Nyeri perut ringan',
        diagnosis: 'Gangguan pencernaan ringan',
        serviceType: 'Pemeriksaan Umum',
        status: 'completed',
        officer: 'Petugas Klinik CampusCare',
        notes: 'Disarankan menjaga pola makan.',
      ),
    ];
  }
}
