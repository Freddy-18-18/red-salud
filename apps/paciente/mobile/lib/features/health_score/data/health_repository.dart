import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/health_metric.dart';

class HealthRepository {
  final SupabaseClient _client;
  HealthRepository(this._client);

  Future<List<HealthMetric>> recentMetrics({int limit = 30}) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('health_metrics')
        .select()
        .eq('patient_id', uid)
        .order('measured_at', ascending: false)
        .limit(limit);
    return (res as List).map((r) => HealthMetric.fromJson(r as Map<String, dynamic>)).toList();
  }

  Future<List<HealthGoal>> activeGoals() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('health_goals')
        .select()
        .eq('patient_id', uid)
        .eq('status', 'active')
        .order('target_date', ascending: true);
    return (res as List).map((r) => HealthGoal.fromJson(r as Map<String, dynamic>)).toList();
  }
}

final healthRepositoryProvider = Provider<HealthRepository>((ref) {
  return HealthRepository(ref.watch(supabaseClientProvider));
});

final myMetricsProvider = FutureProvider.autoDispose<List<HealthMetric>>((ref) async {
  return ref.watch(healthRepositoryProvider).recentMetrics();
});

final myGoalsProvider = FutureProvider.autoDispose<List<HealthGoal>>((ref) async {
  return ref.watch(healthRepositoryProvider).activeGoals();
});
