import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/survey_repository.dart';
import '../data/answers_repository.dart';
import '../domain/execution_answer.dart';

final executionNotifierProvider =
    AsyncNotifierProviderFamily<ExecutionNotifier, ExecutionState, String>(
  ExecutionNotifier.new,
);

class ExecutionState {
  const ExecutionState({
    required this.surveyDetail,
    required this.answers,
    this.errorQuestionIds = const <String>{},
    this.firstErrorQuestionId,
    this.isSubmitting = false,
  });

  final SurveyDetail surveyDetail;
  final Map<String, ExecutionAnswer> answers;
  final Set<String> errorQuestionIds;
  final String? firstErrorQuestionId;
  final bool isSubmitting;

  int get totalQuestions {
    return surveyDetail.questionsBySection.values
        .fold<int>(0, (acc, list) => acc + list.length);
  }

  int get answeredCount {
    return answers.values.where((a) => a.hasAnyValue).length;
  }

  double get progress {
    if (totalQuestions == 0) {
      return 0;
    }
    return answeredCount / totalQuestions;
  }

  ExecutionState copyWith({
    Map<String, ExecutionAnswer>? answers,
    Set<String>? errorQuestionIds,
    String? firstErrorQuestionId,
    bool? isSubmitting,
  }) {
    return ExecutionState(
      surveyDetail: surveyDetail,
      answers: answers ?? this.answers,
      errorQuestionIds: errorQuestionIds ?? this.errorQuestionIds,
      firstErrorQuestionId: firstErrorQuestionId ?? this.firstErrorQuestionId,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

class ExecutionNotifier extends FamilyAsyncNotifier<ExecutionState, String> {
  late final SurveyRepository _repository;
  late final AnswersRepository _answersRepository;

  @override
  Future<ExecutionState> build(String surveyId) async {
    _repository = SurveyRepository();
    _answersRepository = AnswersRepository();
    final detail = await _repository.getSurveyDetail(surveyId);
    return ExecutionState(
      surveyDetail: detail,
      answers: <String, ExecutionAnswer>{},
    );
  }

  void setAnswer(String questionId, ExecutionAnswer answer) {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }
    final updated = Map<String, ExecutionAnswer>.from(current.answers);
    updated[questionId] = answer;
    final updatedErrorIds = Set<String>.from(current.errorQuestionIds)
      ..remove(questionId);
    state = AsyncData(
      current.copyWith(
        answers: updated,
        errorQuestionIds: updatedErrorIds,
        firstErrorQuestionId: updatedErrorIds.isEmpty
            ? null
            : current.firstErrorQuestionId,
      ),
    );
  }

  void setComment(String questionId, String comment) {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    final existing = current.answers[questionId] ?? const ExecutionAnswer();
    final updatedAnswer = existing.copyWith(comment: comment);

    final updated = Map<String, ExecutionAnswer>.from(current.answers);
    updated[questionId] = updatedAnswer;

    state = AsyncData(current.copyWith(answers: updated));
  }

  List<String> validateRequired() {
    final current = state.valueOrNull;
    if (current == null) {
      return const <String>[];
    }

    final missing = <String>[];

    for (final section in current.surveyDetail.sections) {
      final questions =
          current.surveyDetail.questionsBySection[section.id] ?? const [];

      for (final q in questions) {
        if (!q.isRequired) {
          continue;
        }

        final answer = current.answers[q.id];
        final hasAnswer = _hasRequiredAnswer(q.type, answer);

        if (!hasAnswer) {
          missing.add(q.id);
        }
      }
    }

    final missingSet = missing.toSet();

    state = AsyncData(
      current.copyWith(
        errorQuestionIds: missingSet,
        firstErrorQuestionId: missing.isEmpty ? null : missing.first,
      ),
    );

    return missing;
  }

  bool _hasRequiredAnswer(String type, ExecutionAnswer? answer) {
    if (answer == null) {
      return false;
    }

    switch (type) {
      case 'boolean':
        return answer.boolValue != null;
      case 'single_choice':
      case 'multiple_choice':
        return answer.optionIds != null && answer.optionIds!.isNotEmpty;
      case 'text_short':
      case 'text_long':
        return answer.textValue != null &&
            answer.textValue!.trim().isNotEmpty;
      case 'number':
        return answer.numberValue != null;
      case 'date':
        return answer.dateValue != null;
      default:
        return true;
    }
  }

  Future<void> submit(String runId) async {
    final current = state.valueOrNull;
    if (current == null) {
      return;
    }

    state = AsyncData(
      current.copyWith(isSubmitting: true),
    );

    try {
      await _answersRepository.submitRun(
        runId: runId,
        detail: current.surveyDetail,
        answers: current.answers,
      );
    } finally {
      final latest = state.valueOrNull;
      if (latest != null) {
        state = AsyncData(
          latest.copyWith(isSubmitting: false),
        );
      }
    }
  }
}
