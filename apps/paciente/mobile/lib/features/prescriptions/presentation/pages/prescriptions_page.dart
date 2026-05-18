import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/prescriptions_repository.dart';
import '../../domain/prescription.dart';

class PrescriptionsPage extends ConsumerWidget {
  const PrescriptionsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final list = ref.watch(myPrescriptionsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Mis recetas')),
      body: list.when(
        data: (rxs) {
          if (rxs.isEmpty) return const _Empty();
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myPrescriptionsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rxs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _RxCard(prescription: rxs[i]),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }
}

class _RxCard extends StatelessWidget {
  const _RxCard({required this.prescription});
  final Prescription prescription;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = prescription.prescribedAt != null
        ? DateFormat('d MMM y', 'es').format(prescription.prescribedAt!)
        : 'Fecha desconocida';
    final expFmt = prescription.expiresAt != null
        ? DateFormat('d MMM y', 'es').format(prescription.expiresAt!)
        : null;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.medical_services_rounded, color: scheme.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    prescription.diagnosis ?? 'Receta médica',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                ),
                _StatusChip(status: prescription.status, expired: prescription.isExpired),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              [
                fmt,
                if (prescription.doctorName != null) 'Dr/a. ${prescription.doctorName}',
                if (expFmt != null) 'Vence: $expFmt',
              ].join(' · '),
              style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.65)),
            ),
            const SizedBox(height: 12),
            for (final med in prescription.medications) _MedRow(med: med),
            if (prescription.generalInstructions != null && prescription.generalInstructions!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: scheme.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: scheme.outline.withValues(alpha: 0.4)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline_rounded, size: 16, color: scheme.onSurface.withValues(alpha: 0.6)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(prescription.generalInstructions!, style: const TextStyle(fontSize: 12, height: 1.35)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MedRow extends StatelessWidget {
  const _MedRow({required this.med});
  final PrescriptionMedication med;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final detail = [med.dose, med.frequency, if (med.durationDays != null) '${med.durationDays} días']
        .where((e) => e != null && e.isNotEmpty).join(' · ');
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: scheme.primary.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.medication_rounded, color: scheme.primary, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(med.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                if (detail.isNotEmpty)
                  Text(detail, style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.7))),
                if (med.specialInstructions != null && med.specialInstructions!.isNotEmpty)
                  Text(med.specialInstructions!,
                      style: TextStyle(fontSize: 11, color: scheme.onSurface.withValues(alpha: 0.6), fontStyle: FontStyle.italic)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status, required this.expired});
  final String status;
  final bool expired;
  @override
  Widget build(BuildContext context) {
    Color color = Colors.grey;
    String label = status;
    if (expired) {
      color = Colors.red; label = 'Vencida';
    } else if (status == 'active') {
      color = Colors.green; label = 'Activa';
    } else if (status == 'partial') {
      color = Colors.orange; label = 'Parcial';
    } else if (status == 'dispensed') {
      color = Colors.blue; label = 'Dispensada';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)),
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
            Icon(Icons.medical_services_outlined, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Aún no tienes recetas registradas.'),
            const SizedBox(height: 6),
            Text('Tus médicos podrán prescribir tratamientos durante o después de la consulta.',
              textAlign: TextAlign.center,
              style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.6)),
            ),
          ],
        ),
      ),
    );
  }
}
