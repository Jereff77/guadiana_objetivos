import 'question_option.dart';

class Question {
  const Question({
    required this.id,
    required this.sectionId,
    required this.text,
    this.helpText,
    required this.type,
    required this.isRequired,
    required this.order,
    this.options = const [],
  });

  final String id;
  final String sectionId;
  final String text;
  final String? helpText;
  final String type;
  final bool isRequired;
  final int order;
  final List<QuestionOption> options;

  Question copyWithOptions(List<QuestionOption> newOptions) {
    return Question(
      id: id,
      sectionId: sectionId,
      text: text,
      helpText: helpText,
      type: type,
      isRequired: isRequired,
      order: order,
      options: newOptions,
    );
  }

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      sectionId: json['section_id'] as String,
      text: json['text'] as String,
      helpText: json['help_text'] as String?,
      type: json['type'] as String,
      isRequired: json['is_required'] as bool,
      order: (json['order'] as num).toInt(),
    );
  }
}

