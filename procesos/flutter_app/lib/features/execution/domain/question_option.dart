class QuestionOption {
  const QuestionOption({
    required this.id,
    required this.questionId,
    required this.label,
    required this.value,
    required this.order,
  });

  final String id;
  final String questionId;
  final String label;
  final String value;
  final int order;

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      id: json['id'] as String,
      questionId: json['question_id'] as String,
      label: json['label'] as String,
      value: json['value'] as String,
      order: (json['order'] as num).toInt(),
    );
  }
}

