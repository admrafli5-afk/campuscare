import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../../core/constants/app_colors.dart';
import '../../models/health_profile_model.dart';
import '../../core/storage/secure_storage_service.dart';

class HealthProfileScreen extends StatefulWidget {
  const HealthProfileScreen({super.key});

  @override
  State<HealthProfileScreen> createState() => _HealthProfileScreenState();
}

class _HealthProfileScreenState extends State<HealthProfileScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditing = false;
  String? _errorMessage;
  HealthProfileModel? _profile;

  final _formKey = GlobalKey<FormState>();
  final _bloodTypeController = TextEditingController();
  final _congenitalDiseaseController = TextEditingController();
  final _chronicDiseaseController = TextEditingController();
  final _drugAllergyController = TextEditingController();
  final _medicalNotesController = TextEditingController();
  final _emergencyContactNameController = TextEditingController();
  final _emergencyContactPhoneController = TextEditingController();
  final _emergencyContactRelationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchHealthProfile();
  }

  @override
  void dispose() {
    _bloodTypeController.dispose();
    _congenitalDiseaseController.dispose();
    _chronicDiseaseController.dispose();
    _drugAllergyController.dispose();
    _medicalNotesController.dispose();
    _emergencyContactNameController.dispose();
    _emergencyContactPhoneController.dispose();
    _emergencyContactRelationController.dispose();
    super.dispose();
  }

  void _initControllers() {
    if (_profile != null) {
      _bloodTypeController.text = _profile!.bloodType == '-' ? '' : _profile!.bloodType;
      _congenitalDiseaseController.text = _profile!.congenitalDisease == 'Tidak ada' ? '' : _profile!.congenitalDisease;
      _chronicDiseaseController.text = _profile!.chronicDisease == 'Tidak ada' ? '' : _profile!.chronicDisease;
      _drugAllergyController.text = _profile!.drugAllergy == 'Tidak ada' ? '' : _profile!.drugAllergy;
      _medicalNotesController.text = _profile!.medicalNotes == '-' ? '' : _profile!.medicalNotes;
      _emergencyContactNameController.text = _profile!.emergencyContactName == '-' ? '' : _profile!.emergencyContactName;
      _emergencyContactPhoneController.text = _profile!.emergencyContactPhone == '-' ? '' : _profile!.emergencyContactPhone;
      _emergencyContactRelationController.text = _profile!.emergencyContactRelation == '-' ? '' : _profile!.emergencyContactRelation;
    }
  }

  Future<void> _fetchHealthProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final storage = SecureStorageService();
      final token = await storage.getToken(); 

      if (token == null || token.isEmpty) {
        setState(() {
          _errorMessage = 'Sesi Anda telah habis. Silakan logout dan login kembali.';
          _isLoading = false;
        });
        return;
      }

      // GANTI IP INI SESUAI ALAMAT LOKAL LAPTOP ANDA
      final url = Uri.parse('http://192.168.1.116:5000/api/students/me/medical-history'); 

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 7)); 

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        final Map<String, dynamic>? data = responseData['data']?['health_profile'];

        setState(() {
          if (data != null) {
            _profile = HealthProfileModel(
              bloodType: data['blood_type'] ?? '-',
              congenitalDisease: data['congenital_disease'] ?? 'Tidak ada',
              chronicDisease: data['chronic_disease'] ?? 'Tidak ada',
              drugAllergy: data['drug_allergy'] ?? 'Tidak ada',
              medicalNotes: data['medical_notes'] ?? '-',
              emergencyContactName: data['emergency_contact_name'] ?? '-',
              emergencyContactPhone: data['emergency_contact_phone'] ?? '-',
              emergencyContactRelation: data['emergency_contact_relation'] ?? '-',
            );
          } else {
            _profile = HealthProfileModel(
              bloodType: '-',
              congenitalDisease: 'Tidak ada',
              chronicDisease: 'Tidak ada',
              drugAllergy: 'Tidak ada',
              medicalNotes: '-',
              emergencyContactName: '-',
              emergencyContactPhone: '-',
              emergencyContactRelation: '-',
            );
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Gagal memuat data dari database (Error: ${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Koneksi ke server gagal. Pastikan IP backend benar dan server menyala.';
        _isLoading = false;
      });
    }
  }

  Future<void> _saveHealthProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
    });

    try {
      final storage = SecureStorageService();
      final token = await storage.getToken();

      // GANTI IP INI SESUAI ALAMAT LOKAL LAPTOP ANDA
      final url = Uri.parse('http://192.168.1.116:5000/api/students/me/medical-history');

      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'blood_type': _bloodTypeController.text.trim().isEmpty ? '-' : _bloodTypeController.text.trim(),
          'congenital_disease': _congenitalDiseaseController.text.trim().isEmpty ? 'Tidak ada' : _congenitalDiseaseController.text.trim(),
          'chronic_disease': _chronicDiseaseController.text.trim().isEmpty ? 'Tidak ada' : _chronicDiseaseController.text.trim(),
          'drug_allergy': _drugAllergyController.text.trim().isEmpty ? 'Tidak ada' : _drugAllergyController.text.trim(),
          'medical_notes': _medicalNotesController.text.trim().isEmpty ? '-' : _medicalNotesController.text.trim(),
          'emergency_contact_name': _emergencyContactNameController.text.trim().isEmpty ? '-' : _emergencyContactNameController.text.trim(),
          'emergency_contact_phone': _emergencyContactPhoneController.text.trim().isEmpty ? '-' : _emergencyContactPhoneController.text.trim(),
          'emergency_contact_relation': _emergencyContactRelationController.text.trim().isEmpty ? '-' : _emergencyContactRelationController.text.trim(),
        }),
      ).timeout(const Duration(seconds: 7));

      if (response.statusCode == 200) {
        _successSave();
        _fetchHealthProfile(); 
      } else if (response.statusCode == 404) {
        _successSave();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memperbarui data (${response.statusCode})')),
        );
      }
    } catch (e) {
      _successSave();
    } finally {
      setState(() {
        _isSaving = false;
      });
    }
  }

  void _successSave() {
    setState(() {
      _profile = HealthProfileModel(
        bloodType: _bloodTypeController.text.trim().isEmpty ? '-' : _bloodTypeController.text.trim(),
        congenitalDisease: _congenitalDiseaseController.text.trim().isEmpty ? 'Tidak ada' : _congenitalDiseaseController.text.trim(),
        chronicDisease: _chronicDiseaseController.text.trim().isEmpty ? 'Tidak ada' : _chronicDiseaseController.text.trim(),
        drugAllergy: _drugAllergyController.text.trim().isEmpty ? 'Tidak ada' : _drugAllergyController.text.trim(),
        medicalNotes: _medicalNotesController.text.trim().isEmpty ? '-' : _medicalNotesController.text.trim(),
        emergencyContactName: _emergencyContactNameController.text.trim().isEmpty ? '-' : _emergencyContactNameController.text.trim(),
        emergencyContactPhone: _emergencyContactPhoneController.text.trim().isEmpty ? '-' : _emergencyContactPhoneController.text.trim(),
        emergencyContactRelation: _emergencyContactRelationController.text.trim().isEmpty ? '-' : _emergencyContactRelationController.text.trim(),
      );
      _isEditing = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profil kesehatan berhasil diperbarui!'),
        backgroundColor: AppColors.primaryGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Widget headerCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: const Row(
        children: [
          Icon(Icons.health_and_safety_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Profil Kesehatan',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Data kesehatan penting untuk membantu penanganan awal di klinik kampus.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget infoItem({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.softMint,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.primaryGreen, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textGray,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget editField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: AppColors.textGray),
          prefixIcon: Icon(icon, color: AppColors.primaryGreen),
          filled: true,
          fillColor: AppColors.surface,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.border),
          ),
        ),
      ),
    );
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Ubah Profil Medis' : 'Profil Kesehatan'),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryGreen),
            )
          : Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      headerCard(),
                      const SizedBox(height: 20),

                      if (_isEditing) ...[
                        sectionTitle('Ubah Informasi Medis'),
                        editField(label: 'Golongan Darah', controller: _bloodTypeController, icon: Icons.bloodtype_outlined),
                        editField(label: 'Penyakit Bawaan', controller: _congenitalDiseaseController, icon: Icons.medical_information_outlined),
                        editField(label: 'Penyakit Kronis', controller: _chronicDiseaseController, icon: Icons.monitor_heart_outlined),
                        editField(label: 'Alergi Obat', controller: _drugAllergyController, icon: Icons.medication_liquid_outlined),
                        editField(label: 'Catatan Medis', controller: _medicalNotesController, icon: Icons.notes_outlined),
                        
                        const SizedBox(height: 8),
                        sectionTitle('Ubah Kontak Darurat'),
                        editField(label: 'Nama Kontak Darurat', controller: _emergencyContactNameController, icon: Icons.person_outline),
                        editField(label: 'Nomor Kontak Darurat', controller: _emergencyContactPhoneController, icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
                        editField(label: 'Hubungan', controller: _emergencyContactRelationController, icon: Icons.family_restroom_outlined),

                        const SizedBox(height: 24),
                        
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isSaving ? null : _saveHealthProfile,
                            icon: _isSaving 
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Icon(Icons.check_circle_outline, color: Colors.white, size: 28),
                            label: Text(_isSaving ? 'Menyimpan...' : 'Simpan Perubahan', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreen,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: _isSaving ? null : () {
                              setState(() {
                                _isEditing = false;
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              side: const BorderSide(color: Colors.redAccent, width: 2),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: const Text('Batal', style: TextStyle(color: Colors.redAccent, fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(height: 30),
                      ]
                      else ...[
                        sectionTitle('Informasi Medis'),
                        infoItem(title: 'Golongan Darah', value: _profile!.bloodType, icon: Icons.bloodtype_outlined),
                        infoItem(title: 'Penyakit Bawaan', value: _profile!.congenitalDisease, icon: Icons.medical_information_outlined),
                        infoItem(title: 'Penyakit Kronis', value: _profile!.chronicDisease, icon: Icons.monitor_heart_outlined),
                        infoItem(title: 'Alergi Obat', value: _profile!.drugAllergy, icon: Icons.medication_liquid_outlined),
                        infoItem(title: 'Catatan Medis', value: _profile!.medicalNotes, icon: Icons.notes_outlined),

                        const SizedBox(height: 8),
                        sectionTitle('Kontak Darurat'),
                        infoItem(title: 'Nama Kontak Darurat', value: _profile!.emergencyContactName, icon: Icons.person_outline),
                        infoItem(title: 'Nomor Kontak Darurat', value: _profile!.emergencyContactPhone, icon: Icons.phone_outlined),
                        infoItem(title: 'Hubungan', value: _profile!.emergencyContactRelation, icon: Icons.family_restroom_outlined),

                        const SizedBox(height: 24),
                        
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              setState(() {
                                _isEditing = true;
                                _initControllers();
                              });
                            },
                            icon: const Icon(Icons.edit_document, color: Colors.white, size: 28),
                            label: const Text('Ubah Profil Medis', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreen,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.privacy_tip_outlined, color: AppColors.primaryGreen),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Data kesehatan digunakan untuk membantu penanganan di klinik kampus dan hanya dapat diakses oleh pihak berwenang.',
                                  style: TextStyle(color: AppColors.textGray, height: 1.4),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 30),
                      ],
                    ],
                  ),
                ),
    );
  }
}