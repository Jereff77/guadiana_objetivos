class Section {
  const Section({
    required this.id,
    required this.surveyId,
    required this.title,
    this.description,
    required this.order,
  });

  final String id;
  final String surveyId;
  final String title;
  final String? description;
  final int order;

  factory Section.fromJson(Map<String, dynamic> json) {
    return Section(
      id: json['id'] as String,
      surveyId: json['survey_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      order: (json['order'] as num).toInt(),
    );
  }
}

