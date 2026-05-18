import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/history_repository.dart';
import '../../domain/medical_record.dart';

class HistoryPage extends ConsumerWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final list = ref.watch(myHistoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Historial médico')),
      body: list.when(
        data: (records) {
          if (records.isEmpty) {
            return const _Empty();
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myHistoryProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: records.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _RecordCard(record: records[i]),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }
}

class _RecordCard extends StatelessWidget {
  const _RecordCard({required this.record});
  final MedicalRecord record;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = record.createdAt != null
        ? DateFormat("d 'de' MMMM y", 'es').format(record.createdAt!.toLocal())
        : '—';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.medical_information_rounded, color: scheme.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    record.diagnosis ?? 'Consulta médica',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    maxLines: 2, overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              [
                fmt,
                if (record.doctorName != null) 'Dr/a. ${record.doctorName}',
              ].join(' · '),
              style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.65)),
            ),
            const SizedBox(height: 10),
            if (record.symptoms != null && record.symptoms!.isNotEmpty)
              _Section(title: 'Síntomas', body: record.symptoms!),
            if (record.treatment != null && record.treatment!.isNotEmpty)
              _Section(title: 'Tratamiento', body: record.treatment!),
            if (record.medications != null && record.medications!.isNotEmpty)
              _Section(title: 'Medicamentos', body: record.medications!),
            if (record.requestedExams != null && record.requestedExams!.isNotEmpty)
              _Section(title: 'Exámenes solicitados', body: record.requestedExams!),
            if (record.observations != null && record.observations!.isNotEmpty)
              _Section(title: 'Observaciones', body: record.observations!),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.body});
  final String title, body;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: scheme.primary)),
          const SizedBox(height: 2),
          Text(body, style: const TextStyle(fontSize: 13, height: 1.35)),
        ],
      ),
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
            Icon(Icons.history_rounded, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Sin consultas previas registradas.'),
          ],
        ),
      ),
    );
  }
}
