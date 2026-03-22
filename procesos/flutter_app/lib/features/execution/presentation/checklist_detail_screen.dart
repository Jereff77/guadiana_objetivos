import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/supabase/supabase_client.dart';
import '../../auth/presentation/auth_notifier.dart';
import '../data/execution_repository.dart';
import '../domain/section.dart';
import 'checklist_detail_notifier.dart';

class ChecklistDetailScreen extends ConsumerWidget {
  const ChecklistDetailScreen({
    super.key,
    required this.assignmentId,
  });

  final String assignmentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state =
        ref.watch(checklistDetailNotifierProvider(assignmentId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de checklist'),
      ),
      body: state.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Error al cargar el checklist: $error',
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (detail) {
          final sections = detail.sections;
          final questionsBySection = detail.questionsBySection;

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: sections.length,
                  itemBuilder: (context, index) {
                    final section = sections[index];
                    final questions =
                        questionsBySection[section.id] ?? const [];
                    return _SectionCard(
                      section: section,
                      questionsCount: questions.length,
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      final hasConnection =
                          await SupabaseManager.testConnection();
                      if (!hasConnection) {
                        if (!context.mounted) {
                          return;
                        }
                        await showDialog<void>(
                          context: context,
                          builder: (dialogContext) {
                            return AlertDialog(
                              title: const Text('Sin conexión'),
                              content: const Text(
                                'Sin conexión a internet. Revisa tu conexión e intenta de nuevo.',
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
                        return;
                      }

                      final authState =
                          ref.read(authNotifierProvider);
                      final user = authState.value;
                      if (user == null) {
                        if (!context.mounted) {
                          return;
                        }
                        await showDialog<void>(
                          context: context,
                          builder: (dialogContext) {
                            return AlertDialog(
                              title: const Text('Sesión no encontrada'),
                              content: const Text(
                                'Debes iniciar sesión nuevamente para comenzar el checklist.',
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
                        return;
                      }

                      final repository = ExecutionRepository();
                      try {
                        final runId = await repository.createRun(
                          assignmentId: assignmentId,
                          surveyId: detail.survey.id,
                          userId: user.id,
                        );

                        if (!context.mounted) {
                          return;
                        }
                        context.push('/execution/$runId');
                      } catch (error) {
                        if (!context.mounted) {
                          return;
                        }
                        await showDialog<void>(
                          context: context,
                          builder: (dialogContext) {
                            return AlertDialog(
                              title:
                                  const Text('Error al iniciar ejecución'),
                              content: Text(
                                'No se pudo crear la ejecución del checklist: $error',
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
                    child: const Text('Comenzar'),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.section,
    required this.questionsCount,
  });

  final Section section;
  final int questionsCount;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              section.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (section.description != null) ...[
              const SizedBox(height: 4),
              Text(
                section.description!,
                style: const TextStyle(fontSize: 13),
              ),
            ],
            const SizedBox(height: 8),
            Text(
              '$questionsCount preguntas',
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
