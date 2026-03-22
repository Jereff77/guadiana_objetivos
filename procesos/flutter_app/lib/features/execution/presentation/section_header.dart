import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../domain/section.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.section,
    required this.index,
    required this.total,
  });

  final Section section;
  final int index;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          color: AppColors.brandBlue,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Sección $index de $total',
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                section.title,
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (section.description != null &&
                  section.description!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  section.description!,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 13,
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

