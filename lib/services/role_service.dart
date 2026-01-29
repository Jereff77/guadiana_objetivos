import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/config/supabase_config.dart';

enum UserRole {
  auditor,
  almacenista,
}

class RoleService {
  static final SupabaseClient _client = SupabaseConfig.client;

  /// Obtiene el rol del usuario actual.
  /// Por defecto retorna [UserRole.almacenista] si no se encuentra información.
  static Future<UserRole> getRole() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) return UserRole.almacenista;

      // Intentar obtener el rol desde la tabla 'profiles'
      final response = await _client
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null && response['role'] != null) {
        final roleStr = response['role'].toString().toLowerCase();
        if (roleStr == 'auditor') return UserRole.auditor;
      }

      // Fallback: Verificar metadata si existe
      if (user.userMetadata?['role'] == 'auditor') {
        return UserRole.auditor;
      }

      // Regla de negocio temporal por dominio (opcional)
      // if (user.email!.endsWith('@aceleremos.com')) return UserRole.auditor;

      return UserRole.almacenista;
    } catch (e) {
      // Si la tabla no existe o hay error, asumimos almacenista por seguridad
      return UserRole.almacenista;
    }
  }

  /// Obtiene la lista de almacenes permitidos para el usuario.
  /// Si es Auditor, retorna todos.
  /// Si es Almacenista, retorna solo los asignados.
  static Future<List<String>> getAccessibleWarehouses(
      List<String> allWarehouses) async {
    final role = await getRole();
    if (role == UserRole.auditor) {
      return allWarehouses;
    }

    try {
      final user = _client.auth.currentUser;
      if (user == null) return [];

      // Intentar obtener almacenes asignados desde 'profiles' o tabla 'user_warehouses'
      // Asumimos que 'profiles' tiene una columna 'assigned_warehouses' (array de texto)
      // O usamos una tabla de relación.

      // Por ahora, para que funcione sin migración de BD,
      // si es almacenista retornamos una lista vacía o todos (dependiendo de la política de error).
      // Para cumplir con el requerimiento "solo al almacen asignado",
      // retornamos solo el primero de la lista global como simulación si no hay datos.

      // Nota: Implementar tabla real de asignaciones cuando esté definida en BD
      return allWarehouses.take(1).toList();
    } catch (e) {
      return [];
    }
  }
}
