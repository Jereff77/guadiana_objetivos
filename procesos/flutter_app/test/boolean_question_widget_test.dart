import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:guadiana_checklists_flutter/features/execution/domain/execution_answer.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/question.dart';
import 'package:guadiana_checklists_flutter/features/execution/presentation/boolean_question_widget.dart';

void main() {
  testWidgets(
    'BooleanQuestionWidget actualiza boolValue al tocar Sí y No',
    (tester) async {
      const question = Question(
        id: 'q1',
        sectionId: 'sec',
        text: '¿Está limpio?',
        type: 'boolean',
        isRequired: true,
        order: 1,
      );

      ExecutionAnswer? currentAnswer;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: BooleanQuestionWidget(
              question: question,
              answer: currentAnswer,
              onChanged: (updated) {
                currentAnswer = updated;
              },
              onCommentChanged: (_) {},
            ),
          ),
        ),
      );

      expect(currentAnswer, isNull);

      await tester.tap(find.text('Sí'));
      await tester.pump();

      expect(currentAnswer, isNotNull);
      expect(currentAnswer!.boolValue, isTrue);

      await tester.tap(find.text('No'));
      await tester.pump();

      expect(currentAnswer!.boolValue, isFalse);
    },
  );
}

