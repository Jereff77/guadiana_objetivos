import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
      const errorMessage = '''
        ⚠️ CONFIGURACIÓN REQUERIDA ⚠️
        
        No se encontraron las credenciales de Supabase.
        
        Opciones para configurar:
        
        1️⃣ Archivo .env:
           Crea un archivo .env en la raíz del proyecto con:
           SUPABASE_URL=tu_url_de_supabase
           SUPABASE_ANON_KEY=tu_clave_anonima
        
        2️⃣ Variables de entorno:
           flutter run --dart-define=SUPABASE_URL=tu_url --dart-define=SUPABASE_ANON_KEY=tu_clave
        
        3️⃣ Configuración en la app:
           Abre la aplicación y configura las credenciales directamente en la pantalla inicial
        
        4️⃣ APK de prueba:
           Para probar sin configuración, genera un APK release
      ''';
      
      throw Exception(errorMessage);
    }
    
    try {
      await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
    } catch (e) {
      throw Exception(
        'Error al conectar con Supabase: $e\n\n'
        'Verifica que las credenciales sean correctas y tengas conexión a internet.'
      );
    }
  }

  /// Guarda las credenciales en SharedPreferences para uso futuro
  static Future<void> saveCredentials(String url, String anonKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('supabase_url', url);
      await prefs.setString('supabase_anon_key', anonKey);
    } catch (e) {
      throw Exception('Error al guardar credenciales: $e');
    }
  }

  /// Carga las credenciales desde SharedPreferences
  static Future<Map<String, String?>> loadSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final url = prefs.getString('supabase_url');
      final key = prefs.getString('supabase_anon_key');
      return {'url': url, 'key': key};
    } catch (e) {
      return {'url': null, 'key': null};
    }
  }

  /// Inicializa con credenciales guardadas localmente
  static Future<void> initializeWithSavedCredentials() async {
    final saved = await loadSavedCredentials();
    if (saved['url'] != null && saved['key'] != null && saved['url']!.isNotEmpty && saved['key']!.isNotEmpty) {
      supabaseUrl = saved['url']!;
      supabaseAnonKey = saved['key']!;
      await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
    } else {
      await initialize();
    }
  }

  static SupabaseClient get client => Supabase.instance.client;
}
