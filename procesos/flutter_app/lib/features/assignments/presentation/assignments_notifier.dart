import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/auth_notifier.dart';
import '../data/assignments_repository.dart';
import '../domain/assignment_with_survey.dart';

final assignmentsNotifierProvider =
    AsyncNotifierProvider<AssignmentsNotifier, List<AssignmentWithSurvey>>(
  AssignmentsNotifier.new,
);

class AssignmentsNotifier
    extends AsyncNotifier<List<AssignmentWithSurvey>> {
  late final AssignmentsRepository _repository;

  @override
  Future<List<AssignmentWithSurvey>> build() async {
    _repository = AssignmentsRepository();

    final authState = ref.read(authNotifierProvider);
    final user = authState.value;

    if (user == null) {
      return [];
    }

    return _repository.getActiveAssignments(
      userId: user.id,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final authState = ref.read(authNotifierProvider);
      final user = authState.value;
      if (user == null) {
        return <AssignmentWithSurvey>[];
      }
      return _repository.getActiveAssignments(userId: user.id);
    });
  }
}

