import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:guadiana_checklists_flutter/features/execution/domain/execution_answer.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/question.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/question_option.dart';
import 'package:guadiana_checklists_flutter/features/execution/presentation/choice_question_widgets.dart';

void main() {
  testWidgets(
    'SingleChoiceQuestionWidget selecciona y deselecciona opciones',
    (tester) async {
      const question = Question(
        id: 'q1',
        sectionId: 'sec',
        text: 'Selecciona una opción',
        type: 'single_choice',
        isRequired: true,
        order: 1,
      );

      const options = [
        QuestionOption(
          id: 'opt1',
          questionId: 'q1',
          label: 'Opción 1',
          value: '1',
          order: 1,
        ),
        QuestionOption(
          id: 'opt2',
          questionId: 'q1',
          label: 'Opción 2',
          value: '2',
          order: 2,
        ),
      ];

      ExecutionAnswer? currentAnswer;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChoiceQuestionWidget(
              question: question,
              options: options,
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

      await tester.tap(find.text('Opción 1'));
      await tester.pump();

      expect(currentAnswer, isNotNull);
      expect(currentAnswer!.optionIds, isNotNull);
      expect(currentAnswer!.optionIds, equals(['opt1']));

      await tester.tap(find.text('Opción 2'));
      await tester.pump();

      expect(currentAnswer!.optionIds, equals(['opt2']));
    },
  );
}

