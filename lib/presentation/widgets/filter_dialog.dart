import 'package:dropdown_search/dropdown_search.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';

class FilterDialog extends StatefulWidget {
  final String warehouseId;
  final String? initialCategoryId;
  final String? initialBrand;
  const FilterDialog({
    super.key,
    required this.warehouseId,
    this.initialCategoryId,
    this.initialBrand,
  });

  @override
  State<FilterDialog> createState() => _FilterDialogState();
}

class _FilterDialogState extends State<FilterDialog> {
  final SupabaseClient _client = SupabaseConfig.client;
  bool _loading = true;
  String? _error;
  List<String> _categories = [];
  String? _selectedCategoryId;
  List<String> _brands = [];
  String? _selectedBrand;

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.initialCategoryId;
    _selectedBrand = widget.initialBrand;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _client
          .from('inventario')
          .select('Categoria')
          .eq('Almacen', widget.warehouseId);
          
      final categories = (res as List)
          .map((e) => e['Categoria'] as String?)
          .where((e) => (e ?? '').isNotEmpty)
          .map((e) => e!)
          .toSet()
          .toList();
      categories.sort();

      setState(() {
        _categories = categories;
      });

      final prodRes = await _client
          .from('inventario')
          .select('Marca')
          .eq('Almacen', widget.warehouseId);
          
      final brands = (prodRes as List)
          .map((e) => e['Marca'] as String?)
          .where((e) => (e ?? '').isNotEmpty)
          .map((e) => e!)
          .toSet()
          .toList();
      brands.sort();

      setState(() {
        _brands = brands;
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
                  DropdownSearch<String>(
                    popupProps: const PopupProps.menu(
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
                    selectedItem: _selectedCategoryId,
                    dropdownDecoratorProps: const DropDownDecoratorProps(
                      dropdownSearchDecoration: InputDecoration(
                        labelText: "Categoría",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _selectedCategoryId = value;
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
              'categoryId': _selectedCategoryId,
              'brand': _selectedBrand,
            });
          },
          child: const Text('Aplicar'),
        ),
      ],
    );
  }
}
