import 'package:supabase_flutter/supabase_flutter.dart';

class AuthErrorMapper {
  static String getMessage(Object error) {
    if (error is AuthException) {
      // Supabase suele devolver códigos de error estándar
      switch (error.code) {
        case 'invalid_credentials':
          return 'Correo electrónico o contraseña incorrectos.';
        case 'user_not_found':
          return 'No existe una cuenta registrada con este correo.';
        case 'email_not_confirmed':
          return 'Por favor confirma tu correo electrónico antes de iniciar sesión.';
        case 'invalid_grant':
          return 'Credenciales inválidas o sesión expirada.';
        case 'weak_password':
          return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
        case 'user_already_exists':
          return 'Ya existe una cuenta registrada con este correo electrónico.';
        case 'over_email_send_rate_limit':
          return 'Has solicitado demasiados correos. Por favor espera unos minutos.';
        case 'bad_json':
        case 'unexpected_failure':
          return 'Ocurrió un error inesperado en el servidor.';
        default:
          // Intentar capturar mensajes específicos por texto si el código no ayuda
          final msg = error.message.toLowerCase();
          if (msg.contains('invalid login credentials')) {
            return 'Correo electrónico o contraseña incorrectos.';
          }
          if (msg.contains('already registered')) {
            return 'Este correo ya está registrado.';
          }
          return error.message;
      }
    }

    // Errores que no son AuthException
    final String msg = error.toString();

    if (msg.contains('SocketException') ||
        msg.contains('Connection refused') ||
        msg.contains('Network is unreachable') ||
        msg.contains('ClientException')) {
      return 'No hay conexión a internet. Verifica tu red.';
    }

    if (msg.contains('Invalid login credentials')) {
      return 'Correo electrónico o contraseña incorrectos.';
    }

    // Limpieza básica de "Exception: ..."
    if (msg.startsWith('Exception: ')) {
      return msg.substring(11);
    }

    return 'Ocurrió un error inesperado: $msg';
  }
}
