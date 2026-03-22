import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:guadiana_checklists_flutter/features/auth/presentation/auth_notifier.dart';
import 'package:guadiana_checklists_flutter/features/auth/presentation/login_screen.dart';

class _FakeAuthNotifier extends AuthNotifier {
  bool signInCalled = false;
  String? lastEmail;
  String? lastPassword;

  @override
  Future<void> signIn(String email, String password) async {
    signInCalled = true;
    lastEmail = email;
    lastPassword = password;
    state = AsyncError(
      Exception('Credenciales inválidas'),
      StackTrace.current,
    );
  }

  @override
  Future<void> signOut() async {}
}

void main() {
  testWidgets(
    'LoginScreen valida campos y llama a signIn con datos válidos',
    (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authNotifierProvider.overrideWith(_FakeAuthNotifier.new),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      await tester.enterText(
        find.byType(TextFormField).at(0),
        'usuario@ejemplo.com',
      );
      await tester.enterText(
        find.byType(TextFormField).at(1),
        'secreta',
      );

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      expect(
        find.textContaining('Credenciales inválidas'),
        findsOneWidget,
      );
    },
  );
}
