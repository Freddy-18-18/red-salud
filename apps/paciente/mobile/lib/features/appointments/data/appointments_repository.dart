import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/api_client_provider.dart';
import '../domain/appointment.dart';

class AppointmentConflict implements Exception {
  final String message;
  AppointmentConflict(this.message);
  @override
  String toString() => message;
}

class AppointmentsRepository {
  final Dio _dio;
  AppointmentsRepository(this._dio);

  /// List appointments for the current authenticated user. The gateway
  /// resolves the user id from the Bearer JWT — no patient id is needed.
  Future<List<Appointment>> list({String? status, DateTime? from, DateTime? to}) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/appointments',
      queryParameters: {
        if (status != null) 'status': status,
        if (from != null) 'from': from.toUtc().toIso8601String(),
        if (to != null) 'to': to.toUtc().toIso8601String(),
        'page_size': 100,
      },
    );
    final raw = (res.data?['data'] as List?) ?? const [];
    return raw.map((e) => Appointment.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Book a new appointment. Throws [AppointmentConflict] on 409 (slot taken).
  Future<Appointment> create(CreateAppointmentInput input) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/appointments',
        data: input.toJson(),
      );
      final data = res.data?['data'] as Map<String, dynamic>?;
      if (data == null) throw Exception('Empty response from gateway');
      return Appointment.fromJson(data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        final msg = (e.response?.data is Map)
            ? (e.response?.data['message'] as String? ?? 'El horario ya no está disponible.')
            : 'El horario ya no está disponible.';
        throw AppointmentConflict(msg);
      }
      rethrow;
    }
  }
}

final appointmentsRepositoryProvider = Provider<AppointmentsRepository>((ref) {
  return AppointmentsRepository(ref.watch(gatewayDioProvider));
});

final myAppointmentsProvider = FutureProvider.autoDispose<List<Appointment>>((ref) async {
  final repo = ref.watch(appointmentsRepositoryProvider);
  return repo.list();
});
