import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseManager {
  static const String _supabaseUrl =
      String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const String _supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static bool _initialized = false;
  static final bool _configured =
      _supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty;

  static bool get isConfigured => _configured;

  static Future<void> initialize() async {
    if (_initialized) {
      return;
    }

    await Supabase.initialize(
      url: _supabaseUrl.isEmpty ? 'http://localhost' : _supabaseUrl,
      anonKey: _supabaseAnonKey.isEmpty ? 'anon-key' : _supabaseAnonKey,
    );

    _initialized = true;
  }

  static SupabaseClient get client {
    if (!_initialized) {
      throw StateError('SupabaseManager.initialize() debe llamarse antes.');
    }
    return Supabase.instance.client;
  }

  static Future<bool> testConnection() async {
    try {
      await client.from('inventory_sessions').select('id').limit(1);
      return true;
    } catch (_) {
      return false;
    }
  }
}
