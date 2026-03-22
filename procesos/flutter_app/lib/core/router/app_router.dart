import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../features/assignments/presentation/assignments_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/execution/presentation/checklist_detail_screen.dart';
import '../../features/execution/presentation/confirmation_screen.dart';
import '../../features/execution/presentation/execution_screen.dart';
import '../../features/history/presentation/history_screen.dart';
import '../../features/history/presentation/run_detail_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

class AuthStateNotifier extends ChangeNotifier {
  AuthStateNotifier() {
    final session = Supabase.instance.client.auth.currentSession;
    _isAuthenticated = session != null;

    _subscription = Supabase.instance.client.auth.onAuthStateChange.listen(
      (event) {
        final session = event.session;
        final next = session != null;
        if (next != _isAuthenticated) {
          _isAuthenticated = next;
          notifyListeners();
        }
      },
    );
  }

  late final StreamSubscription<AuthState> _subscription;

  bool _isAuthenticated = false;

  bool get isAuthenticated => _isAuthenticated;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

final authStateNotifierProvider = Provider<AuthStateNotifier>((ref) {
  final notifier = AuthStateNotifier();
  ref.onDispose(notifier.dispose);
  return notifier;
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authStateNotifierProvider);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final loggedIn = authNotifier.isAuthenticated;
      final loggingIn = state.matchedLocation == '/login';

      if (!loggedIn && !loggingIn) {
        return '/login';
      }

      if (loggedIn && loggingIn) {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const AssignmentsScreen(),
      ),
      GoRoute(
        path: '/checklist/:assignmentId',
        name: 'checklistDetail',
        builder: (context, state) {
          final assignmentId = state.pathParameters['assignmentId'] ?? '';
          return ChecklistDetailScreen(assignmentId: assignmentId);
        },
      ),
      GoRoute(
        path: '/execution/:runId',
        name: 'execution',
        builder: (context, state) {
          final runId = state.pathParameters['runId'] ?? '';
          return ExecutionScreen(runId: runId, key: ValueKey(runId));
        },
      ),
      GoRoute(
        path: '/execution/:runId/confirm',
        name: 'executionConfirm',
        builder: (context, state) {
          final runId = state.pathParameters['runId'] ?? '';
          return ConfirmationScreen(runId: runId);
        },
      ),
      GoRoute(
        path: '/history',
        name: 'history',
        builder: (context, state) => const HistoryScreen(),
      ),
      GoRoute(
        path: '/history/:runId',
        name: 'runDetail',
        builder: (context, state) {
          final runId = state.pathParameters['runId'] ?? '';
          return RunDetailScreen(runId: runId);
        },
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});
