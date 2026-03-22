import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/auth_notifier.dart';
import '../data/profile_repository.dart';
import '../domain/user_profile.dart';

final profileNotifierProvider =
    AsyncNotifierProvider<ProfileNotifier, UserProfile?>(
  ProfileNotifier.new,
);

class ProfileNotifier extends AsyncNotifier<UserProfile?> {
  late final ProfileRepository _repository;

  @override
  Future<UserProfile?> build() async {
    _repository = ProfileRepository();

    final authState = ref.read(authNotifierProvider);
    final user = authState.value;

    if (user == null) {
      return null;
    }

    return _repository.getProfile(
      userId: user.id,
      fallbackName: user.email,
    );
  }
}

