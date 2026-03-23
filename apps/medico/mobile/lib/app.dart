import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'features/auth/presentation/pages/login_page.dart';
import 'features/home/presentation/pages/home_page.dart';

class RedSaludMedicoApp extends StatelessWidget {
  const RedSaludMedicoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Red Salud - Consultorio Médico',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF2563EB),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        colorSchemeSeed: const Color(0xFF2563EB),
        useMaterial3: true,
        brightness: Brightness.dark,
      ),
      routerConfig: _router,
    );
  }

  static final _router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, __) => const HomePage()),
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
    ],
  );
}
