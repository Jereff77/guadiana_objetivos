import 'package:flutter/material.dart';

import '../domain/execution_answer.dart';
import '../domain/question.dart';
import '../domain/question_option.dart';

class SingleChoiceQuestionWidget extends StatelessWidget {
  const SingleChoiceQuestionWidget({
    super.key,
    required this.question,
    required this.options,
    required this.answer,
    required this.onChanged,
    required this.onCommentChanged,
  });

  final Question question;
  final List<QuestionOption> options;
  final ExecutionAnswer? answer;
  final ValueChanged<ExecutionAnswer> onChanged;
  final ValueChanged<String> onCommentChanged;

  @override
  Widget build(BuildContext context) {
    final current = answer;
    final selectedId =
        (current?.optionIds != null && current!.optionIds!.isNotEmpty)
            ? current.optionIds!.first
            : null;
    final comment = current?.comment ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        Wrap(
          children: options.map(
            (opt) {
              final isSelected = selectedId == opt.id;
              return ChoiceChip(
                label: Text(opt.label),
                selected: isSelected,
                onSelected: (selected) {
                  final base = current ?? const ExecutionAnswer();
                  onChanged(
                    base.copyWith(
                      optionIds:
                          selected ? <String>[opt.id] : <String>[],
                    ),
                  );
                },
              );
            },
          ).toList(),
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

class MultipleChoiceQuestionWidget extends StatelessWidget {
  const MultipleChoiceQuestionWidget({
    super.key,
    required this.question,
    required this.options,
    required this.answer,
    required this.onChanged,
    required this.onCommentChanged,
  });

  final Question question;
  final List<QuestionOption> options;
  final ExecutionAnswer? answer;
  final ValueChanged<ExecutionAnswer> onChanged;
  final ValueChanged<String> onCommentChanged;

  @override
  Widget build(BuildContext context) {
    final current = answer;
    final selectedIds = current?.optionIds?.toSet() ?? <String>{};
    final comment = current?.comment ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _QuestionHeader(question: question),
        ...options.map(
          (opt) {
            final isSelected = selectedIds.contains(opt.id);
            return CheckboxListTile(
              value: isSelected,
              onChanged: (checked) {
                final newIds = Set<String>.from(selectedIds);
                if (checked == true) {
                  newIds.add(opt.id);
                } else {
                  newIds.remove(opt.id);
                }
                final base = current ?? const ExecutionAnswer();
                onChanged(
                  base.copyWith(optionIds: newIds.toList()),
                );
              },
              title: Text(opt.label),
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
