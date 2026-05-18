import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/medical_record.dart';

class HistoryRepository {
  final SupabaseClient _client;
  HistoryRepository(this._client);

  Future<List<MedicalRecord>> mine() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('medical_records')
        .select('id,doctor_id,created_at,diagnosis,sintomas,tratamiento,'
            'medicamentos,requested_exams,observations,'
            'doctor:doctor_profiles!medical_records_doctor_id_fkey('
            'profile:profiles!doctor_details_profile_id_fkey(full_name))')
        .eq('patient_id', uid)
        .filter('deleted_at', 'is', null)
        .order('created_at', ascending: false);
    return (res as List)
        .map((r) => MedicalRecord.fromJson(r as Map<String, dynamic>))
        .toList();
  }
}

final historyRepositoryProvider = Provider<HistoryRepository>((ref) {
  return HistoryRepository(ref.watch(supabaseClientProvider));
});

final myHistoryProvider = FutureProvider.autoDispose<List<MedicalRecord>>((ref) async {
  return ref.watch(historyRepositoryProvider).mine();
});
