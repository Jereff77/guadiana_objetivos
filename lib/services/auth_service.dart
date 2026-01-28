import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/config/supabase_config.dart';

class AuthService {
  final SupabaseClient _client = SupabaseConfig.client;

  Future<void> signInWithEmail(String email, String password) async {
    final res = await _client.auth.signInWithPassword(email: email, password: password);
    if (res.session == null) {
      throw Exception('Inicio de sesión fallido');
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  bool get isLoggedIn => _client.auth.currentSession != null;
}
