import 'package:supabase_flutter/supabase_flutter.dart' as supa;

import '../../../core/supabase/supabase_client.dart';
import '../domain/auth_user.dart' as domain;

class AuthRepository {
  supa.SupabaseClient get _client => SupabaseManager.client;

  domain.AuthUser? get currentUser {
    final user = _client.auth.currentUser;
    if (user == null) {
      return null;
    }
    return domain.AuthUser(
      id: user.id,
      email: user.email ?? '',
    );
  }

  Future<domain.AuthUser> signIn(String email, String password) async {
    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );

    final user = response.user;
    if (user == null) {
      throw Exception('No se pudo iniciar sesión');
    }

    return domain.AuthUser(
      id: user.id,
      email: user.email ?? email,
    );
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
