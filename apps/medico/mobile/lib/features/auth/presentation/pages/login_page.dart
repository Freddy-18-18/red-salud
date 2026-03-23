import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Iniciar Sesión',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Red Salud — Consultorio Médico',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              const SizedBox(height: 32),
              // Auth form will be implemented here
              const Text('Formulario de autenticación próximamente'),
            ],
          ),
        ),
      ),
    );
  }
}
