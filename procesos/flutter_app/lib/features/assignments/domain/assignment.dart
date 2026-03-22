class Assignment {
  const Assignment({
    required this.id,
    required this.surveyId,
    this.frequency,
    required this.startDate,
    required this.isActive,
    this.assigneeUserId,
    this.assigneeRole,
    this.branchId,
    this.endDate,
  });

  final String id;
  final String surveyId;
  final String? frequency;
  final DateTime startDate;
  final bool isActive;
  final String? assigneeUserId;
  final String? assigneeRole;
  final String? branchId;
  final DateTime? endDate;

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] as String,
      surveyId: json['survey_id'] as String,
      frequency: json['frequency'] as String?,
      startDate: DateTime.parse(json['start_date'] as String),
      isActive: json['is_active'] as bool,
      assigneeUserId: json['assignee_user_id'] as String?,
      assigneeRole: json['assignee_role'] as String?,
      branchId: json['branch_id'] as String?,
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'] as String)
          : null,
    );
  }
}
