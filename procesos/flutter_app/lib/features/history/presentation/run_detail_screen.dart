import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/history_repository.dart';

class RunDetailScreen extends ConsumerWidget {
  const RunDetailScreen({
    super.key,
    required this.runId,
  });

  final String runId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final runDetailProvider =
        FutureProvider.autoDispose((ref) async {
      final repository = HistoryRepository();
      return repository.getRunQuestionDetails(runId);
    });

    final state = ref.watch(runDetailProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de ejecución'),
      ),
      body: state.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Error al cargar el detalle: $error',
              textAlign: TextAlign.center,
            ),
          ),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No se encontraron respuestas para esta ejecución.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final sections = <String, List<RunQuestionDetail>>{};

          for (final item in items) {
            final key =
                '${item.sectionOrder.toString().padLeft(4, '0')}|${item.sectionTitle}';
            sections.putIfAbsent(key, () => []).add(item);
          }

          final sortedKeys = sections.keys.toList()
            ..sort();

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: sortedKeys.length,
            itemBuilder: (context, index) {
              final key = sortedKeys[index];
              final sectionItems = sections[key]!;
              final sectionTitle = sectionItems.first.sectionTitle;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      sectionTitle.isEmpty
                          ? 'Sección'
                          : sectionTitle,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ...sectionItems.map((item) {
                    return Card(
                      margin:
                          const EdgeInsets.only(bottom: 8),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.questionText,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.answerText.isEmpty
                                  ? 'Sin respuesta'
                                  : item.answerText,
                              style: const TextStyle(
                                fontSize: 14,
                              ),
                            ),
                            if (item.comment != null &&
                                item.comment!
                                    .trim()
                                    .isNotEmpty) ...[
                              const SizedBox(height: 6),
                              const Text(
                                'Comentario:',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.comment!,
                                style: const TextStyle(
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  }),
                  const Divider(),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
