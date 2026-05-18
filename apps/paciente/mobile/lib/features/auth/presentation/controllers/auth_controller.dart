import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/providers/supabase_provider.dart';

class AuthController extends StateNotifier<AsyncValue<void>> {
  AuthController(this._client) : super(const AsyncValue.data(null));

  final SupabaseClient _client;

  Future<void> signIn({required String email, required String password}) async {
    state = const AsyncValue.loading();
    try {
      await _client.auth.signInWithPassword(email: email, password: password);
      state = const AsyncValue.data(null);
    } on AuthException catch (e, st) {
      state = AsyncValue.error(_humanize(e), st);
    } catch (e, st) {
      state = AsyncValue.error('No pudimos iniciar sesion. Reintenta.', st);
    }
  }

  Future<void> signUp({
    required String email,
    required String password,
    String? fullName,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _client.auth.signUp(
        email: email,
        password: password,
        data: fullName != null ? {'full_name': fullName} : null,
      );
      state = const AsyncValue.data(null);
    } on AuthException catch (e, st) {
      state = AsyncValue.error(_humanize(e), st);
    } catch (e, st) {
      state = AsyncValue.error('No pudimos crear la cuenta. Reintenta.', st);
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  String _humanize(AuthException e) {
    final msg = e.message.toLowerCase();
    if (msg.contains('invalid login') || msg.contains('invalid credentials')) {
      return 'Correo o contrasena incorrectos.';
    }
    if (msg.contains('already registered') || msg.contains('user already')) {
      return 'Ya existe una cuenta con ese correo.';
    }
    if (msg.contains('email rate') || msg.contains('rate limit')) {
      return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
    }
    return e.message;
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<void>>((ref) {
  return AuthController(ref.watch(supabaseClientProvider));
});
