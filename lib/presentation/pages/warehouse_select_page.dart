import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import '../../data/datasources/local/database.dart';
import '../../services/role_service.dart';
import '../../services/sync_service.dart';
import 'home_page.dart';

class WarehouseSelectPage extends StatefulWidget {
  const WarehouseSelectPage({super.key});

  @override
  State<WarehouseSelectPage> createState() => _WarehouseSelectPageState();
}

class _WarehouseSelectPageState extends State<WarehouseSelectPage> {
  final SupabaseClient _client = SupabaseConfig.client;
  bool _loading = true;
  String? _error;
  List<String> _warehouses = [];

  @override
  void initState() {
    super.initState();
    _loadWarehouses();
  }

  Future<void> _loadWarehouses() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      List<String> remoteWarehouses = [];
      try {
        // 1. Intentar RPC
        final res = await _client.rpc('get_unique_warehouses');
        remoteWarehouses = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toList();
      } catch (_) {
        // 2. Fallback REST
        final res =
            await _client.from('inventario').select('Almacen').order('Almacen');
        remoteWarehouses = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toSet()
            .toList();
      }

      // 3. Filtrar por rol (puede requerir red adicional)
      final accessible =
          await RoleService.getAccessibleWarehouses(remoteWarehouses);

      if (mounted) {
        setState(() {
          _warehouses = accessible;
        });
      }

      // Si la lista está vacía después de todo, podría ser error de red en RoleService
      // Lanzamos excepción para activar el fallback local
      if (accessible.isEmpty) {
        throw Exception(
            'No se encontraron almacenes accesibles o error de conexión.');
      }
    } catch (e) {
      // 4. Fallback final: Local Database (Offline)
      debugPrint('Error cargando almacenes remotos: $e');
      try {
        if (!mounted) return;
        final localWarehouses =
            await context.read<LocalDatabase>().getUniqueWarehouses();

        if (mounted) {
          if (localWarehouses.isNotEmpty) {
            setState(() {
              _warehouses = localWarehouses;
              _error = null;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Modo Offline: Mostrando almacenes descargados.'),
                duration: Duration(seconds: 3),
              ),
            );
          } else {
            // Solo mostramos error si tampoco hay locales
            setState(() {
              _error = 'No se pudieron cargar almacenes. Verifica tu conexión.';
            });
          }
        }
      } catch (localError) {
        if (mounted) {
          setState(() {
            _error = 'Error crítico: $e';
          });
        }
      }
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
    return Scaffold(
      appBar: AppBar(title: const Text('Seleccionar Almacén')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final w = _warehouses[index];
                    return ListTile(
                      title: Text(w),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () async {
                        // Mostrar indicador de carga
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
                          await context
                              .read<SyncService>()
                              .downloadInventory(w);

                          if (!context.mounted) return;
                          Navigator.of(context).pop(); // Cerrar diálogo

                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => HomePage(initialWarehouseId: w),
                            ),
                          );
                        } catch (e) {
                          if (!context.mounted) return;
                          Navigator.of(context).pop(); // Cerrar diálogo

                          // Verificar si tenemos datos locales
                          final hasLocalData = await context
                              .read<LocalDatabase>()
                              .hasInventoryFor(w);

                          if (hasLocalData) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text(
                                      'Sin conexión. Usando datos locales.')),
                            );
                            Navigator.of(context).pushReplacement(
                              MaterialPageRoute(
                                builder: (_) => HomePage(initialWarehouseId: w),
                              ),
                            );
                          } else {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text(
                                      'Error al descargar y no hay datos locales: $e')),
                            );
                          }
                        }
                      },
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemCount: _warehouses.length,
                ),
    );
  }
}
