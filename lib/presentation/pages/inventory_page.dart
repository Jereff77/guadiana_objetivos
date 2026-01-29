import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import '../../data/datasources/local/database.dart';
import '../widgets/product_card.dart';
import '../widgets/inventory_count_dialog.dart';
import '../widgets/breadcrumb_navigation.dart';
import '../widgets/filter_dialog.dart';
import 'inventory_review_page.dart';

class InventoryPage extends StatefulWidget {
  final String warehouseId;
  const InventoryPage({super.key, required this.warehouseId});

  @override
  State<InventoryPage> createState() => InventoryPageState();
}

class InventoryPageState extends State<InventoryPage> {
  String _query = '';
  String? _selectedCategory;
  String? _selectedBrand;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    reload();
  }

  Future<void> reload() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final db = context.read<LocalDatabase>();
      var query = db.select(db.localInventory)
        ..where((t) => t.warehouseId.equals(widget.warehouseId));
      // ..where((t) => t.stock.isBiggerThanValue(0)); // Mostrar todos para permitir conteo

      if (_query.isNotEmpty) {
        query.where((t) => t.description.like('%$_query%'));
      }
      if (_selectedCategory != null && _selectedCategory!.isNotEmpty) {
        query.where((t) => t.category.equals(_selectedCategory!));
      }
      if (_selectedBrand != null && _selectedBrand!.isNotEmpty) {
        query.where((t) => t.brand.equals(_selectedBrand!));
      }

      final results = await query.get();

      setState(() {
        _items = results
            .map((item) => {
                  'ProductId': item.productId,
                  'Codigo': item.code,
                  'Descripcion': item.description,
                  'Categoria': item.category,
                  'Marca': item.brand,
                  'Existencia': item.stock,
                  'ConteoFisico': item.physicalStock, // Mapear nuevo campo
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

  void _onSearchChanged(String value) {
    _query = value;
    reload();
  }

  void _openCountDialog(
      Map<String, dynamic> product, Map<String, dynamic>? inv) {
    showDialog(
      context: context,
      builder: (context) => InventoryCountDialog(
        product: product,
        currentInventory: {
          'Existencia': product['Existencia'], // Stock Sistema
          'ConteoFisico': product['ConteoFisico'], // Conteo Físico Actual
          'Notas': product['Notas'],
        },
        onSave: (newQuantity, notes) async {
          await _updateInventory(product, newQuantity, notes);
          await reload();
        },
      ),
    );
  }

  Future<void> _updateInventory(
      Map<String, dynamic> product, int newQuantity, String? notes) async {
    final db = context.read<LocalDatabase>();
    await (db.update(db.localInventory)
          ..where((t) =>
              t.productId.equals(product['ProductId']) &
              t.warehouseId.equals(widget.warehouseId)))
        .write(LocalInventoryCompanion(
      physicalStock: drift.Value(newQuantity), // Actualizar solo conteo físico
      notes: drift.Value(notes),
      isSynced: const drift.Value(false),
      lastUpdated: drift.Value(DateTime.now()),
    ));
  }

  Future<void> showFilterDialog() async {
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
      await reload();
    }
  }

  void openReviewPage() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InventoryReviewPage(warehouseId: widget.warehouseId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Column(
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
    );
  }
}
