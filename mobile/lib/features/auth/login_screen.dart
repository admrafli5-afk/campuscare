import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';
import '../home/home_screen.dart';
import 'services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController(
    text: 'rafli@student.campuscare.test',
  );

  final passwordController = TextEditingController(text: '123456');

  final storage = SecureStorageService();

  bool isLoading = false;
  bool obscurePassword = true;

  Future<void> handleLogin() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      showMessage('Email dan password wajib diisi');
      return;
    }

    setState(() {
      isLoading = true;
    });

    final apiClient = ApiClient(storage: storage);

    final authService = AuthService(storage: storage, apiClient: apiClient);

    try {
      final user = await authService.login(email: email, password: password);

      if (!mounted) return;

      if (user.role != 'student') {
        await storage.deleteToken();
        showMessage('Akun ini bukan akun mahasiswa');
        return;
      }

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => HomeScreen(userName: user.name)),
      );
    } catch (e) {
      showMessage(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  void showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.danger),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Widget logoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.softMint,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(
            Icons.health_and_safety_outlined,
            color: AppColors.primaryGreen,
            size: 34,
          ),
        ),
        const SizedBox(height: 18),
        const Text(
          'CampusCare',
          style: TextStyle(
            fontSize: 34,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryGreen,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Smart Clinic & Wellness Hub',
          style: TextStyle(color: AppColors.textGray, fontSize: 15),
        ),
      ],
    );
  }

  Widget infoBox() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.softMint,
        borderRadius: BorderRadius.circular(18),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.eco_outlined, color: AppColors.primaryGreen),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Gunakan akun mahasiswa untuk mengakses layanan klinik kampus secara digital.',
              style: TextStyle(
                color: AppColors.primaryGreen,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget loginCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          AppTextField(
            controller: emailController,
            label: 'Email Mahasiswa',
            hint: 'rafli@student.campuscare.test',
            keyboardType: TextInputType.emailAddress,
          ),

          const SizedBox(height: 16),

          AppTextField(
            controller: passwordController,
            label: 'Password',
            hint: 'Masukkan password',
            obscureText: obscurePassword,
            suffixIcon: IconButton(
              icon: Icon(
                obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
              onPressed: () {
                setState(() {
                  obscurePassword = !obscurePassword;
                });
              },
            ),
          ),

          const SizedBox(height: 24),

          AppButton(
            text: 'Masuk',
            icon: Icons.login,
            isLoading: isLoading,
            onPressed: handleLogin,
          ),
        ],
      ),
    );
  }

  Widget demoAccountInfo() {
    return const Text(
      'Akun demo: rafli@student.campuscare.test / 123456',
      textAlign: TextAlign.center,
      style: TextStyle(color: AppColors.textGray, fontSize: 12),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 28),
            logoSection(),
            const SizedBox(height: 28),
            infoBox(),
            const SizedBox(height: 20),
            loginCard(),
            const SizedBox(height: 16),
            demoAccountInfo(),
          ],
        ),
      ),
    );
  }
}
