import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../domain/assignment_with_survey.dart';

class ChecklistCard extends StatelessWidget {
  const ChecklistCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  final AssignmentWithSurvey item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final survey = item.survey;
    final assignment = item.assignment;

    final category = survey.category ?? 'Sin categoría';
    final frequency = assignment.frequency;

    final endDate = assignment.endDate;
    final hasEndDate = endDate != null;

    String? dueText;
    if (endDate != null) {
      dueText = '${endDate.day.toString().padLeft(2, '0')}/'
          '${endDate.month.toString().padLeft(2, '0')}/'
          '${endDate.year}';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            Container(
              width: 4,
              height: 80,
              color: AppColors.brandBlueDark,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            survey.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandBlue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            category,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.brandBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      survey.description ?? 'Sin descripción',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          _frequencyToSpanish(frequency),
                          style: const TextStyle(fontSize: 12),
                        ),
                        if (hasEndDate) ...[
                          const SizedBox(width: 12),
                          const Icon(
                            Icons.calendar_today,
                            size: 12,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            dueText!,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 8),
              child: Icon(Icons.chevron_right),
            ),
          ],
        ),
      ),
    );
  }

  String _frequencyToSpanish(String? value) {
    if (value == null || value.isEmpty) {
      return 'Una sola vez';
    }
    switch (value) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      case 'once':
        return 'Una sola vez';
      default:
        return value;
    }
  }
}
