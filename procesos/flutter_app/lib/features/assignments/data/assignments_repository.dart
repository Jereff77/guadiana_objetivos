import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../domain/assignment_with_survey.dart';

class AssignmentsRepository {
  SupabaseClient get _client => SupabaseManager.client;

  Future<List<AssignmentWithSurvey>> getActiveAssignments({
    required String userId,
    String? role,
    DateTime? today,
  }) async {
    final now = today ?? DateTime.now().toUtc();
    final nowIso = now.toIso8601String();

    final orAssignee = role != null && role.isNotEmpty
        ? 'assignee_user_id.eq.$userId,assignee_role.eq.$role'
        : 'assignee_user_id.eq.$userId';

    final response = await _client
        .from('form_assignments')
        .select(
          '''
            id,
            survey_id,
            assignee_user_id,
            assignee_role,
            branch_id,
            start_date,
            end_date,
            is_active,
            survey:form_surveys(
              id,
              name,
              description,
              category,
              status,
              version
            )
          ''',
        )
        .eq('is_active', true)
        .lte('start_date', nowIso)
        .or('end_date.is.null,end_date.gte.$nowIso')
        .or(orAssignee)
        .order('start_date', ascending: false);

    final data = response as List<dynamic>;

    return data.map((row) {
      final map = row as Map<String, dynamic>;

      final assignmentJson = <String, dynamic>{
        'id': map['id'],
        'survey_id': map['survey_id'],
        'assignee_user_id': map['assignee_user_id'],
        'assignee_role': map['assignee_role'],
        'branch_id': map['branch_id'],
        'frequency': map['frequency'],
        'start_date': map['start_date'],
        'end_date': map['end_date'],
        'is_active': map['is_active'],
      };

      final surveyJson = Map<String, dynamic>.from(map['survey'] as Map);

      return AssignmentWithSurvey.fromJson({
        'assignment': assignmentJson,
        'survey': surveyJson,
      });
    }).toList();
  }
}
