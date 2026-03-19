import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/local/database.dart';
import '../widgets/product_card.dart';
import '../widgets/inventory_count_dialog.dart';
import '../widgets/breadcrumb_navigation.dart';
import '../widgets/filter_dialog.dart';
import 'inventory_review_page.dart';

class InventoryPage extends StatefulWidget {
  final String warehouseId;
  final bool isSessionActive;

  const InventoryPage({
    super.key,
    required this.warehouseId,
    this.isSessionActive = true,
  });

  @override
  State<InventoryPage> createState() => InventoryPageState();
}

class InventoryPageState extends State<InventoryPage> {
  String _query = '';
  List<String> _selectedCategories = [];
  String? _selectedBrand;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _loadFiltersAndReload();
  }

  Future<void> _loadFiltersAndReload() async {
    await _loadSavedFilters();
    await reload();
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
        final pattern = '%$_query%';
        query.where(
          (t) =>
              t.description.like(pattern) |
              t.code.like(pattern) |
              t.product.like(pattern),
        );
      }
      if (_selectedCategories.isNotEmpty) {
        query.where((t) => t.category.isIn(_selectedCategories));
      }
      if (_selectedBrand != null && _selectedBrand!.isNotEmpty) {
        query.where((t) => t.brand.equals(_selectedBrand!));
      }

      query.orderBy([(t) => drift.OrderingTerm(expression: t.description)]);

      final results = await query.get();

      setState(() {
        _items = results
            .map((item) => {
                  'ProductId': item.productId,
                  'Codigo': item.code,
                  'Producto': item.product,
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
    if (!widget.isSessionActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Inventario finalizado. Inicia uno nuevo para editar.'),
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
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => FilterDialog(
        warehouseId: widget.warehouseId,
        initialCategoryIds: _selectedCategories,
        initialBrand: _selectedBrand,
      ),
    );
    if (result != null) {
      setState(() {
        _selectedCategories =
            (result['categoryIds'] as List<dynamic>? ?? []).cast<String>();
        _selectedBrand = result['brand'] as String?;
      });
      await _saveFilters();
      await reload();
    }
  }

  Future<void> _loadSavedFilters() async {
    final prefs = await SharedPreferences.getInstance();
    final keyPrefix = 'inventory_filters_${widget.warehouseId}';
    final savedCategories =
        prefs.getStringList('${keyPrefix}_categories') ?? <String>[];
    final savedBrand = prefs.getString('${keyPrefix}_brand');
    setState(() {
      _selectedCategories = savedCategories;
      _selectedBrand = savedBrand?.isNotEmpty == true ? savedBrand : null;
    });
  }

  Future<void> _saveFilters() async {
    final prefs = await SharedPreferences.getInstance();
    final keyPrefix = 'inventory_filters_${widget.warehouseId}';
    await prefs.setStringList('${keyPrefix}_categories', _selectedCategories);
    await prefs.setString(
        '${keyPrefix}_brand', _selectedBrand == null ? '' : _selectedBrand!);
  }

  void openReviewPage() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => InventoryReviewPage(
          warehouseId: widget.warehouseId,
          isSessionActive: widget.isSessionActive,
        ),
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
