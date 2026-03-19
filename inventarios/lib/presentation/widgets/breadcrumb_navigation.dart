import 'package:flutter/material.dart';

class BreadcrumbNavigation extends StatelessWidget {
  const BreadcrumbNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: const Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          _Crumb(text: 'Almacén'),
          _Divider(),
          _Crumb(text: 'Categoría'),
          _Divider(),
          _Crumb(text: 'Marca'),
        ],
      ),
    );
  }
}

class _Crumb extends StatelessWidget {
  final String text;
  const _Crumb({required this.text});
  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(text),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 4),
      child: Icon(Icons.chevron_right, size: 16),
    );
  }
}
