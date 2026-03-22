class SurveyRun {
  const SurveyRun({
    required this.id,
    required this.surveyName,
    required this.status,
    this.completedAt,
  });

  final String id;
  final String surveyName;
  final String status;
  final DateTime? completedAt;
}
