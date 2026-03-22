import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../domain/execution_answer.dart';
import '../domain/question.dart';

class BooleanQuestionWidget extends StatelessWidget {
  const BooleanQuestionWidget({
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
    final value = current?.boolValue;
    final comment = current?.comment ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                question.isRequired ? '${question.text} *' : question.text,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
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
        Row(
          children: [
            Expanded(
              child: _BooleanChip(
                label: 'Sí',
                isSelected: value == true,
                selectedColor: AppColors.brandBlue,
                onTap: () {
                  final base = current ?? const ExecutionAnswer();
                  onChanged(
                    base.copyWith(
                      boolValue: true,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _BooleanChip(
                label: 'No',
                isSelected: value == false,
                selectedColor: AppColors.errorRed,
                onTap: () {
                  final base = current ?? const ExecutionAnswer();
                  onChanged(
                    base.copyWith(
                      boolValue: false,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        const Text(
          'Acciones a seguir',
          style: TextStyle(
            fontSize: 12,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          initialValue: comment,
          minLines: 2,
          maxLines: 4,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
          ),
          onChanged: onCommentChanged,
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _BooleanChip extends StatelessWidget {
  const _BooleanChip({
    required this.label,
    required this.isSelected,
    required this.selectedColor,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final Color selectedColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bgColor = isSelected ? selectedColor : Colors.grey.shade300;
    final textColor = isSelected ? Colors.white : Colors.black87;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

