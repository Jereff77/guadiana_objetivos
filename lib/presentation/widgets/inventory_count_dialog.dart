import 'package:flutter/material.dart';

class InventoryCountDialog extends StatefulWidget {
  final Map<String, dynamic> product;
  final Map<String, dynamic>? currentInventory;
  final Future<void> Function(int) onSave;

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

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: (widget.currentInventory?['Existencia'] ?? 0).toString());
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
          Text('Existencia Actual: ${widget.currentInventory?['Existencia'] ?? 0}'),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Cantidad Real',
              border: OutlineInputBorder(),
            ),
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
            await widget.onSave(newQuantity);
            if (mounted) Navigator.of(context).pop();
          },
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
