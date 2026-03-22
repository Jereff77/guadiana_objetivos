import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import '../domain/auth_user.dart';

final authNotifierProvider =
    AsyncNotifierProvider<AuthNotifier, AuthUser?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<AuthUser?> {
  late final AuthRepository _repository;

  @override
  Future<AuthUser?> build() async {
    _repository = AuthRepository();
    return _repository.currentUser;
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final user = await _repository.signIn(email, password);
      return user;
    });
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AsyncData(null);
  }
}

