import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../../core/constants/app_colors.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/info_banner.dart';
import '../../shared/widgets/status_badge.dart';

class LiftRecommendationScreen extends StatefulWidget {
  const LiftRecommendationScreen({super.key});

  @override
  State<LiftRecommendationScreen> createState() => _LiftRecommendationScreenState();
}

class _LiftRecommendationScreenState extends State<LiftRecommendationScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _recommendations = [];

  // Controllers untuk Form Pengajuan
  final _nimController = TextEditingController();
  final _reasonController = TextEditingController();
  final _conditionController = TextEditingController();
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchMyRecommendations();
  }

  @override
  void dispose() {
    _nimController.dispose();
    _reasonController.dispose();
    _conditionController.dispose();
    _startDateController.dispose();
    _endDateController.dispose();
    super.dispose();
  }

  // 1. MENGAMBIL DATA REKOMENDASI LIFT MILIK MAHASISWA
  Future<void> _fetchMyRecommendations() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final storage = SecureStorageService();
      final token = await storage.getToken();

      if (token == null || token.isEmpty) {
        setState(() {
          _errorMessage = 'Sesi habis. Silakan login kembali.';
          _isLoading = false;
        });
        return;
      }

      // GANTI DENGAN IP LAPTOP ANDA
      final url = Uri.parse('http://10.47.190.19:5000/api/lift-recommendations/me');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _recommendations = data['data'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Gagal memuat data (${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal terhubung ke server. Periksa koneksi Anda.';
        _isLoading = false;
      });
    }
  }

  // 2. MENGIRIM PENGAJUAN BARU KE BACKEND
  Future<void> _submitRecommendation() async {
    if (_nimController.text.isEmpty || _reasonController.text.isEmpty || _conditionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('NIM, Alasan, dan Kondisi Medis wajib diisi')),
      );
      return;
    }

    Navigator.pop(context); // Tutup dialog form

    setState(() {
      _isLoading = true;
    });

    try {
      final storage = SecureStorageService();
      final token = await storage.getToken();

      // GANTI DENGAN IP LAPTOP ANDA
      final url = Uri.parse('http://10.47.190.19:5000/api/lift-recommendations');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'nim': _nimController.text.trim(),
          'reason': _reasonController.text.trim(),
          'medical_condition': _conditionController.text.trim(),
          'start_date': _startDateController.text.isEmpty ? null : _startDateController.text.trim(),
          'end_date': _endDateController.text.isEmpty ? null : _endDateController.text.trim(),
          'status': 'waiting_validation' // Langsung masuk status 'Menunggu' di Web Admin
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pengajuan berhasil! Menunggu persetujuan Admin.'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
        _nimController.clear();
        _reasonController.clear();
        _conditionController.clear();
        _startDateController.clear();
        _endDateController.clear();
        _fetchMyRecommendations(); // Refresh tabel
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mengajukan (${response.statusCode})')),
        );
        setState(() => _isLoading = false);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Koneksi server terputus.')),
      );
      setState(() => _isLoading = false);
    }
  }

  // UI FORM DIALOG (MUNCUL SAAT TOMBOL + DITEKAN)
  void _showRequestDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Ajukan Izin Lift', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _nimController,
                  decoration: const InputDecoration(labelText: 'NIM Anda', prefixIcon: Icon(Icons.badge_outlined)),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _reasonController,
                  decoration: const InputDecoration(labelText: 'Diagnosa / Alasan Medis', prefixIcon: Icon(Icons.medical_information_outlined)),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _conditionController,
                  decoration: const InputDecoration(labelText: 'Kondisi Medis (misal: Cedera Kaki)', prefixIcon: Icon(Icons.accessible_forward)),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _startDateController,
                  decoration: const InputDecoration(labelText: 'Tgl Mulai (YYYY-MM-DD)', prefixIcon: Icon(Icons.calendar_today)),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _endDateController,
                  decoration: const InputDecoration(labelText: 'Tgl Selesai (YYYY-MM-DD)', prefixIcon: Icon(Icons.event_busy)),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: _submitRecommendation,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Kirim Pengajuan', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '-';
    try {
      final date = DateTime.parse(dateStr);
      return "${date.day}-${date.month}-${date.year}";
    } catch (e) {
      return dateStr.substring(0, 10);
    }
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
          Icon(Icons.accessible_forward_outlined, color: Colors.white, size: 42),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Rekomendasi Lift',
                  style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 6),
                Text(
                  'Ajukan dan pantau status izin penggunaan lift medis Anda.',
                  style: TextStyle(color: Colors.white70, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget detailItem({required String title, required String value, required IconData icon}) {
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
                Text(title, style: const TextStyle(color: AppColors.textGray, fontSize: 13)),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget recommendationCard(Map<String, dynamic> data) {
    return Container(
      padding: const EdgeInsets.all(18),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  data['recommendation_number'] ?? 'Pengajuan Baru',
                  style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ),
              StatusBadge(status: data['status'] ?? 'pending'),
            ],
          ),
          const SizedBox(height: 16),
          detailItem(
            title: 'Kondisi Medis',
            value: data['medical_condition'] ?? '-',
            icon: Icons.medical_information_outlined,
          ),
          detailItem(
            title: 'Alasan / Diagnosa',
            value: data['reason'] ?? '-',
            icon: Icons.accessible_outlined,
          ),
          detailItem(
            title: 'Masa Berlaku',
            value: '${_formatDate(data['start_date'])} s/d ${_formatDate(data['end_date'])}',
            icon: Icons.date_range_outlined,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Rekomendasi Lift')),
      // TOMBOL MELAYANG UNTUK MENGAJUKAN IZIN
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showRequestDialog,
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Ajukan Izin', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : RefreshIndicator(
              onRefresh: _fetchMyRecommendations,
              color: AppColors.primaryGreen,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  headerCard(),
                  const SizedBox(height: 16),
                  const InfoBanner(
                    title: 'Bukan Izin Final',
                    message: 'Klinik hanya memberikan rekomendasi medis. Setelah disetujui, tunjukkan ini ke petugas kampus.',
                    icon: Icons.info_outline,
                  ),
                  const SizedBox(height: 20),
                  
                  if (_errorMessage != null)
                    Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red))),

                  if (_recommendations.isEmpty && _errorMessage == null)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: Text("Anda belum memiliki pengajuan lift.", style: TextStyle(color: AppColors.textGray)),
                      ),
                    ),

                  ..._recommendations.map((item) => recommendationCard(item)).toList(),
                  const SizedBox(height: 60), // Space for floating button
                ],
              ),
            ),
    );
  }
}