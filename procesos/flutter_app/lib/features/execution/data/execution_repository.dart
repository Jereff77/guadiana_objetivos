import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';

class ExecutionRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<String> createRun({
    required String assignmentId,
    required String surveyId,
    required String userId,
  }) async {
    final response = await _client
        .from('resp_survey_runs')
        .insert(
          {
            'assignment_id': assignmentId,
            'survey_id': surveyId,
            'respondent_id': userId,
            'status': 'in_progress',
            'started_at': DateTime.now().toIso8601String(),
          },
        )
        .select('id')
        .single();

    return response['id'] as String;
  }
}
