import '../../execution/domain/survey.dart';
import 'assignment.dart';

class AssignmentWithSurvey {
  const AssignmentWithSurvey({
    required this.assignment,
    required this.survey,
  });

  final Assignment assignment;
  final Survey survey;

  factory AssignmentWithSurvey.fromJson(Map<String, dynamic> json) {
    return AssignmentWithSurvey(
      assignment:
          Assignment.fromJson(json['assignment'] as Map<String, dynamic>),
      survey: Survey.fromJson(json['survey'] as Map<String, dynamic>),
    );
  }
}

