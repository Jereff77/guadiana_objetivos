import 'package:flutter/material.dart';

import '../domain/execution_answer.dart';
import '../domain/question.dart';

class TextShortQuestionWidget extends StatelessWidget {
  const TextShortQuestionWidget({
    super.key,
    required this.question,
    required this.answer,
    required this.onChanged,
    required this.onCommentChanged,
  });

  final Question question;
  final ExecutionAnswer? answer;
  final ValueChanged<ExecutionAnswer> onChanged;
  final ValueChanged<String> onCommentChanged;

  @override
  Widget build(BuildContext context) {
    final current = answer;
    final text = current?.textValue ?? '';
    final comment = current?.comment ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        TextFormField(
          initialValue: text,
          decoration: const InputDecoration(
            labelText: 'Respuesta',
          ),
          keyboardType: TextInputType.text,
          onChanged: (value) {
            final base = current ?? const ExecutionAnswer();
            onChanged(
              base.copyWith(textValue: value),
            );
          },
        ),
        const SizedBox(height: 8),
        _ActionCommentField(
          initialValue: comment,
          onChanged: onCommentChanged,
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class TextLongQuestionWidget extends StatelessWidget {
  const TextLongQuestionWidget({
    super.key,
    required this.question,
    required this.answer,
    required this.onChanged,
    required this.onCommentChanged,
  });

  final Question question;
  final ExecutionAnswer? answer;
  final ValueChanged<ExecutionAnswer> onChanged;
  final ValueChanged<String> onCommentChanged;

  @override
  Widget build(BuildContext context) {
    final current = answer;
    final text = current?.textValue ?? '';
    final comment = current?.comment ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        TextFormField(
          initialValue: text,
          minLines: 3,
          maxLines: 5,
          decoration: const InputDecoration(
            labelText: 'Respuesta',
          ),
          keyboardType: TextInputType.text,
          onChanged: (value) {
            final base = current ?? const ExecutionAnswer();
            onChanged(
              base.copyWith(textValue: value),
            );
          },
        ),
        const SizedBox(height: 8),
        _ActionCommentField(
          initialValue: comment,
          onChanged: onCommentChanged,
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _QuestionHeader extends StatelessWidget {
  const _QuestionHeader({
    required this.question,
  });

  final Question question;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question.isRequired ? '${question.text} *' : question.text,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        if (question.helpText != null &&
            question.helpText!.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            question.helpText!,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),
        ],
        const SizedBox(height: 8),
      ],
    );
  }
}

class _ActionCommentField extends StatelessWidget {
  const _ActionCommentField({
    required this.initialValue,
    required this.onChanged,
  });

  final String initialValue;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Acciones a seguir',
          style: TextStyle(
            fontSize: 12,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          initialValue: initialValue,
          minLines: 2,
          maxLines: 4,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }
}

