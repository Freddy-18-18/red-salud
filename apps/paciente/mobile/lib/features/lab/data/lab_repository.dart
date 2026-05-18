import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/lab.dart';

class LabRepository {
  final SupabaseClient _client;
  LabRepository(this._client);

  Future<List<LabOrder>> myOrders() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('lab_orders')
        .select('id,order_number,ordered_at,estimated_delivery_at,'
            'presumptive_diagnosis,indicaciones_clinicas,status,prioridad,'
            'requiere_ayuno,patient_instructions,'
            'results:lab_results(id,result_at,result_pdf_url,general_observations,'
            'values:lab_result_values(parametro,valor,unidad,rango_referencia,'
            'es_anormal,nivel_alerta,orden))')
        .eq('patient_id', uid)
        .order('ordered_at', ascending: false);
    return (res as List)
        .map((row) => LabOrder.fromJson(row as Map<String, dynamic>))
        .toList();
  }
}

final labRepositoryProvider = Provider<LabRepository>((ref) {
  return LabRepository(ref.watch(supabaseClientProvider));
});

final myLabOrdersProvider = FutureProvider.autoDispose<List<LabOrder>>((ref) async {
  return ref.watch(labRepositoryProvider).myOrders();
});
