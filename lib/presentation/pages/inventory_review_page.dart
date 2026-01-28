import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../widgets/inventory_count_dialog.dart';

class InventoryReviewPage extends StatefulWidget {
  final String warehouseId;

  const InventoryReviewPage({super.key, required this.warehouseId});

  @override
  State<InventoryReviewPage> createState() => _InventoryReviewPageState();
}

class _InventoryReviewPageState extends State<InventoryReviewPage> {
  final SupabaseClient _client = SupabaseConfig.client;
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
      dynamic query = _client
          .from('inventario')
          .select('*')
          .eq('Almacen', widget.warehouseId)
          .gt('Existencia', 0); // Filtra items con existencia > 0

      if (_query.isNotEmpty) {
        query = query.ilike('Descripcion', '%$_query%');
      }

      // Ordenar por descripción o última modificación si existiera
      query = query.order('Descripcion', ascending: true);

      final res = await query;
      setState(() {
        _items = (res as List).cast<Map<String, dynamic>>();
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
    showDialog(
      context: context,
      builder: (context) => InventoryCountDialog(
        product: product,
        currentInventory: {
          'Existencia': product['Existencia'],
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
    await _client
        .from('inventario')
        .update({
          'Existencia': newQty,
          'Disponible': newQty,
          'Notas': notes,
        })
        .eq('ProductId', id)
        .eq('Almacen', widget.warehouseId);
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
                            child: Text('No hay artículos inventariados.'))
                        : ListView.builder(
                            itemCount: _items.length,
                            itemBuilder: (context, index) {
                              final item = _items[index];
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
                                      Text('Existencia: ${item['Existencia']}'),
                                      if (item['Notas'] != null &&
                                          item['Notas'].toString().isNotEmpty)
                                        Text('Nota: ${item['Notas']}',
                                            style: const TextStyle(
                                                fontStyle: FontStyle.italic,
                                                color: Colors.blueGrey)),
                                    ],
                                  ),
                                  trailing: const Icon(Icons.edit),
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
