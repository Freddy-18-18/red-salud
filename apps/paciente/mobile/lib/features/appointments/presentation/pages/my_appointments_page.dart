import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/appointments_repository.dart';
import '../../domain/appointment.dart';

class MyAppointmentsPage extends ConsumerWidget {
  const MyAppointmentsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appts = ref.watch(myAppointmentsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Mis citas')),
      body: appts.when(
        data: (list) {
          final upcoming = list.where((a) => a.isUpcoming).toList()
            ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
          final past = list.where((a) => !a.isUpcoming).toList()
            ..sort((a, b) => b.scheduledAt.compareTo(a.scheduledAt));
          if (list.isEmpty) {
            return const _Empty();
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myAppointmentsProvider.future),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                if (upcoming.isNotEmpty) ...[
                  const _Header('Proximas'),
                  const SizedBox(height: 8),
                  for (final a in upcoming) ...[
                    _ApptCard(appointment: a),
                    const SizedBox(height: 10),
                  ],
                  const SizedBox(height: 16),
                ],
                if (past.isNotEmpty) ...[
                  const _Header('Anteriores'),
                  const SizedBox(height: 8),
                  for (final a in past) ...[
                    _ApptCard(appointment: a, dim: true),
                    const SizedBox(height: 10),
                  ],
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header(this.text);
  final String text;
  @override
  Widget build(BuildContext context) =>
      Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700));
}

class _ApptCard extends StatelessWidget {
  const _ApptCard({required this.appointment, this.dim = false});
  final Appointment appointment;
  final bool dim;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = DateFormat("EEEE d MMM, HH:mm", 'es').format(appointment.scheduledAt.toLocal());
    return Opacity(
      opacity: dim ? 0.7 : 1,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.event_rounded, size: 18, color: scheme.primary),
                  const SizedBox(width: 8),
                  Text(fmt, style: const TextStyle(fontWeight: FontWeight.w600)),
                  const Spacer(),
                  _StatusChip(status: appointment.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(appointment.reason, style: const TextStyle(fontSize: 14)),
              if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(appointment.notes!, style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.7))),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;
  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'pending' => ('Pendiente', Colors.amber),
      'confirmed' => ('Confirmada', Colors.green),
      'completed' => ('Completada', Colors.blue),
      'cancelled' => ('Cancelada', Colors.red),
      _ => (status, Colors.grey),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.event_busy_rounded, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Aun no tienes citas agendadas.'),
            const SizedBox(height: 6),
            Text('Busca un medico desde la pestaña Buscar.', style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.6))),
          ],
        ),
      ),
    );
  }
}
