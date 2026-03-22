import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/survey_repository.dart';

final checklistDetailNotifierProvider =
    AsyncNotifierProviderFamily<ChecklistDetailNotifier, SurveyDetail, String>(
  ChecklistDetailNotifier.new,
);

class ChecklistDetailNotifier
    extends FamilyAsyncNotifier<SurveyDetail, String> {
  late final SurveyRepository _repository;

  @override
  Future<SurveyDetail> build(String surveyId) async {
    _repository = SurveyRepository();
    return _repository.getSurveyDetail(surveyId);
  }
}

