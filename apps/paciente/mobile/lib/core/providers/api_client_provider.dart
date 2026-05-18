import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';
import 'supabase_provider.dart';

/// Dio configured to talk to the Red Salud Rust gateway.
///
/// Adds `Authorization: Bearer <supabase_jwt>` per request from the live
/// Supabase session, so token refresh is transparent.
final gatewayDioProvider = Provider<Dio>((ref) {
  final supabase = ref.watch(supabaseClientProvider);

  final dio = Dio(BaseOptions(
    baseUrl: '${Env.apiGatewayUrl}/api/v1',
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      final token = supabase.auth.currentSession?.accessToken;
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
  ));

  return dio;
});
