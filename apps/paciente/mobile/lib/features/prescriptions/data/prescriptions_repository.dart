import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/prescription.dart';

class PrescriptionsRepository {
  final SupabaseClient _client;
  PrescriptionsRepository(this._client);

  /// All prescriptions for the current user, with medications and prescribing
  /// doctor. RLS filters by `patient_id = auth.uid`.
  Future<List<Prescription>> mine() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('prescriptions')
        .select('id,doctor_id,prescribed_at,expires_at,diagnosis,'
            'general_instructions,status,'
            'medications:prescription_medications(id,medication_name,dosis,'
            'frecuencia,via_administracion,duration_days,total_quantity,'
            'special_instructions),'
            'doctor:doctor_profiles!prescriptions_doctor_id_fkey('
            'profile:profiles!doctor_details_profile_id_fkey(full_name))')
        .eq('patient_id', uid)
        .filter('deleted_at', 'is', null)
        .order('prescribed_at', ascending: false);
    return (res as List)
        .map((row) => Prescription.fromJson(row as Map<String, dynamic>))
        .toList();
  }
}

final prescriptionsRepositoryProvider = Provider<PrescriptionsRepository>((ref) {
  return PrescriptionsRepository(ref.watch(supabaseClientProvider));
});

final myPrescriptionsProvider = FutureProvider.autoDispose<List<Prescription>>((ref) async {
  return ref.watch(prescriptionsRepositoryProvider).mine();
});
