import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../widgets/app_drawer.dart';
import 'dashboard_page.dart';
import 'inventory_page.dart';

class HomePage extends StatefulWidget {
  final String? initialWarehouseId;
  const HomePage({super.key, this.initialWarehouseId});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final SupabaseClient _client = SupabaseConfig.client;

  int _selectedIndex = 0;
  String? _selectedWarehouse;
  final GlobalKey<InventoryPageState> _inventoryKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    if (widget.initialWarehouseId != null) {
      _selectedWarehouse = widget.initialWarehouseId;
      _selectedIndex = 1;
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _onWarehouseSelected(String warehouseId) {
    setState(() {
      _selectedWarehouse = warehouseId;
      _selectedIndex = 1; // Cambiar a pestaña de inventario automáticamente
    });
  }

  @override
  Widget build(BuildContext context) {
    // Definir las páginas disponibles
    final Widget content;
    if (_selectedIndex == 0) {
      content = DashboardPage(warehouseId: _selectedWarehouse);
    } else {
      content = _selectedWarehouse != null
          ? InventoryPage(
              key: _inventoryKey, // Asignamos la key para acceder al estado
              warehouseId: _selectedWarehouse!,
            )
          : const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Selecciona un almacén en el menú lateral para ver el inventario',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ),
            );
    }

    return Scaffold(
      appBar: AppBar(
        title: _selectedIndex == 0
            ? Image.asset(
                'assets/images/guadiana.png',
                height: 40,
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Inventario', style: TextStyle(fontSize: 16)),
                  if (_selectedWarehouse != null)
                    Text(
                      _selectedWarehouse!,
                      style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w300),
                    ),
                ],
              ),
        centerTitle: _selectedIndex == 0,
        actions: _selectedIndex == 1 && _selectedWarehouse != null
            ? [
                IconButton(
                  icon: const Icon(Icons.list_alt),
                  tooltip: 'Ver Inventariados',
                  onPressed: () => _inventoryKey.currentState?.openReviewPage(),
                ),
                IconButton(
                  icon: const Icon(Icons.filter_list),
                  tooltip: 'Filtrar',
                  onPressed: () =>
                      _inventoryKey.currentState?.showFilterDialog(),
                ),
              ]
            : null,
      ),
      drawer: AppDrawer(
        onWarehouseSelected: _onWarehouseSelected,
      ),
      body: content,
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Inventario',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        onTap: _onItemTapped,
      ),
    );
  }
}
