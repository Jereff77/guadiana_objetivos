import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/auth_notifier.dart';
import '../data/history_repository.dart';
import '../domain/run.dart';

final historyNotifierProvider =
    AsyncNotifierProvider<HistoryNotifier, List<SurveyRun>>(
  HistoryNotifier.new,
);

class HistoryNotifier extends AsyncNotifier<List<SurveyRun>> {
  late final HistoryRepository _repository;

  @override
  Future<List<SurveyRun>> build() async {
    _repository = HistoryRepository();

    final authState = ref.read(authNotifierProvider);
    final user = authState.value;

    if (user == null) {
      return [];
    }

    return _repository.getUserRuns(user.id);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authState = ref.read(authNotifierProvider);
      final user = authState.value;
      if (user == null) {
        return <SurveyRun>[];
      }
      return _repository.getUserRuns(user.id);
    });
  }
}

