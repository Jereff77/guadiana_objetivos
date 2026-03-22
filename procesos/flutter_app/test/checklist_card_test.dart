import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:guadiana_checklists_flutter/features/assignments/domain/assignment.dart';
import 'package:guadiana_checklists_flutter/features/assignments/domain/assignment_with_survey.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/survey.dart';
import 'package:guadiana_checklists_flutter/features/assignments/presentation/checklist_card.dart';

void main() {
  testWidgets(
    'ChecklistCard muestra datos principales y responde al tap',
    (tester) async {
      const survey = Survey(
        id: 'survey_1',
        name: 'Checklist de seguridad',
        status: 'published',
        description: 'Revisión de seguridad diaria',
        category: 'Seguridad',
      );

      final item = AssignmentWithSurvey(
        assignment: Assignment(
          id: 'assign_1',
          surveyId: 'survey_1',
          frequency: 'daily',
          startDate: DateTime(2024, 1, 1),
          isActive: true,
        ),
        survey: survey,
      );

      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChecklistCard(
              item: item,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Checklist de seguridad'), findsOneWidget);
      expect(find.text('Seguridad'), findsOneWidget);
      expect(find.text('Revisión de seguridad diaria'), findsOneWidget);
      expect(find.text('Diario'), findsOneWidget);

      await tester.tap(find.byType(ChecklistCard));
      await tester.pump();

      expect(tapped, isTrue);
    },
  );
}
