import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/app_drawer.dart';
import '../domain/run.dart';
import 'history_notifier.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final runsState = ref.watch(historyNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de checklists'),
      ),
      drawer: const AppDrawer(),
      body: runsState.when(
        loading: () => const _HistoryLoading(),
        error: (error, _) => _HistoryError(
          message: error.toString(),
          onRetry: () {
            ref.read(historyNotifierProvider.notifier).refresh();
          },
        ),
        data: (runs) {
          if (runs.isEmpty) {
            return const _HistoryEmpty();
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(historyNotifierProvider.notifier).refresh(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: runs.length,
              itemBuilder: (context, index) {
                final run = runs[index];
                return _RunCard(run: run);
              },
            ),
          );
        },
      ),
    );
  }
}

class _HistoryLoading extends StatelessWidget {
  const _HistoryLoading();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Container(
            height: 72,
            padding: const EdgeInsets.all(16),
            alignment: Alignment.centerLeft,
            child: const LinearProgressIndicator(),
          ),
        );
      },
    );
  }
}

class _HistoryEmpty extends StatelessWidget {
  const _HistoryEmpty();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text('Aún no has completado ningún checklist'),
      ),
    );
  }
}

class _HistoryError extends StatelessWidget {
  const _HistoryError({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Error al cargar historial',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RunCard extends StatelessWidget {
  const _RunCard({
    required this.run,
  });

  final SurveyRun run;

  @override
  Widget build(BuildContext context) {
    final completedAt = run.completedAt;
    String? dateText;
    if (completedAt != null) {
      dateText = '${completedAt.day.toString().padLeft(2, '0')}/'
          '${completedAt.month.toString().padLeft(2, '0')}/'
          '${completedAt.year}';
    }

    final isCompleted = run.status == 'completed';
    final badgeColor =
        isCompleted ? AppColors.successGreen : AppColors.brandOrange;
    final badgeText = isCompleted ? 'Completado' : 'En progreso';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () {
          context.push('/history/${run.id}');
        },
        title: Text(
          run.surveyName.isEmpty ? 'Checklist' : run.surveyName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: dateText != null ? Text(dateText) : null,
        trailing: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 4,
          ),
          decoration: BoxDecoration(
            color: badgeColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            badgeText,
            style: TextStyle(
              fontSize: 12,
              color: badgeColor,
            ),
          ),
        ),
      ),
    );
  }
}
