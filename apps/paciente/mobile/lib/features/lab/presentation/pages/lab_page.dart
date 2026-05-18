import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/lab_repository.dart';
import '../../domain/lab.dart';

class LabPage extends ConsumerWidget {
  const LabPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final list = ref.watch(myLabOrdersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Laboratorio')),
      body: list.when(
        data: (orders) {
          if (orders.isEmpty) return const _Empty();
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myLabOrdersProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _OrderCard(order: orders[i]),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final LabOrder order;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = order.orderedAt != null ? DateFormat('d MMM y', 'es').format(order.orderedAt!) : '—';
    return Card(
      child: ExpansionTile(
        leading: Icon(Icons.science_rounded, color: scheme.primary),
        title: Text(
          order.orderNumber ?? 'Orden #${order.id.substring(0, 6)}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text('$fmt · ${_statusLabel(order.status)}'),
        trailing: order.hasResults
            ? Chip(
                avatar: Icon(Icons.check_rounded, size: 14, color: scheme.primary),
                label: const Text('Listo'),
                padding: EdgeInsets.zero,
              )
            : const Chip(label: Text('En proceso'), padding: EdgeInsets.zero),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (order.presumptiveDiagnosis != null)
                  _Field(label: 'Diagnóstico presuntivo', value: order.presumptiveDiagnosis!),
                if (order.clinicalIndications != null)
                  _Field(label: 'Indicaciones clínicas', value: order.clinicalIndications!),
                if (order.requiresFasting)
                  _Field(label: 'Ayuno requerido', value: 'Sí'),
                if (order.patientInstructions != null)
                  _Field(label: 'Instrucciones', value: order.patientInstructions!),
                if (order.hasResults) ...[
                  const SizedBox(height: 12),
                  const Text('Resultados', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  for (final r in order.results) _ResultBlock(result: r),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String s) => switch (s) {
        'pending' => 'Pendiente',
        'sample_collected' => 'Muestra recolectada',
        'in_progress' => 'En análisis',
        'completed' => 'Completado',
        'cancelled' => 'Cancelado',
        _ => s,
      };
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.value});
  final String label, value;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: scheme.onSurface.withValues(alpha: 0.6))),
          const SizedBox(height: 1),
          Text(value, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }
}

class _ResultBlock extends StatelessWidget {
  const _ResultBlock({required this.result});
  final LabResult result;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: scheme.outline.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (result.resultAt != null)
            Text(
              DateFormat("d MMM y, HH:mm", 'es').format(result.resultAt!.toLocal()),
              style: TextStyle(fontSize: 11, color: scheme.onSurface.withValues(alpha: 0.6)),
            ),
          const SizedBox(height: 6),
          for (final v in result.values) _ValueRow(value: v),
          if (result.generalObservations != null && result.generalObservations!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(result.generalObservations!,
                style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: scheme.onSurface.withValues(alpha: 0.7))),
          ],
        ],
      ),
    );
  }
}

class _ValueRow extends StatelessWidget {
  const _ValueRow({required this.value});
  final LabResultValue value;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color = value.isAbnormal ? Colors.red : scheme.onSurface;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(child: Text(value.parameter, style: const TextStyle(fontSize: 12))),
          Text(
            '${value.value ?? "—"}${value.unit != null ? " ${value.unit}" : ""}',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color),
          ),
          if (value.referenceRange != null) ...[
            const SizedBox(width: 8),
            Text(
              '(${value.referenceRange})',
              style: TextStyle(fontSize: 10, color: scheme.onSurface.withValues(alpha: 0.5)),
            ),
          ],
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
            Icon(Icons.science_outlined, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Aún no tienes órdenes de laboratorio.'),
          ],
        ),
      ),
    );
  }
}
