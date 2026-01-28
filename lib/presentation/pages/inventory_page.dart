import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../widgets/product_card.dart';
import '../widgets/inventory_count_dialog.dart';
import '../widgets/breadcrumb_navigation.dart';
import '../widgets/filter_dialog.dart';
import 'inventory_review_page.dart';

class InventoryPage extends StatefulWidget {
  final String warehouseId;
  const InventoryPage({super.key, required this.warehouseId});

  @override
  State<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends State<InventoryPage> {
  final SupabaseClient _client = SupabaseConfig.client;
  String _query = '';
  String? _selectedCategory;
  String? _selectedBrand;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

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
      var query = _client
          .from('inventario')
          .select('*')
          .eq('Almacen', widget.warehouseId);
      if (_query.isNotEmpty) {
        query = query.ilike('Descripcion', '%$_query%');
      }
      if (_selectedCategory != null && _selectedCategory!.isNotEmpty) {
        query = query.eq('Categoria', _selectedCategory!);
      }
      if (_selectedBrand != null && _selectedBrand!.isNotEmpty) {
        query = query.eq('Marca', _selectedBrand!);
      }
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

  void _onSearchChanged(String value) {
    _query = value;
    _load();
  }

  void _openCountDialog(
      Map<String, dynamic> product, Map<String, dynamic>? inv) {
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

  Future<void> _showFilterDialog() async {
    final result = await showDialog<Map<String, String?>>(
      context: context,
      builder: (context) => FilterDialog(
        warehouseId: widget.warehouseId,
        initialCategoryId: _selectedCategory,
        initialBrand: _selectedBrand,
      ),
    );
    if (result != null) {
      setState(() {
        _selectedCategory = result['categoryId'];
        _selectedBrand = result['brand'];
      });
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventario'),
        actions: [
          IconButton(
            icon: const Icon(Icons.list_alt),
            tooltip: 'Ver Inventariados',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) =>
                      InventoryReviewPage(warehouseId: widget.warehouseId),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          const BreadcrumbNavigation(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Buscar por descripción',
                border: OutlineInputBorder(),
              ),
              onChanged: _onSearchChanged,
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text('Error: $_error'))
                    : ListView.separated(
                        padding: const EdgeInsets.all(8),
                        itemBuilder: (context, index) {
                          final item = _items[index];
                          final inv = {'Existencia': item['Existencia'] ?? 0};
                          return GestureDetector(
                            onTap: () => _openCountDialog(item, inv),
                            child: ProductCard(product: item, inventory: inv),
                          );
                        },
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemCount: _items.length,
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.sync),
      ),
    );
  }
}
