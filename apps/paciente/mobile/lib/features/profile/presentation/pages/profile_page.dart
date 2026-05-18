import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/providers/supabase_provider.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final scheme = Theme.of(context).colorScheme;
    final fullName = (user?.userMetadata?['full_name'] as String?) ?? user?.email ?? 'Paciente';

    return Scaffold(
      appBar: AppBar(title: const Text('Mi perfil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: scheme.primary.withValues(alpha: 0.14),
                    child: Icon(Icons.person_rounded, color: scheme.primary, size: 40),
                  ),
                  const SizedBox(height: 12),
                  Text(fullName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '',
                      style: TextStyle(fontSize: 13, color: scheme.onSurface.withValues(alpha: 0.7))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _SectionTitle(title: 'Cuenta'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                _Tile(icon: Icons.person_outline_rounded, label: 'Datos personales', onTap: () {}),
                _Divider(),
                _Tile(icon: Icons.shield_outlined, label: 'Perfil de emergencia', onTap: () {}),
                _Divider(),
                _Tile(icon: Icons.lock_outline_rounded, label: 'Cambiar contrasena', onTap: () {}),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _SectionTitle(title: 'App'),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                _Tile(icon: Icons.notifications_outlined, label: 'Notificaciones', onTap: () {}),
                _Divider(),
                _Tile(icon: Icons.help_outline_rounded, label: 'Soporte', onTap: () {}),
                _Divider(),
                _Tile(icon: Icons.info_outline_rounded, label: 'Acerca de', onTap: () {}),
              ],
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Cerrar sesion'),
            style: OutlinedButton.styleFrom(foregroundColor: scheme.error, side: BorderSide(color: scheme.error)),
            onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});
  final String title;
  @override
  Widget build(BuildContext context) =>
      Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700));
}

class _Tile extends StatelessWidget {
  const _Tile({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Divider(height: 1, color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.4));
}
