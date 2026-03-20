import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/datasources/local/database.dart';

class InventoryNotesDialog extends StatefulWidget {
  final String warehouseId;
  final String sessionId;

  const InventoryNotesDialog({
    super.key,
    required this.warehouseId,
    required this.sessionId,
  });

  @override
  State<InventoryNotesDialog> createState() => _InventoryNotesDialogState();
}

class _InventoryNotesDialogState extends State<InventoryNotesDialog> {
  final TextEditingController _controller = TextEditingController();
  bool _loading = true;
  bool _saving = false;
  List<InventoryNote> _notes = [];

  @override
  void initState() {
    super.initState();
    _loadNotes();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadNotes() async {
    setState(() {
      _loading = true;
    });
    final db = context.read<LocalDatabase>();
    final query = db.select(db.inventoryNotes)
      ..where((t) =>
          t.warehouseId.equals(widget.warehouseId) &
          t.sessionId.equals(widget.sessionId))
      ..orderBy([
        (t) => drift.OrderingTerm(
              expression: t.createdAt,
              mode: drift.OrderingMode.desc,
            )
      ]);
    final result = await query.get();
    if (!mounted) {
      return;
    }
    setState(() {
      _notes = result;
      _loading = false;
    });
  }

  Future<void> _addNote() async {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      return;
    }
    setState(() {
      _saving = true;
    });
    final db = context.read<LocalDatabase>();
    await db.into(db.inventoryNotes).insert(
          InventoryNotesCompanion.insert(
            warehouseId: widget.warehouseId,
            sessionId: widget.sessionId,
            note: text,
          ),
        );
    _controller.clear();
    await _loadNotes();
    if (mounted) {
      setState(() {
        _saving = false;
      });
    }
  }

  Future<void> _editNote(InventoryNote note) async {
    final controller = TextEditingController(text: note.note);
    final db = context.read<LocalDatabase>();
    final result = await showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar observación'),
          content: TextField(
            controller: controller,
            maxLines: 3,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () =>
                  Navigator.of(context).pop(controller.text.trim()),
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );
    if (result == null) {
      return;
    }
    final newText = result.trim();
    if (newText.isEmpty || newText == note.note) {
      return;
    }
    await (db.update(db.inventoryNotes)
          ..where((t) => t.id.equals(note.id)))
        .write(InventoryNotesCompanion(note: drift.Value(newText)));
    await _loadNotes();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Observaciones del inventario'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 200,
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _notes.isEmpty
                      ? const Center(
                          child: Text('Sin observaciones aún.'),
                        )
                      : ListView.separated(
                          itemCount: _notes.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 8),
                          itemBuilder: (context, index) {
                            final note = _notes[index];
                            return InkWell(
                              onTap: () => _editNote(note),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    note.note,
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatDateTime(note.createdAt),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Nueva observación',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cerrar'),
        ),
        ElevatedButton(
          onPressed: _saving ? null : _addNote,
          child: const Text('Guardar'),
        ),
      ],
    );
  }

  String _formatDateTime(DateTime value) {
    return '${value.day.toString().padLeft(2, '0')}/${value.month.toString().padLeft(2, '0')} '
        '${value.hour.toString().padLeft(2, '0')}:${value.minute.toString().padLeft(2, '0')}';
  }
}
