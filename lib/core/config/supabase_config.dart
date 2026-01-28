import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static String supabaseUrl = const String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static String supabaseAnonKey = const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static Future<void> initialize() async {
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      try {
        await dotenv.load(fileName: ".env");
        supabaseUrl = dotenv.env['SUPABASE_URL'] ?? '';
        supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'] ?? '';
      } catch (e) {
        // Ignorar error si no existe .env, se manejará en la validación siguiente
      }
    }

    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      throw Exception(
        'SUPABASE_URL y/o SUPABASE_ANON_KEY no configurados.\n'
        'Asegúrate de pasar --dart-define o tener un archivo .env en la raíz.'
      );
    }
    await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  }

  static SupabaseClient get client => Supabase.instance.client;
}
