import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/config/supabase_config.dart';

enum UserRole {
  auditor,
  almacenista,
}

class RoleService {
  static SupabaseClient get _client => SupabaseConfig.client;

  /// Obtiene el rol del usuario actual.
  /// Por defecto retorna [UserRole.almacenista] si no se encuentra información.
  static Future<UserRole> getRole() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) return UserRole.almacenista;

      // Intentar obtener el rol desde la tabla 'app_profiles'
      final response = await _client
          .from('app_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null && response['role'] != null) {
        final roleStr = response['role'].toString().toLowerCase();
        if (roleStr == 'auditor') return UserRole.auditor;
      }

      // Fallback: Verificar metadata si existe (retrocompatibilidad)
      final metadata = user.userMetadata;
      if (metadata != null) {
        final role = metadata['role']?.toString().toLowerCase() ?? '';
        final puesto = metadata['puesto']?.toString().toLowerCase() ?? '';

        if (role.contains('auditor') || puesto.contains('auditor')) {
          return UserRole.auditor;
        }
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
  /// Si es Almacenista, retorna solo el asignado en 'app_profiles'.
  static Future<List<String>> getAccessibleWarehouses(
      List<String> allWarehouses) async {
    final role = await getRole();
    if (role == UserRole.auditor) {
      return allWarehouses;
    }

    try {
      final user = _client.auth.currentUser;
      if (user == null) return [];

      // Obtener almacén asignado desde 'app_profiles'
      final response = await _client
          .from('app_profiles')
          .select('assigned_warehouse')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null &&
          response['assigned_warehouse'] != null &&
          response['assigned_warehouse'].toString().isNotEmpty) {
        final assigned = response['assigned_warehouse'].toString();
        // Verificar que el almacén asignado exista en la lista global
        if (allWarehouses.contains(assigned)) {
          return [assigned];
        }
      }

      // Si no tiene almacén asignado, retornamos todos para que pueda seleccionar uno
      // y asignárselo permanentemente.
      return allWarehouses;
    } catch (e) {
      // En caso de error, retornamos todos como fallback seguro
      // (la app intentará asignarlo al seleccionar)
      return allWarehouses;
    }
  }

  /// Asigna un almacén al usuario actual.
  static Future<void> assignWarehouse(String warehouseName) async {
    final user = _client.auth.currentUser;
    if (user == null) return;

    await _client.from('app_profiles').update({
      'assigned_warehouse': warehouseName,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', user.id);
  }
}
