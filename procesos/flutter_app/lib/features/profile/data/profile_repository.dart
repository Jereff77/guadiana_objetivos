import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../domain/user_profile.dart';

class ProfileRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<UserProfile?> getProfile({
    required String userId,
    String? fallbackName,
  }) async {
    final response = await _client
        .from('app_profiles')
        .select(
          '''
          first_name,
          last_name,
          role,
          assigned_warehouse
          ''',
        )
        .eq('id', userId)
        .limit(1);

    final data = response as List<dynamic>;
    if (data.isEmpty) {
      final name = fallbackName ?? '';
      return UserProfile(
        fullName: name,
        role: '',
        branch: '',
      );
    }

    final map = data.first as Map<String, dynamic>;

    final firstName = map['first_name'] as String? ?? '';
    final lastName = map['last_name'] as String? ?? '';
    final rawRole = map['role'] as String? ?? '';
    final branch = map['assigned_warehouse'] as String? ?? '';

    final fullNameParts = <String>[];
    if (firstName.trim().isNotEmpty) {
      fullNameParts.add(firstName.trim());
    }
    if (lastName.trim().isNotEmpty) {
      fullNameParts.add(lastName.trim());
    }

    final resolvedFullName = fullNameParts.isNotEmpty
        ? fullNameParts.join(' ')
        : (fallbackName ?? '');

    String displayRole;
    switch (rawRole) {
      case 'auditor':
        displayRole = 'Auditor';
        break;
      case 'almacenista':
        displayRole = 'Almacenista';
        break;
      default:
        displayRole = rawRole;
        break;
    }

    return UserProfile(
      fullName: resolvedFullName,
      role: displayRole,
      branch: branch,
    );
  }
}

