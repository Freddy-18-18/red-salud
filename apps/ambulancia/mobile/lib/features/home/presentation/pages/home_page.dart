import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Red Salud — Central de Emergencias'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text('Dashboard próximamente'),
      ),
    );
  }
}
