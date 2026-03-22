import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../domain/run.dart';

class HistoryRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<List<SurveyRun>> getUserRuns(String userId) async {
    final response = await _client
        .from('resp_survey_runs')
        .select(
          '''
          id,
          status,
          completed_at,
          survey:form_surveys (
            name
          )
          ''',
        )
        .eq('respondent_id', userId)
        .or("status.eq.completed,status.eq.in_progress")
        .order('completed_at', ascending: false);

    final data = response as List<dynamic>;

    return data.map((row) {
      final map = row as Map<String, dynamic>;
      final survey = map['survey'] as Map<String, dynamic>? ?? {};

      return SurveyRun(
        id: map['id'] as String,
        surveyName: survey['name'] as String? ?? '',
        status: map['status'] as String? ?? '',
        completedAt: map['completed_at'] != null
            ? DateTime.parse(map['completed_at'] as String)
            : null,
      );
    }).toList();
  }

  Future<List<RunQuestionDetail>> getRunQuestionDetails(
    String runId,
  ) async {
    final answersResponse = await _client
        .from('resp_answers')
        .select(
          '''
          question_id,
          value_bool,
          value_text,
          value_number,
          value_date,
          option_id,
          value_json,
          comment
          ''',
        )
        .eq('run_id', runId);

    final answersData = answersResponse as List<dynamic>;

    if (answersData.isEmpty) {
      return const <RunQuestionDetail>[];
    }

    final questionIds = <String>{};
    final optionIds = <String>{};

    for (final row in answersData) {
      final map = row as Map<String, dynamic>;
      final qId = map['question_id'] as String?;
      if (qId != null) {
        questionIds.add(qId);
      }
      final singleOption = map['option_id'] as String?;
      if (singleOption != null) {
        optionIds.add(singleOption);
      }
      final multipleOptions = map['value_json'];
      if (multipleOptions is List) {
        for (final id in multipleOptions) {
          if (id is String) {
            optionIds.add(id);
          }
        }
      }
    }

    if (questionIds.isEmpty) {
      return const <RunQuestionDetail>[];
    }

    var questionsQuery = _client.from('form_questions').select(
          '''
          id,
          section_id,
          text,
          type,
          order
          ''',
        );

    questionsQuery = questionsQuery.or(
      questionIds.map((id) => 'id.eq.$id').join(','),
    );

    final questionsResponse = await questionsQuery;
    final questionsData = questionsResponse as List<dynamic>;

    final sectionIds = <String>{};
    final questionsById = <String, Map<String, dynamic>>{};

    for (final row in questionsData) {
      final map = row as Map<String, dynamic>;
      final id = map['id'] as String;
      questionsById[id] = map;
      final sectionId = map['section_id'] as String?;
      if (sectionId != null) {
        sectionIds.add(sectionId);
      }
    }

    var sectionsQuery = _client.from('form_sections').select(
          '''
          id,
          title,
          order
          ''',
        );

    if (sectionIds.isNotEmpty) {
      sectionsQuery = sectionsQuery.or(
        sectionIds.map((id) => 'id.eq.$id').join(','),
      );
    }

    final sectionsResponse = await sectionsQuery;
    final sectionsData = sectionsResponse as List<dynamic>;

    final sectionsById = <String, Map<String, dynamic>>{};
    for (final row in sectionsData) {
      final map = row as Map<String, dynamic>;
      sectionsById[map['id'] as String] = map;
    }

    final optionLabelsById = <String, String>{};
    if (optionIds.isNotEmpty) {
      var optionsQuery = _client.from('form_question_options').select(
            '''
            id,
            label
            ''',
          );
      optionsQuery = optionsQuery.or(
        optionIds.map((id) => 'id.eq.$id').join(','),
      );
      final optionsResponse = await optionsQuery;
      final optionsData = optionsResponse as List<dynamic>;
      for (final row in optionsData) {
        final map = row as Map<String, dynamic>;
        optionLabelsById[map['id'] as String] =
            map['label'] as String? ?? '';
      }
    }

    final results = <RunQuestionDetail>[];

    for (final row in answersData) {
      final map = row as Map<String, dynamic>;
      final questionId = map['question_id'] as String?;
      if (questionId == null) {
        continue;
      }
      final question = questionsById[questionId];
      if (question == null) {
        continue;
      }

      final sectionId = question['section_id'] as String?;
      final section = sectionId != null ? sectionsById[sectionId] : null;

      final type = question['type'] as String? ?? '';
      final answerText = _formatAnswer(type, map, optionLabelsById);

      final comment = map['comment'] as String?;

      results.add(
        RunQuestionDetail(
          sectionId: sectionId ?? '',
          sectionTitle: section != null
              ? section['title'] as String? ?? ''
              : '',
          sectionOrder: section != null
              ? (section['order'] as num?)?.toInt() ?? 0
              : 0,
          questionId: questionId,
          questionText: question['text'] as String? ?? '',
          questionOrder:
              (question['order'] as num?)?.toInt() ?? 0,
          answerText: answerText,
          comment: comment,
        ),
      );
    }

    results.sort((a, b) {
      final sectionCompare =
          a.sectionOrder.compareTo(b.sectionOrder);
      if (sectionCompare != 0) {
        return sectionCompare;
      }
      return a.questionOrder.compareTo(b.questionOrder);
    });

    return results;
  }

  String _formatAnswer(
    String type,
    Map<String, dynamic> row,
    Map<String, String> optionLabelsById,
  ) {
    switch (type) {
      case 'boolean':
        final value = row['value_bool'] as bool?;
        if (value == null) {
          return '';
        }
        return value ? 'Sí' : 'No';
      case 'single_choice':
        final optionId = row['option_id'] as String?;
        if (optionId == null) {
          return '';
        }
        return optionLabelsById[optionId] ?? optionId;
      case 'multiple_choice':
        final dynamic jsonValue = row['value_json'];
        if (jsonValue is List) {
          final labels = <String>[];
          for (final id in jsonValue) {
            if (id is String) {
              labels.add(optionLabelsById[id] ?? id);
            }
          }
          return labels.join(', ');
        }
        return '';
      case 'text_short':
      case 'text_long':
        return row['value_text'] as String? ?? '';
      case 'number':
        final number = row['value_number'];
        if (number == null) {
          return '';
        }
        return number.toString();
      case 'date':
        final value = row['value_date'] as String?;
        if (value == null) {
          return '';
        }
        try {
          final date = DateTime.parse(value);
          return '${date.day.toString().padLeft(2, '0')}/'
              '${date.month.toString().padLeft(2, '0')}/'
              '${date.year}';
        } catch (_) {
          return value;
        }
      default:
        return '';
    }
  }
}

class RunQuestionDetail {
  const RunQuestionDetail({
    required this.sectionId,
    required this.sectionTitle,
    required this.sectionOrder,
    required this.questionId,
    required this.questionText,
    required this.questionOrder,
    required this.answerText,
    this.comment,
  });

  final String sectionId;
  final String sectionTitle;
  final int sectionOrder;
  final String questionId;
  final String questionText;
  final int questionOrder;
  final String answerText;
  final String? comment;
}
