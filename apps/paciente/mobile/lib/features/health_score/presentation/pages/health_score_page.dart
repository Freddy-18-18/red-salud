import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../data/health_repository.dart';
import '../../domain/health_metric.dart';

class HealthScorePage extends ConsumerWidget {
  const HealthScorePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metrics = ref.watch(myMetricsProvider);
    final goals = ref.watch(myGoalsProvider);
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Health Score')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myMetricsProvider);
          ref.invalidate(myGoalsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Score card (heuristic: based on goals progress + recent metrics)
            metrics.when(
              data: (m) => goals.when(
                data: (g) => _ScoreCard(score: _computeScore(metrics: m, goals: g)),
                loading: () => const _ScoreSkeleton(),
                error: (_, __) => const _ScoreCard(score: 0),
              ),
              loading: () => const _ScoreSkeleton(),
              error: (_, __) => const _ScoreCard(score: 0),
            ),
            const SizedBox(height: 24),
            Text('Metas activas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: scheme.onSurface)),
            const SizedBox(height: 10),
            goals.when(
              data: (list) {
                if (list.isEmpty) {
                  return _EmptyMini(
                    icon: Icons.flag_outlined,
                    text: 'Aún no tienes metas de salud activas.',
                  );
                }
                return Column(children: list.map((g) => _GoalCard(goal: g)).toList());
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text(e.toString()),
            ),
            const SizedBox(height: 24),
            Text('Mediciones recientes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: scheme.onSurface)),
            const SizedBox(height: 10),
            metrics.when(
              data: (list) {
                if (list.isEmpty) {
                  return _EmptyMini(
                    icon: Icons.monitor_heart_outlined,
                    text: 'Sin mediciones registradas. Tu médico puede registrarlas en cada visita.',
                  );
                }
                return Column(children: list.take(10).map((m) => _MetricRow(metric: m)).toList());
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text(e.toString()),
            ),
          ],
        ),
      ),
    );
  }

  int _computeScore({required List<HealthMetric> metrics, required List<HealthGoal> goals}) {
    if (metrics.isEmpty && goals.isEmpty) return 60;
    final goalAvg = goals.isEmpty ? 0.5 : (goals.map((g) => g.progressPct).reduce((a, b) => a + b) / goals.length);
    final metricBonus = metrics.length.clamp(0, 20) / 20.0; // up to +20%
    final base = 0.6 * goalAvg + 0.4 * metricBonus;
    return (base * 100).clamp(30, 100).round();
  }
}

class _ScoreCard extends StatelessWidget {
  const _ScoreCard({required this.score});
  final int score;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color = score >= 80 ? Colors.green : score >= 60 ? Colors.amber : Colors.red;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            SizedBox(
              width: 96, height: 96,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CircularProgressIndicator(
                    value: score / 100,
                    strokeWidth: 9,
                    backgroundColor: scheme.outline.withValues(alpha: 0.2),
                    valueColor: AlwaysStoppedAnimation(color),
                  ),
                  Text('$score', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: color)),
                ],
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tu salud', style: TextStyle(fontSize: 13, color: scheme.onSurface.withValues(alpha: 0.65))),
                  const SizedBox(height: 2),
                  Text(_label(score), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(
                    _hint(score),
                    style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.7)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _label(int s) => s >= 80 ? 'Excelente' : s >= 60 ? 'Buena' : 'Necesita atención';
  String _hint(int s) => s >= 80
      ? 'Estás cumpliendo tus metas. Sigue así.'
      : s >= 60
          ? 'Vas bien, hay margen para mejorar.'
          : 'Conviene retomar mediciones y consultar a tu médico.';
}

class _ScoreSkeleton extends StatelessWidget {
  const _ScoreSkeleton();
  @override
  Widget build(BuildContext context) =>
      const Card(child: SizedBox(height: 132, child: Center(child: CircularProgressIndicator())));
}

class _GoalCard extends StatelessWidget {
  const _GoalCard({required this.goal});
  final HealthGoal goal;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final pct = (goal.progressPct * 100).round();
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(Icons.flag_rounded, color: scheme.primary, size: 18),
              const SizedBox(width: 6),
              Expanded(child: Text(goal.title, style: const TextStyle(fontWeight: FontWeight.w700))),
              Text('$pct%', style: TextStyle(color: scheme.primary, fontWeight: FontWeight.w700)),
            ]),
            if (goal.description != null) ...[
              const SizedBox(height: 4),
              Text(goal.description!, style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.7))),
            ],
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: goal.progressPct,
                backgroundColor: scheme.outline.withValues(alpha: 0.2),
                color: scheme.primary,
                minHeight: 6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  const _MetricRow({required this.metric});
  final HealthMetric metric;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(Icons.show_chart_rounded, color: scheme.primary),
        title: Text(
          'Valor: ${metric.value}${metric.secondaryValue != null ? "/${metric.secondaryValue}" : ""}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(DateFormat('d MMM y, HH:mm', 'es').format(metric.measuredAt.toLocal())),
        trailing: metric.device != null ? Chip(label: Text(metric.device!), padding: EdgeInsets.zero) : null,
      ),
    );
  }
}

class _EmptyMini extends StatelessWidget {
  const _EmptyMini({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.outline.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: scheme.onSurface.withValues(alpha: 0.5)),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.7)))),
        ],
      ),
    );
  }
}
