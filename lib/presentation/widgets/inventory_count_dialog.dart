import 'package:flutter/material.dart';

class InventoryCountDialog extends StatefulWidget {
  final Map<String, dynamic> product;
  final Map<String, dynamic>? currentInventory;
  final Future<void> Function(int, String?) onSave;

  const InventoryCountDialog({
    super.key,
    required this.product,
    required this.currentInventory,
    required this.onSave,
  });

  @override
  State<InventoryCountDialog> createState() => _InventoryCountDialogState();
}

class _InventoryCountDialogState extends State<InventoryCountDialog> {
  late TextEditingController _controller;
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
        text: (widget.currentInventory?['Existencia'] ?? 0).toString());
    _notesController =
        TextEditingController(text: widget.currentInventory?['Notas'] ?? '');
  }

  @override
  void dispose() {
    _controller.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.product['Producto'] ?? ''),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Marca: ${widget.product['Marca'] ?? ''}'),
          const SizedBox(height: 8),
          Text('Modelo: ${widget.product['Modelo'] ?? ''}'),
          const SizedBox(height: 8),
          Text(
              'Existencia Actual: ${widget.currentInventory?['Existencia'] ?? 0}'),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Cantidad Real',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Notas',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () async {
            final newQuantity = int.tryParse(_controller.text) ?? 0;
            final notes = _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim();
            await widget.onSave(newQuantity, notes);
            if (!context.mounted) return;
            Navigator.of(context).pop();
          },
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
