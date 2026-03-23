import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ApiClient {
  final Dio _dio;

  ApiClient({required String baseUrl, required SupabaseClient supabase})
      : _dio = Dio(BaseOptions(baseUrl: baseUrl)) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = supabase.auth.currentSession?.accessToken;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? params}) {
    return _dio.get<T>(path, queryParameters: params);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) {
    return _dio.put<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return _dio.delete<T>(path);
  }
}
