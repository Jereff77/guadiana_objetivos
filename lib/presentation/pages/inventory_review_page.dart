import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/datasources/local/database.dart';
import '../widgets/inventory_count_dialog.dart';

class InventoryReviewPage extends StatefulWidget {
  final String warehouseId;
  final bool isSessionActive;

  const InventoryReviewPage({
    super.key,
    required this.warehouseId,
    this.isSessionActive = true,
  });

  @override
  State<InventoryReviewPage> createState() => _InventoryReviewPageState();
}

class _InventoryReviewPageState extends State<InventoryReviewPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final db = context.read<LocalDatabase>();
      var query = db.select(db.localInventory)
        ..where((t) => t.warehouseId.equals(widget.warehouseId))
        ..where((t) => t.physicalStock.isNotNull()); // Mostrar solo lo contado

      if (_query.isNotEmpty) {
        query.where((t) => t.description.like('%$_query%'));
      }

      // Ordenar por descripción
      query.orderBy([(t) => drift.OrderingTerm(expression: t.description)]);

      final results = await query.get();

      setState(() {
        _items = results
            .map((item) => {
                  'ProductId': item.productId,
                  'Codigo': item.code,
                  'Descripcion': item.description,
                  'Categoria': item.category,
                  'Marca': item.brand,
                  'Existencia': item.stock, // Stock Sistema
                  'ConteoFisico': item.physicalStock, // Conteo Físico
                  'Disponible': item.available,
                  'Notas': item.notes,
                  'Almacen': item.warehouseId,
                })
            .toList();
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _openCountDialog(Map<String, dynamic> product) {
    if (!widget.isSessionActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Inventario finalizado. No se pueden editar los conteos.'),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => InventoryCountDialog(
        product: product,
        currentInventory: {
          'Existencia': product['Existencia'],
          'ConteoFisico': product['ConteoFisico'],
          'Notas': product['Notas'],
        },
        onSave: (newQuantity, notes) async {
          await _updateInventory(product, newQuantity, notes);
          await _load();
        },
      ),
    );
  }

  Future<void> _updateInventory(
      Map<String, dynamic> row, int newQty, String? notes) async {
    final id = row['ProductId'];
    final db = context.read<LocalDatabase>();

    await (db.update(db.localInventory)
          ..where((t) =>
              t.productId.equals(id) &
              t.warehouseId.equals(widget.warehouseId)))
        .write(LocalInventoryCompanion(
      physicalStock: drift.Value(newQty), // Actualizar Conteo Físico
      notes: drift.Value(notes),
      isSynced: const drift.Value(false), // Marcar como no sincronizado
      lastUpdated: drift.Value(DateTime.now()),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Artículos Inventariados'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Buscar en inventariados...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (val) {
                _query = val;
                _load();
              },
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text('Error: $_error'))
                    : _items.isEmpty
                        ? const Center(
                            child: Text('No hay artículos contados aún.'))
                        : ListView.builder(
                            itemCount: _items.length,
                            itemBuilder: (context, index) {
                              final item = _items[index];
                              final sysStock = item['Existencia'] ?? 0;
                              final physStock = item['ConteoFisico'] ?? 0;
                              final diff = physStock - sysStock;
                              final hasDiff = diff != 0;

                              return Card(
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                child: ListTile(
                                  title:
                                      Text(item['Descripcion'] ?? 'Sin nombre'),
                                  subtitle: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('Código: ${item['Codigo'] ?? ''}'),
                                      Row(
                                        children: [
                                          Text('Sistema: $sysStock'),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Conteo: $physStock',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Dif: $diff',
                                            style: TextStyle(
                                              color: hasDiff
                                                  ? Colors.red
                                                  : Colors.green,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (item['Notas'] != null &&
                                          item['Notas'].toString().isNotEmpty)
                                        Text('Nota: ${item['Notas']}',
                                            style: const TextStyle(
                                                fontStyle: FontStyle.italic,
                                                color: Colors.blueGrey)),
                                    ],
                                  ),
                                  trailing: widget.isSessionActive
                                      ? const Icon(Icons.edit)
                                      : null,
                                  onTap: () => _openCountDialog(item),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
