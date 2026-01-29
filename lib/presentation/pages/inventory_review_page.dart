import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/datasources/local/database.dart';
import '../../services/role_service.dart';
import '../widgets/inventory_count_dialog.dart';

class InventoryReviewPage extends StatefulWidget {
  final String warehouseId;
  final bool isSessionActive;

  const InventoryReviewPage({
    super.key,
    required this.warehouseId,
    this.isSessionActive = true,
  });

  @override
  State<InventoryReviewPage> createState() => _InventoryReviewPageState();
}

class _InventoryReviewPageState extends State<InventoryReviewPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];
  String _query = '';
  Map<String, Map<String, dynamic>> _userProfiles = {};

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
      final db = context.read<LocalDatabase>();
      var query = db.select(db.localInventory)
        ..where((t) => t.warehouseId.equals(widget.warehouseId))
        ..where((t) => t.physicalStock.isNotNull()); // Mostrar solo lo contado

      if (_query.isNotEmpty) {
        query.where((t) => t.description.like('%$_query%'));
      }

      // Ordenar por descripción
      query.orderBy([(t) => drift.OrderingTerm(expression: t.description)]);

      final results = await query.get();

      // Obtener información de usuarios si es auditor
      final role = await RoleService.getRole();
      if (role == UserRole.auditor) {
        await _loadUserProfiles();
      }

      setState(() {
        _items = results
            .map((item) => {
                  'ProductId': item.productId,
                  'Codigo': item.code,
                  'Descripcion': item.description,
                  'Categoria': item.category,
                  'Marca': item.brand,
                  'Existencia': item.stock, // Stock Sistema
                  'ConteoFisico': item.physicalStock, // Conteo Físico
                  'Disponible': item.available,
                  'Notas': item.notes,
                  'Almacen': item.warehouseId,
                  'lastUpdated': item.lastUpdated,
                  'isSynced': item.isSynced,
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

  Future<void> _loadUserProfiles() async {
    try {
      final client = Supabase.instance.client;
      
      // Obtener conteos de inventario para saber qué usuarios participaron
      final countsResponse = await client
          .from('conteo_inventario')
          .select('user_id')
          .eq('warehouse_id', widget.warehouseId);
      
      final userIds = (countsResponse as List)
          .map((c) => c['user_id'] as String?)
          .where((id) => id != null)
          .toSet()
          .toList();

      if (userIds.isNotEmpty) {
        final profilesResponse = await client
            .from('app_profiles')
            .select()
            .filter('id', 'in', userIds);

        for (var p in profilesResponse) {
          _userProfiles[p['id']] = p;
        }
      }
    } catch (e) {
      debugPrint('Error loading user profiles: $e');
    }
  }

  String _getUserName(String? userId) {
    if (userId == null) return 'Desconocido';
    
    // Si es almacenista, mostrar su propio nombre
    final currentUser = Supabase.instance.client.auth.currentUser;
    if (currentUser != null && userId == currentUser.id) {
      return 'Tú';
    }
    
    final profile = _userProfiles[userId];
    if (profile != null) {
      if (profile['first_name'] != null) {
        return '${profile['first_name']} ${profile['last_name'] ?? ''}'.trim();
      }
      return profile['email'] ?? 'Usuario ${userId.substring(0, 4)}';
    }
    return 'Usuario ${userId.substring(0, 4)}';
  }

  void _openCountDialog(Map<String, dynamic> product) {
    if (!widget.isSessionActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Inventario finalizado. No se pueden editar los conteos.'),
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
          'Existencia': product['Existencia'],
          'ConteoFisico': product['ConteoFisico'],
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
    final db = context.read<LocalDatabase>();

    await (db.update(db.localInventory)
          ..where((t) =>
              t.productId.equals(id) &
              t.warehouseId.equals(widget.warehouseId)))
        .write(LocalInventoryCompanion(
      physicalStock: drift.Value(newQty), // Actualizar Conteo Físico
      notes: drift.Value(notes),
      isSynced: const drift.Value(false), // Marcar como no sincronizado
      lastUpdated: drift.Value(DateTime.now()),
    ));
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
                            child: Text('No hay artículos contados aún.'))
                        : ListView.builder(
                            itemCount: _items.length,
                            itemBuilder: (context, index) {
                              final item = _items[index];
                              final sysStock = item['Existencia'] ?? 0;
                              final physStock = item['ConteoFisico'] ?? 0;
                              final diff = physStock - sysStock;
                              final hasDiff = diff != 0;
                              final lastUpdated = item['lastUpdated'] as DateTime?;
                              final isSynced = item['isSynced'] as bool? ?? true;

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
                                      Row(
                                        children: [
                                          Text('Sistema: $sysStock'),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Conteo: $physStock',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(width: 16),
                                          Text(
                                            'Dif: $diff',
                                            style: TextStyle(
                                              color: hasDiff
                                                  ? Colors.red
                                                  : Colors.green,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                      // Mostrar información de sincronización y usuario
                                      Row(
                                        children: [
                                          Icon(
                                            isSynced ? Icons.cloud_done : Icons.cloud_upload,
                                            size: 14,
                                            color: isSynced ? Colors.green : Colors.orange,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            isSynced ? 'Sincronizado' : 'Pendiente',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isSynced ? Colors.green : Colors.orange,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          if (lastUpdated != null) ...[
                                            const SizedBox(width: 8),
                                            Text(
                                              'Actualizado: ${_formatDateTime(lastUpdated)}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      if (item['Notas'] != null &&
                                          item['Notas'].toString().isNotEmpty)
                                        Text('Nota: ${item['Notas']}',
                                            style: const TextStyle(
                                                fontStyle: FontStyle.italic,
                                                color: Colors.blueGrey)),
                                    ],
                                  ),
                                  trailing: widget.isSessionActive
                                      ? const Icon(Icons.edit)
                                      : null,
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

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
