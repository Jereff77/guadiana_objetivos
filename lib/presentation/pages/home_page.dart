import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../../services/sync_service.dart';
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
  int _selectedIndex = 0;
  String? _selectedWarehouse;
  final GlobalKey<InventoryPageState> _inventoryKey = GlobalKey();
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    if (widget.initialWarehouseId != null) {
      _selectedWarehouse = widget.initialWarehouseId;
      _selectedIndex = 1;
    }
    _checkPendingCount();
  }

  Future<void> _checkPendingCount() async {
    if (_selectedWarehouse == null) return;
    try {
      final count = await context
          .read<SyncService>()
          .getPendingCount(_selectedWarehouse!);
      if (mounted) {
        setState(() {
          _pendingCount = count;
        });
      }
    } catch (e) {
      debugPrint('Error checking pending count: $e');
    }
  }

  Future<void> _sync() async {
    if (_selectedWarehouse == null) return;
    await _syncWithId(_selectedWarehouse!);
  }

  Future<void> _syncWithId(String warehouseId) async {
    // Mostrar diálogo de progreso
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Sincronizando cambios...'),
          ],
        ),
      ),
    );

    try {
      await context.read<SyncService>().syncUp(warehouseId);

      if (!mounted) return;
      Navigator.of(context).pop(); // Cerrar diálogo

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sincronización completada')),
      );

      // Actualizar contador y recargar inventario
      if (_selectedWarehouse == warehouseId) {
        await _checkPendingCount();
        _inventoryKey.currentState?.reload();
      }
    } catch (e) {
      if (!mounted) return;
      Navigator.of(context).pop(); // Cerrar diálogo

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al sincronizar: $e')),
      );
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    if (index == 1) {
      _checkPendingCount();
    }
  }

  Future<void> _onWarehouseSelected(String warehouseId) async {
    // 1. Verificar cambios pendientes
    try {
      final pending =
          await context.read<SyncService>().getPendingCount(warehouseId);
      if (pending > 0 && mounted) {
        final result = await showDialog<String>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Cambios pendientes'),
            content: Text(
                'Tienes $pending cambios pendientes en $warehouseId. Si descargas ahora, perderás tus cambios locales. ¿Qué deseas hacer?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, 'cancel'),
                child: const Text('Cancelar'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, 'overwrite'),
                child: const Text('Sobrescribir'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx, 'sync'),
                child: const Text('Sincronizar'),
              ),
            ],
          ),
        );

        if (result == 'cancel' || result == null) return;
        if (result == 'sync') {
          await _syncWithId(warehouseId);
          // Continuar con la descarga
        }
      }
    } catch (e) {
      debugPrint('Error checking pending: $e');
    }

    if (!mounted) return;

    // 2. Descargar inventario
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Descargando inventario...'),
          ],
        ),
      ),
    );

    try {
      await context.read<SyncService>().downloadInventory(warehouseId);

      if (!mounted) return;
      Navigator.of(context).pop(); // Cerrar diálogo
    } catch (e) {
      if (!mounted) return;
      Navigator.of(context).pop(); // Cerrar diálogo
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Aviso: No se pudo descargar (Offline). Usando datos locales. Error: $e')),
      );
    }

    setState(() {
      _selectedWarehouse = warehouseId;
      _selectedIndex = 1;
    });
    _checkPendingCount();
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
                  icon: Stack(
                    children: [
                      const Icon(Icons.sync),
                      if (_pendingCount > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 12,
                              minHeight: 12,
                            ),
                            child: Text(
                              '$_pendingCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 8,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                  tooltip: 'Sincronizar ($_pendingCount pendientes)',
                  onPressed: _sync,
                ),
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
