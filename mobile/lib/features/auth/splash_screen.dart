import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage_service.dart';
import '../home/home_screen.dart';
import 'login_screen.dart';
import 'services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  final storage = SecureStorageService();

  late AnimationController animationController;
  late Animation<double> fadeAnimation;
  late Animation<double> scaleAnimation;

  @override
  void initState() {
    super.initState();

    animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    fadeAnimation = CurvedAnimation(
      parent: animationController,
      curve: Curves.easeIn,
    );

    scaleAnimation = Tween<double>(begin: 0.88, end: 1).animate(
      CurvedAnimation(parent: animationController, curve: Curves.easeOutBack),
    );

    animationController.forward();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    await Future.delayed(const Duration(seconds: 2));

    final apiClient = ApiClient(storage: storage);

    final authService = AuthService(storage: storage, apiClient: apiClient);

    try {
      final token = await storage.getToken();

      if (token == null || token.isEmpty) {
        goToLogin();
        return;
      }

      final user = await authService.getCurrentUser();

      if (!mounted) return;

      if (user.role != 'student') {
        await storage.deleteToken();
        goToLogin();
        return;
      }

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => HomeScreen(userName: user.name)),
      );
    } catch (e) {
      await storage.deleteToken();
      goToLogin();
    }
  }

  void goToLogin() {
    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  Widget logoImage() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: Image.asset(
        'assets/images/logo_splash_final.png',
        width: 130,
        height: 130,
        fit: BoxFit.cover,
      ),
    );
  }

  Widget loadingIndicator() {
    return const SizedBox(
      width: 30,
      height: 30,
      child: CircularProgressIndicator(strokeWidth: 3.5, color: Colors.white),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryGreen,
      body: SafeArea(
        child: Center(
          child: FadeTransition(
            opacity: fadeAnimation,
            child: ScaleTransition(
              scale: scaleAnimation,
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    logoImage(),

                    const SizedBox(height: 14),

                    const Text(
                      'SatyaCare',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 50,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // const Text(
                    //   'Smart Clinic Management System',
                    //   textAlign: TextAlign.center,
                    //   style: TextStyle(
                    //     color: Colors.white70,
                    //     fontSize: 18,
                    //     height: 1.4,
                    //   ),
                    // ),

                    // const SizedBox(height: 34),
                    loadingIndicator(),

                    const SizedBox(height: 60),

                    // const Text(
                    //   'Memeriksa sesi login...',
                    //   style: TextStyle(color: Colors.white70, fontSize: 18),
                    // ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
