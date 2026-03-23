import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'assignments_notifier.dart';
import 'checklist_card.dart';
import '../../../shared/widgets/app_drawer.dart';

class AssignmentsScreen extends ConsumerWidget {
  const AssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assignmentsState = ref.watch(assignmentsNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Checklists'),
      ),
      drawer: const AppDrawer(),
      body: assignmentsState.when(
        loading: () => const _AssignmentsLoading(),
        error: (error, _) => _AssignmentsError(
          message: error.toString(),
          onRetry: () {
            ref.read(assignmentsNotifierProvider.notifier).refresh();
          },
        ),
        data: (items) {
          if (items.isEmpty) {
            return const _AssignmentsEmpty();
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(assignmentsNotifierProvider.notifier).refresh(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return ChecklistCard(
                  item: item,
                  onTap: () {
                    final assignmentId = item.assignment.id;
                    context.push('/checklist/$assignmentId');
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _AssignmentsLoading extends StatelessWidget {
  const _AssignmentsLoading();

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

class _AssignmentsEmpty extends StatelessWidget {
  const _AssignmentsEmpty();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text('No tienes checklists asignados'),
      ),
    );
  }
}

class _AssignmentsError extends StatelessWidget {
  const _AssignmentsError({
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
              'Error al cargar asignaciones',
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
