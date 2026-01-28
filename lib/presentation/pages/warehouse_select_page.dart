import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/supabase_config.dart';
import 'inventory_page.dart';

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
      // Intentamos usar RPC primero (más eficiente)
      try {
        final res = await _client.rpc('get_unique_warehouses');
        final names = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toList();
        setState(() {
          _warehouses = names;
        });
      } catch (_) {
        // Fallback: si no existe la RPC, intentamos leer (limitado)
        // Nota: Esto solo traerá los primeros 1000 registros, por lo que podría no mostrar todos los almacenes.
        // Se recomienda encarecidamente crear la función RPC.
        final res = await _client.from('inventario').select('Almacen').order('Almacen');
        final names = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toSet()
            .toList();
        setState(() {
          _warehouses = names;
        });
      }
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
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => InventoryPage(warehouseId: w),
                          ),
                        );
                      },
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemCount: _warehouses.length,
                ),
    );
  }
}
