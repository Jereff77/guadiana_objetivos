import 'package:dropdown_search/dropdown_search.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/datasources/local/database.dart';

class FilterDialog extends StatefulWidget {
  final String warehouseId;
  final List<String>? initialCategoryIds;
  final String? initialBrand;
  final bool showZeroOption;
  final bool initialShowZeroInventory;
  const FilterDialog({
    super.key,
    required this.warehouseId,
    this.initialCategoryIds,
    this.initialBrand,
    this.showZeroOption = false,
    this.initialShowZeroInventory = false,
  });

  @override
  State<FilterDialog> createState() => _FilterDialogState();
}

class _FilterDialogState extends State<FilterDialog> {
  // Eliminado: final SupabaseClient _client = SupabaseConfig.client;
  bool _loading = true;
  String? _error;
  List<String> _categories = [];
  List<String> _selectedCategoryIds = [];
  List<String> _brands = [];
  String? _selectedBrand;
  bool _showZeroInventory = false;

  @override
  void initState() {
    super.initState();
    _selectedCategoryIds = List<String>.from(widget.initialCategoryIds ?? []);
    _selectedBrand = widget.initialBrand;
    _showZeroInventory = widget.initialShowZeroInventory;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final db = context.read<LocalDatabase>();

      // Obtener categorías únicas desde la BD local
      final categoriesQuery = db.selectOnly(db.localInventory, distinct: true)
        ..addColumns([db.localInventory.category])
        ..where(db.localInventory.warehouseId.equals(widget.warehouseId));

      final categoriesResult = await categoriesQuery.get();
      final categories = categoriesResult
          .map((row) => row.read(db.localInventory.category))
          .where((c) => c != null && c.isNotEmpty)
          .map((c) => c!)
          .toList();
      categories.sort();

      setState(() {
        _categories = categories;
      });

      // Obtener marcas únicas desde la BD local
      final brandsQuery = db.selectOnly(db.localInventory, distinct: true)
        ..addColumns([db.localInventory.brand])
        ..where(db.localInventory.warehouseId.equals(widget.warehouseId));

      final brandsResult = await brandsQuery.get();
      final brands = brandsResult
          .map((row) => row.read(db.localInventory.brand))
          .where((b) => b != null && b.isNotEmpty)
          .map((b) => b!)
          .toList();
      brands.sort();

      setState(() {
        _brands = brands;
      });
    } catch (e) {
      setState(() {
        _error = 'Error cargando filtros: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Filtros'),
      content: _loading
          ? const SizedBox(
              height: 80,
              child: Center(child: CircularProgressIndicator()),
            )
          : SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownSearch<String>.multiSelection(
                    popupProps: const PopupPropsMultiSelection.menu(
                      showSearchBox: true,
                      searchFieldProps: TextFieldProps(
                        decoration: InputDecoration(
                          hintText: "Buscar categoría...",
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                      ),
                    ),
                    items: _categories,
                    selectedItems: _selectedCategoryIds,
                    dropdownDecoratorProps: const DropDownDecoratorProps(
                      dropdownSearchDecoration: InputDecoration(
                        labelText: "Categorías",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    onChanged: (values) {
                      setState(() {
                        _selectedCategoryIds = List<String>.from(values);
                      });
                    },
                    clearButtonProps: const ClearButtonProps(isVisible: true),
                  ),
                  const SizedBox(height: 12),
                  DropdownSearch<String>(
                    popupProps: const PopupProps.menu(
                      showSearchBox: true,
                      searchFieldProps: TextFieldProps(
                        decoration: InputDecoration(
                          hintText: "Buscar marca...",
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                      ),
                    ),
                    items: _brands,
                    selectedItem: _selectedBrand,
                    dropdownDecoratorProps: const DropDownDecoratorProps(
                      dropdownSearchDecoration: InputDecoration(
                        labelText: "Marca",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _selectedBrand = value;
                      });
                    },
                    clearButtonProps: const ClearButtonProps(isVisible: true),
                  ),
                  if (widget.showZeroOption) ...[
                    const SizedBox(height: 12),
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Mostrar inventarios en 0'),
                      value: _showZeroInventory,
                      onChanged: (val) {
                        setState(() {
                          _showZeroInventory = val ?? false;
                        });
                      },
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
                  ],
                  if (_error != null) ...[
                    const SizedBox(height: 8),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ]
                ],
              ),
            ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.of(context).pop({
              'categoryIds': _selectedCategoryIds,
              'brand': _selectedBrand,
              'showZeroInventory': _showZeroInventory,
            });
          },
          child: const Text('Aplicar'),
        ),
      ],
    );
  }
}
