import 'package:flutter/material.dart';

import '../domain/execution_answer.dart';
import '../domain/question.dart';

class NumberQuestionWidget extends StatelessWidget {
  const NumberQuestionWidget({
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
    final number = current?.numberValue;
    final comment = current?.comment ?? '';

    final textController = TextEditingController(
      text: number != null ? number.toString() : '',
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        TextFormField(
          controller: textController,
          keyboardType:
              const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'Valor numérico',
          ),
          onChanged: (value) {
            final base = current ?? const ExecutionAnswer();
            final parsed = double.tryParse(value.replaceAll(',', '.'));
            onChanged(
              base.copyWith(numberValue: parsed),
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

class DateQuestionWidget extends StatelessWidget {
  const DateQuestionWidget({
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
    final date = current?.dateValue;
    final comment = current?.comment ?? '';

    final formatted = date != null
        ? '${date.day.toString().padLeft(2, '0')}/'
            '${date.month.toString().padLeft(2, '0')}/'
            '${date.year}'
        : '';
    final textController = TextEditingController(text: formatted);

    Future<void> pickDate() async {
      final now = DateTime.now();
      final initialDate = date ?? now;
      final picked = await showDatePicker(
        context: context,
        initialDate: initialDate,
        firstDate: DateTime(now.year - 5),
        lastDate: DateTime(now.year + 5),
      );
      if (picked != null) {
        final base = current ?? const ExecutionAnswer();
        onChanged(
          base.copyWith(dateValue: picked),
        );
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        GestureDetector(
          onTap: pickDate,
          child: AbsorbPointer(
            child: TextFormField(
              controller: textController,
              decoration: const InputDecoration(
                labelText: 'Fecha',
                suffixIcon: Icon(Icons.calendar_today),
              ),
            ),
          ),
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
    final controller = TextEditingController(text: initialValue);

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
          controller: controller,
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

