import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_strings.dart';
import '../../auth/presentation/auth_notifier.dart';
import 'profile_notifier.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.value;

    final profileState = ref.watch(profileNotifierProvider);
    final profile = profileState.value;

    final email = user?.email ?? '';

    final nameSource =
        (profile != null && profile.fullName.isNotEmpty)
            ? profile.fullName
            : (email.isNotEmpty ? email : 'Usuario');

    final initialsSource =
        nameSource.isNotEmpty ? nameSource : 'U';
    final initials =
        initialsSource[0].toUpperCase();

    final roleText = (profile != null &&
            profile.role.trim().isNotEmpty)
        ? profile.role
        : 'N/D';

    final branchText = (profile != null &&
            profile.branch.trim().isNotEmpty)
        ? profile.branch
        : 'N/D';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 32,
              child: Text(
                initials,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              nameSource,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (email.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                email,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
            ],
            const SizedBox(height: 8),
            Text('Rol: $roleText'),
            const SizedBox(height: 8),
            Text('Sucursal: $branchText'),
            const SizedBox(height: 16),
            const Text(
              'Versión ${AppStrings.appVersion}',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: MediaQuery.of(context).size.width,
              child: ElevatedButton(
                onPressed: () {
                  if (!context.mounted) {
                    return;
                  }
                  context.push('/history');
                },
                child: const Text('Ver historial'),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: MediaQuery.of(context).size.width,
              child: OutlinedButton(
                onPressed: () async {
                  final notifier =
                      ref.read(authNotifierProvider.notifier);
                  await notifier.signOut();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor:
                      Theme.of(context).colorScheme.error,
                ),
                child: const Text('Cerrar sesión'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
