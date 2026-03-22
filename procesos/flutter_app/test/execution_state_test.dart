import 'package:flutter_test/flutter_test.dart';

import 'package:guadiana_checklists_flutter/features/execution/data/survey_repository.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/execution_answer.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/question.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/section.dart';
import 'package:guadiana_checklists_flutter/features/execution/domain/survey.dart';
import 'package:guadiana_checklists_flutter/features/execution/presentation/execution_notifier.dart';

void main() {
  group('ExecutionAnswer', () {
    test('hasAnyValue is false when all fields are null or empty', () {
      const answer = ExecutionAnswer();
      expect(answer.hasAnyValue, isFalse);
    });

    test('hasAnyValue is true when any field has value', () {
      expect(
        const ExecutionAnswer(boolValue: true).hasAnyValue,
        isTrue,
      );
      expect(
        const ExecutionAnswer(textValue: 'hola').hasAnyValue,
        isTrue,
      );
      expect(
        const ExecutionAnswer(numberValue: 1).hasAnyValue,
        isTrue,
      );
      expect(
        ExecutionAnswer(dateValue: DateTime.now()).hasAnyValue,
        isTrue,
      );
      expect(
        const ExecutionAnswer(optionIds: ['opt']).hasAnyValue,
        isTrue,
      );
      expect(
        const ExecutionAnswer(comment: 'algo').hasAnyValue,
        isTrue,
      );
    });
  });

  group('ExecutionState progress and counts', () {
    test('totalQuestions and progress reflect answers correctly', () {
      const survey = Survey(
        id: 'survey_1',
        name: 'Checklist prueba',
        status: 'published',
      );

      const section = Section(
        id: 'sec_1',
        surveyId: 'survey_1',
        title: 'Sección 1',
        order: 1,
      );

      const question1 = Question(
        id: 'q1',
        sectionId: 'sec_1',
        text: 'Pregunta 1',
        type: 'boolean',
        isRequired: true,
        order: 1,
      );

      const question2 = Question(
        id: 'q2',
        sectionId: 'sec_1',
        text: 'Pregunta 2',
        type: 'text_short',
        isRequired: true,
        order: 2,
      );

      const detail = SurveyDetail(
        survey: survey,
        sections: [section],
        questionsBySection: {
          'sec_1': [question1, question2],
        },
      );

      const stateEmpty = ExecutionState(
        surveyDetail: detail,
        answers: {},
      );

      expect(stateEmpty.totalQuestions, 2);
      expect(stateEmpty.answeredCount, 0);
      expect(stateEmpty.progress, 0);

      const statePartial = ExecutionState(
        surveyDetail: detail,
        answers: {
          'q1': ExecutionAnswer(boolValue: true),
        },
      );

      expect(statePartial.totalQuestions, 2);
      expect(statePartial.answeredCount, 1);
      expect(statePartial.progress, closeTo(0.5, 0.0001));

      const stateFull = ExecutionState(
        surveyDetail: detail,
        answers: {
          'q1': ExecutionAnswer(boolValue: true),
          'q2': ExecutionAnswer(textValue: 'ok'),
        },
      );

      expect(stateFull.totalQuestions, 2);
      expect(stateFull.answeredCount, 2);
      expect(stateFull.progress, 1);
    });
  });
}
