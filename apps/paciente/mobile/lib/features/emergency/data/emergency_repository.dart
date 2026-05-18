import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/emergency_contact.dart';

class EmergencyRepository {
  final SupabaseClient _client;
  EmergencyRepository(this._client);

  Future<List<EmergencyContact>> contacts() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('emergency_contacts')
        .select()
        .eq('patient_id', uid)
        .order('is_primary', ascending: false)
        .order('created_at');
    return (res as List).map((r) => EmergencyContact.fromJson(r as Map<String, dynamic>)).toList();
  }

  Future<void> add({required String name, String? phone, String? relationship, bool isPrimary = false}) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('No autenticado');
    await _client.from('emergency_contacts').insert({
      'patient_id': uid,
      'name': name,
      'phone': phone,
      'relationship': relationship,
      'is_primary': isPrimary,
    });
  }

  Future<void> remove(String id) async {
    await _client.from('emergency_contacts').delete().eq('id', id);
  }
}

final emergencyRepositoryProvider = Provider<EmergencyRepository>((ref) {
  return EmergencyRepository(ref.watch(supabaseClientProvider));
});

final myEmergencyContactsProvider = FutureProvider.autoDispose<List<EmergencyContact>>((ref) async {
  return ref.watch(emergencyRepositoryProvider).contacts();
});
