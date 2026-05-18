import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/api_client_provider.dart';
import '../domain/doctor.dart';

class DoctorsRepository {
  final Dio _dio;
  DoctorsRepository(this._dio);

  Future<DoctorSearchResult> search(DoctorSearchFilters filters) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/doctors/search',
      queryParameters: filters.toQueryParams(),
    );
    return DoctorSearchResult.fromJson(res.data ?? const {});
  }

  /// Available time slots for a doctor on a given date (YYYY-MM-DD).
  Future<List<DoctorAvailabilitySlot>> availability({
    required String doctorId,
    required String date,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/doctors/$doctorId/availability',
      queryParameters: {'date': date},
    );
    final raw = (res.data?['data'] as List?) ?? const [];
    return raw
        .map((e) => DoctorAvailabilitySlot.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Days with at least one open slot in the next [daysAhead] days.
  Future<List<DoctorAvailableDate>> availableDates({
    required String doctorId,
    int daysAhead = 30,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/doctors/$doctorId/availability',
      queryParameters: {'days_ahead': daysAhead},
    );
    final raw = (res.data?['data'] as List?) ?? const [];
    return raw
        .map((e) => DoctorAvailableDate.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

class DoctorAvailabilitySlot {
  final DateTime start;
  final DateTime end;
  final bool isAvailable;

  DoctorAvailabilitySlot({required this.start, required this.end, required this.isAvailable});

  factory DoctorAvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return DoctorAvailabilitySlot(
      start: DateTime.parse(json['slot_start'] as String),
      end: DateTime.parse(json['slot_end'] as String),
      isAvailable: json['is_available'] == true,
    );
  }
}

class DoctorAvailableDate {
  final DateTime date;
  final int availableCount;

  DoctorAvailableDate({required this.date, required this.availableCount});

  factory DoctorAvailableDate.fromJson(Map<String, dynamic> json) {
    return DoctorAvailableDate(
      date: DateTime.parse(json['date'] as String),
      availableCount: (json['available_count'] as num?)?.toInt() ?? 0,
    );
  }
}

final doctorsRepositoryProvider = Provider<DoctorsRepository>((ref) {
  return DoctorsRepository(ref.watch(gatewayDioProvider));
});
