import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../domain/question.dart';
import '../domain/question_option.dart';
import '../domain/section.dart';
import '../domain/survey.dart';

class SurveyDetail {
  const SurveyDetail({
    required this.survey,
    required this.sections,
    required this.questionsBySection,
  });

  final Survey survey;
  final List<Section> sections;
  final Map<String, List<Question>> questionsBySection;
}

class SurveyRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<SurveyDetail> getSurveyDetail(String surveyId) async {
    final surveyResponse = await _client
        .from('form_surveys')
        .select(
          '''
          id,
          name,
          description,
          category,
          status,
          version
          ''',
        )
        .eq('id', surveyId)
        .single();

    final survey = Survey.fromJson(
      Map<String, dynamic>.from(surveyResponse as Map),
    );

    final sectionsResponse = await _client
        .from('form_sections')
        .select(
          '''
          id,
          survey_id,
          title,
          description,
          order
          ''',
        )
        .eq('survey_id', surveyId)
        .order('order');

    final sectionsData = sectionsResponse as List<dynamic>;
    final sections = sectionsData
        .map(
          (row) => Section.fromJson(
            Map<String, dynamic>.from(row as Map),
          ),
        )
        .toList();

    final sectionIds = sections.map((s) => s.id).toList();

    var questionsQuery = _client.from('form_questions').select(
      '''
          id,
          section_id,
          text,
          help_text,
          type,
          is_required,
          order
          ''',
    );

    if (sectionIds.isNotEmpty) {
      questionsQuery = questionsQuery
          .or(sectionIds.map((id) => 'section_id.eq.$id').join(','));
    }

    final questionsResponse = await questionsQuery.order('order');

    final questionsData = questionsResponse as List<dynamic>;
    final questions = questionsData
        .map(
          (row) => Question.fromJson(
            Map<String, dynamic>.from(row as Map),
          ),
        )
        .toList();

    final questionIds = questions.map((q) => q.id).toList();

    var optionsQuery = _client.from('form_question_options').select(
      '''
          id,
          question_id,
          label,
          value,
          order
          ''',
    );

    if (questionIds.isNotEmpty) {
      optionsQuery = optionsQuery
          .or(questionIds.map((id) => 'question_id.eq.$id').join(','));
    }

    final optionsResponse = await optionsQuery.order('order');

    final optionsData = optionsResponse as List<dynamic>;
    final options = optionsData
        .map(
          (row) => QuestionOption.fromJson(
            Map<String, dynamic>.from(row as Map),
          ),
        )
        .toList();

    final optionsByQuestion = <String, List<QuestionOption>>{};
    for (final option in options) {
      optionsByQuestion.putIfAbsent(option.questionId, () => []).add(option);
    }

    final questionsWithOptions = questions
        .map(
          (q) => q.copyWithOptions(
            optionsByQuestion[q.id] ?? const [],
          ),
        )
        .toList();

    final questionsBySection = <String, List<Question>>{};
    for (final q in questionsWithOptions) {
      questionsBySection.putIfAbsent(q.sectionId, () => []).add(q);
    }

    return SurveyDetail(
      survey: survey,
      sections: sections,
      questionsBySection: questionsBySection,
    );
  }
}
