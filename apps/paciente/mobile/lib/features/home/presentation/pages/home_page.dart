import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/providers/supabase_provider.dart';
import '../../../appointments/data/appointments_repository.dart';
import '../../../appointments/domain/appointment.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final appts = ref.watch(myAppointmentsProvider);
    final scheme = Theme.of(context).colorScheme;
    final fullName = (user?.userMetadata?['full_name'] as String?) ?? user?.email ?? 'Paciente';
    final firstName = fullName.split(' ').first;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hola, $firstName 👋', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            Text(
              _greeting(),
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, color: scheme.onSurface.withValues(alpha: 0.65)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(myAppointmentsProvider.future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            _PrimaryCta(
              icon: Icons.search_rounded,
              title: 'Encuentra a tu medico',
              subtitle: 'Busca por especialidad o nombre',
              onTap: () => context.go('/buscar'),
            ),
            const SizedBox(height: 16),
            const _SectionHeader('Tu proxima cita'),
            const SizedBox(height: 8),
            appts.when(
              data: (list) {
                final next = list.where((a) => a.isUpcoming).toList()
                  ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
                if (next.isEmpty) return const _EmptyAppointment();
                return _AppointmentCard(appointment: next.first);
              },
              loading: () => const _SkeletonCard(),
              error: (e, _) => _ErrorCard(message: e.toString()),
            ),
            const SizedBox(height: 24),
            const _SectionHeader('Accesos rapidos'),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.45,
              children: [
                _QuickAction(icon: Icons.event_rounded, label: 'Mis citas', onTap: () => context.go('/citas')),
                _QuickAction(icon: Icons.chat_bubble_rounded, label: 'Mensajes', onTap: () => context.go('/mensajes')),
                _QuickAction(icon: Icons.medical_services_rounded, label: 'Recetas', onTap: () => context.push('/recetas')),
                _QuickAction(icon: Icons.science_rounded, label: 'Laboratorio', onTap: () => context.push('/lab')),
                _QuickAction(icon: Icons.history_rounded, label: 'Historial', onTap: () => context.push('/historial')),
                _QuickAction(icon: Icons.contact_emergency_rounded, label: 'Emergencia', onTap: () => context.push('/emergencia')),
                _QuickAction(icon: Icons.monitor_heart_rounded, label: 'Health Score', onTap: () => context.push('/health-score')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Buenos dias';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;
  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700));
  }
}

class _PrimaryCta extends StatelessWidget {
  const _PrimaryCta({required this.icon, required this.title, required this.subtitle, required this.onTap});
  final IconData icon;
  final String title, subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.primary,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: Colors.white, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_rounded, color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({required this.appointment});
  final Appointment appointment;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = DateFormat("EEEE d 'de' MMMM, HH:mm", 'es').format(appointment.scheduledAt.toLocal());
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: scheme.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(Icons.event_available_rounded, color: scheme.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(appointment.reason, style: const TextStyle(fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(fmt, style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.7))),
                ],
              ),
            ),
            Chip(label: Text(appointment.status.toUpperCase())),
          ],
        ),
      ),
    );
  }
}

class _EmptyAppointment extends StatelessWidget {
  const _EmptyAppointment();
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Icon(Icons.event_busy_rounded, color: scheme.onSurface.withValues(alpha: 0.45)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'No tienes citas proximas. Agenda con un medico desde Buscar.',
                style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.75)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();
  @override
  Widget build(BuildContext context) => const Card(
        child: SizedBox(height: 84, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
      );
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text('Error: $message', style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ),
      );
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: scheme.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: scheme.primary, size: 22),
              ),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
