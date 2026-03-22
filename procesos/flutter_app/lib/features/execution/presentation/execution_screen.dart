import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../domain/question.dart';
import '../presentation/execution_notifier.dart';
import 'boolean_question_widget.dart';
import 'choice_question_widgets.dart';
import 'text_question_widgets.dart';
import 'number_date_question_widgets.dart';
import 'section_header.dart';

class ExecutionScreen extends ConsumerWidget {
  const ExecutionScreen({
    super.key,
    required this.runId,
  });

  final String runId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(executionNotifierProvider(runId));

    return state.when(
      loading: () => const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(
          title: const Text('Checklist'),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Error al cargar el formulario: $error',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
      data: (executionState) {
        final detail = executionState.surveyDetail;
        final progress = executionState.progress;

        return Scaffold(
          appBar: AppBar(
            title: Text(detail.survey.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () async {
                  final hasAnswers = executionState.answeredCount > 0;
                  if (!hasAnswers) {
                    if (context.mounted) {
                      context.go('/home');
                    }
                    return;
                  }

                  final shouldExit = await showDialog<bool>(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                            title: const Text('Salir del checklist'),
                            content: const Text(
                              'Tienes respuestas capturadas. '
                              'Si sales ahora podrías perder cambios. '
                              '¿Deseas salir de todos modos?',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop(false);
                                },
                                child: const Text('Cancelar'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop(true);
                                },
                                child: const Text('Salir'),
                              ),
                            ],
                          );
                        },
                      ) ??
                      false;

                  if (shouldExit && context.mounted) {
                    context.go('/home');
                  }
                },
              ),
            ],
          ),
          body: Stack(
            children: [
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        LinearProgressIndicator(
                          value: progress,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${executionState.answeredCount} de ${executionState.totalQuestions} preguntas respondidas',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: detail.sections.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (detail.survey.description != null &&
                                  detail.survey.description!.isNotEmpty) ...[
                                Text(
                                  detail.survey.description!,
                                  style: const TextStyle(fontSize: 13),
                                ),
                                const SizedBox(height: 16),
                              ],
                            ],
                          );
                        }

                        final sectionIndex = index - 1;
                        final section = detail.sections[sectionIndex];
                        final questions = detail
                                .questionsBySection[section.id] ??
                            const <Question>[];

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SectionHeader(
                              section: section,
                              index: sectionIndex + 1,
                              total: detail.sections.length,
                            ),
                            const SizedBox(height: 8),
                            ...questions.map((q) {
                              final hasError = executionState
                                  .errorQuestionIds
                                  .contains(q.id);
                              final isFirstError =
                                  executionState.firstErrorQuestionId ==
                                      q.id;

                              final currentAnswer =
                                  executionState.answers[q.id];
                              return Builder(
                                builder: (questionContext) {
                                  if (isFirstError) {
                                    WidgetsBinding.instance
                                        .addPostFrameCallback((_) {
                                      Scrollable.ensureVisible(
                                        questionContext,
                                        duration: const Duration(
                                          milliseconds: 300,
                                        ),
                                      );
                                    });
                                  }

                                  Widget child;

                                  if (q.type == 'boolean') {
                                    child = BooleanQuestionWidget(
                                      question: q,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type == 'number') {
                                    child = NumberQuestionWidget(
                                      question: q,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type == 'date') {
                                    child = DateQuestionWidget(
                                      question: q,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type == 'text_short') {
                                    child = TextShortQuestionWidget(
                                      question: q,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type == 'text_long') {
                                    child = TextLongQuestionWidget(
                                      question: q,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type == 'single_choice') {
                                    child = SingleChoiceQuestionWidget(
                                      question: q,
                                      options: q.options,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else if (q.type ==
                                      'multiple_choice') {
                                    child = MultipleChoiceQuestionWidget(
                                      question: q,
                                      options: q.options,
                                      answer: currentAnswer,
                                      onChanged: (updated) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setAnswer(q.id, updated);
                                      },
                                      onCommentChanged: (comment) {
                                        ref
                                            .read(
                                              executionNotifierProvider(
                                                runId,
                                              ).notifier,
                                            )
                                            .setComment(q.id, comment);
                                      },
                                    );
                                  } else {
                                    child = const Padding(
                                      padding:
                                          EdgeInsets.only(bottom: 16),
                                      child: Text(
                                        'Widget para este tipo de pregunta se implementará en M-406-M-409.',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                    );
                                  }

                                  if (!hasError) {
                                    return child;
                                  }

                                  return Container(
                                    decoration: BoxDecoration(
                                      border: Border.all(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .error,
                                      ),
                                      borderRadius:
                                          BorderRadius.circular(8),
                                    ),
                                    child: Padding(
                                      padding:
                                          const EdgeInsets.all(4),
                                      child: child,
                                    ),
                                  );
                                },
                              );
                            }),
                            const Divider(),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
              if (executionState.isSubmitting)
                Positioned.fill(
                  child: ColoredBox(
                    color: Colors.black.withValues(alpha: 0.3),
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () async {
              final notifier =
                  ref.read(executionNotifierProvider(runId).notifier);
              final missing = notifier.validateRequired();

              if (missing.isNotEmpty) {
                final count = missing.length;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor:
                        Theme.of(context).colorScheme.error,
                    content: Text(
                      'Hay $count preguntas obligatorias sin responder',
                    ),
                  ),
                );
                return;
              }

              try {
                await notifier.submit(runId);
                if (!context.mounted) {
                  return;
                }
                context.go('/execution/$runId/confirm');
              } catch (error) {
                if (!context.mounted) {
                  return;
                }
                await showDialog<void>(
                  context: context,
                  builder: (dialogContext) {
                    return AlertDialog(
                      title: const Text('Error al enviar'),
                      content: Text(
                        'Ocurrió un error al enviar el checklist: $error',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.of(dialogContext).pop();
                          },
                          child: const Text('Cerrar'),
                        ),
                      ],
                    );
                  },
                );
              }
            },
            icon: const Icon(Icons.send),
            label: const Text('Enviar'),
          ),
        );
      },
    );
  }
}
