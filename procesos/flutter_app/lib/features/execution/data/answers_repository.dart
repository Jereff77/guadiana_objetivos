import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../domain/execution_answer.dart';
import '../data/survey_repository.dart';

class AnswersRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<void> submitRun({
    required String runId,
    required SurveyDetail detail,
    required Map<String, ExecutionAnswer> answers,
  }) async {
    final hasConnection = await SupabaseManager.testConnection();
    if (!hasConnection) {
      throw Exception(
        'Sin conexión a internet. Revisa tu conexión e intenta de nuevo.',
      );
    }

    final rows = <Map<String, dynamic>>[];

    for (final section in detail.sections) {
      final questions =
          detail.questionsBySection[section.id] ?? const [];

      for (final q in questions) {
        final answer = answers[q.id];
        if (answer == null || !answer.hasAnyValue) {
          continue;
        }

        final row = <String, dynamic>{
          'run_id': runId,
          'question_id': q.id,
        };

        if (answer.comment != null &&
            answer.comment!.trim().isNotEmpty) {
          row['comment'] = answer.comment;
        }

        switch (q.type) {
          case 'boolean':
            row['value_bool'] = answer.boolValue;
            break;
          case 'single_choice':
            final first = answer.optionIds?.isNotEmpty == true
                ? answer.optionIds!.first
                : null;
            if (first != null) {
              row['option_id'] = first;
            }
            break;
          case 'multiple_choice':
            if (answer.optionIds != null &&
                answer.optionIds!.isNotEmpty) {
              row['value_json'] = answer.optionIds;
            }
            break;
          case 'text_short':
          case 'text_long':
            row['value_text'] = answer.textValue;
            break;
          case 'number':
            row['value_number'] = answer.numberValue;
            break;
          case 'date':
            if (answer.dateValue != null) {
              row['value_date'] =
                  answer.dateValue!.toIso8601String();
            }
            break;
          default:
            break;
        }

        rows.add(row);
      }
    }

    if (rows.isEmpty) {
      return;
    }

    await _client.from('resp_answers').insert(rows);

    await _client
        .from('resp_survey_runs')
        .update({
          'status': 'completed',
          'completed_at': DateTime.now().toIso8601String(),
        })
        .eq('id', runId);
  }
}
