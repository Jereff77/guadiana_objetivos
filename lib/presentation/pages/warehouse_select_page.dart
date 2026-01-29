import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/config/supabase_config.dart';
import '../../data/datasources/local/database.dart';
import '../../services/role_service.dart';
import '../../services/sync_service.dart';
import 'home_page.dart';
import 'inventory_history_page.dart';

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
  Map<String, Map<String, dynamic>> _warehouseStats = {};

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

      // Cargar estadísticas locales para cada almacén
      final stats = <String, Map<String, dynamic>>{};
      if (mounted) {
        final db = context.read<LocalDatabase>();
        for (final w in accessible) {
          stats[w] = await db.getWarehouseStats(w);
        }
      }

      if (mounted) {
        setState(() {
          _warehouses = accessible;
          _warehouseStats = stats;
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
        if (!mounted) {
          return;
        }
        final db = context.read<LocalDatabase>();
        final localWarehouses = await db.getUniqueWarehouses();

        final stats = <String, Map<String, dynamic>>{};
        for (final w in localWarehouses) {
          stats[w] = await db.getWarehouseStats(w);
        }

        if (mounted) {
          if (localWarehouses.isNotEmpty) {
            setState(() {
              _warehouses = localWarehouses;
              _warehouseStats = stats;
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
      appBar: AppBar(
        title: const Text('Seleccionar Almacén'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final w = _warehouses[index];
                    final stats = _warehouseStats[w];
                    final count = stats?['count'] as int? ?? 0;
                    final lastUpdated = stats?['lastUpdated'] as DateTime?;

                    String subtitle = 'Sin descarga previa';
                    if (count > 0 && lastUpdated != null) {
                      final dateStr =
                          '${lastUpdated.day.toString().padLeft(2, '0')}/${lastUpdated.month.toString().padLeft(2, '0')}/${lastUpdated.year} ${lastUpdated.hour.toString().padLeft(2, '0')}:${lastUpdated.minute.toString().padLeft(2, '0')}';
                      subtitle = 'Descargado: $dateStr\nRegistros: $count';
                    }

                    return ListTile(
                      title: Text(w),
                      subtitle: Text(subtitle),
                      isThreeLine: true,
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () async {
                        // Verificar si es necesario asignar el almacén (Auto-asignación)
                        final role = await RoleService.getRole();
                        final isAuditor = role == UserRole.auditor;

                        // Si es almacenista y estamos viendo la lista completa,
                        // asumimos que no tiene asignación y debemos asignarlo ahora.
                        if (!isAuditor && _warehouses.length > 1) {
                          bool confirm = await showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Confirmar Asignación'),
                                  content: Text(
                                      'Se te asignará el almacén "$w" de forma permanente.\n\n'
                                      'Una vez asignado, no podrás cambiarlo.\n'
                                      '¿Estás seguro?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.of(ctx).pop(false),
                                      child: const Text('Cancelar'),
                                    ),
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.of(ctx).pop(true),
                                      child: const Text('Confirmar'),
                                    ),
                                  ],
                                ),
                              ) ??
                              false;

                          if (!confirm) return;

                          // Mostrar diálogo de asignación
                          if (!context.mounted) return;
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (ctx) => const AlertDialog(
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircularProgressIndicator(),
                                  SizedBox(height: 16),
                                  Text('Asignando almacén...'),
                                ],
                              ),
                            ),
                          );

                          try {
                            await RoleService.assignWarehouse(w);
                            if (context.mounted) {
                              Navigator.of(context).pop(); // Cerrar loading
                            }
                          } catch (e) {
                            if (context.mounted) {
                              Navigator.of(context).pop(); // Cerrar loading
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content:
                                        Text('Error al asignar almacén: $e')),
                              );
                            }
                            return;
                          }
                        }

                        if (!context.mounted) return;

                        // GESTIÓN DE SESIÓN DE INVENTARIO
                        final syncService = context.read<SyncService>();
                        String? sessionId;
                        String? sessionName;
                        bool isNewSession = false;

                        try {
                          // Mostrar loading mientras buscamos sesiones
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (ctx) => const Center(
                                child: CircularProgressIndicator()),
                          );

                          final activeSessions =
                              await syncService.getActiveSessions(w);

                          if (context.mounted) {
                            Navigator.pop(context); // Cerrar loading
                          }

                          if (!context.mounted) return;

                          if (activeSessions.isNotEmpty) {
                            final result = await showDialog<
                                    Map<String, dynamic>>(
                                context: context,
                                barrierDismissible: false,
                                builder: (ctx) => SimpleDialog(
                                      title:
                                          const Text('Seleccionar Inventario'),
                                      children: [
                                        SimpleDialogOption(
                                          onPressed: () {
                                            Navigator.pop(
                                                ctx, {'action': 'new'});
                                          },
                                          child: const Padding(
                                            padding: EdgeInsets.all(8.0),
                                            child: Row(children: [
                                              Icon(Icons.add),
                                              SizedBox(width: 8),
                                              Text('Nuevo Inventario')
                                            ]),
                                          ),
                                        ),
                                        const Divider(),
                                        ...activeSessions.map((s) =>
                                            SimpleDialogOption(
                                              onPressed: () {
                                                Navigator.pop(ctx, {
                                                  'action': 'select',
                                                  'session': s
                                                });
                                              },
                                              child: Padding(
                                                padding:
                                                    const EdgeInsets.all(8.0),
                                                child: Text(
                                                    s['name'] ?? 'Sin nombre'),
                                              ),
                                            )),
                                      ],
                                    ));

                            if (result == null) return;

                            if (result['action'] == 'select') {
                              sessionId = result['session']['id'];
                              sessionName = result['session']['name'];
                              isNewSession = false;
                            } else {
                              final name = await _promptSessionName(context);
                              if (name == null) return;
                              try {
                                sessionId =
                                    await syncService.createSession(name, w);
                                sessionName = name;
                                isNewSession = true;
                              } catch (e) {
                                if (!context.mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString())),
                                );
                                return;
                              }
                            }
                          } else {
                            // No hay sesiones activas
                            bool create = await showDialog(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                            title:
                                                const Text('Nuevo Inventario'),
                                            content: const Text(
                                                'No hay inventarios activos. ¿Deseas iniciar uno nuevo?'),
                                            actions: [
                                              TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(ctx, false),
                                                  child:
                                                      const Text('Cancelar')),
                                              TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(ctx, true),
                                                  child: const Text('Iniciar')),
                                            ])) ??
                                false;

                            if (!create) return;

                            final name = await _promptSessionName(context);
                            if (name == null) return;
                            try {
                              sessionId =
                                  await syncService.createSession(name, w);
                              sessionName = name;
                              isNewSession = true;
                            } catch (e) {
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.toString())),
                              );
                              return;
                            }
                          }
                        } catch (e) {
                          // Si falla, intentamos usar sesión guardada (offline)
                          final prefs = await SharedPreferences.getInstance();
                          sessionId = prefs.getString('current_session_id');
                          sessionName = prefs.getString('current_session_name');
                          isNewSession =
                              false; // Asumimos false en offline por seguridad

                          if (sessionId == null) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Modo Offline: No se podrá sincronizar hasta conectar y seleccionar sesión.')),
                              );
                            }
                          }
                        }

                        if (sessionId != null) {
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString(
                              'current_session_id', sessionId);
                          await prefs.setString('current_session_name',
                              sessionName ?? 'Inventario');
                        }

                        if (!context.mounted) return;

                        // Mostrar indicador de carga (Descarga de inventario)
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
                          await context.read<SyncService>().downloadInventory(w,
                              sessionId: sessionId,
                              clearExistingCounts: isNewSession);

                          if (!context.mounted) {
                            return;
                          }
                          Navigator.of(context).pop(); // Cerrar diálogo

                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => HomePage(initialWarehouseId: w),
                            ),
                          );
                        } catch (e) {
                          if (!context.mounted) {
                            return;
                          }
                          Navigator.of(context).pop(); // Cerrar diálogo

                          // Verificar si tenemos datos locales
                          final hasLocalData = await context
                              .read<LocalDatabase>()
                              .hasInventoryFor(w);

                          if (hasLocalData) {
                            if (!context.mounted) {
                              return;
                            }
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
                            if (!context.mounted) {
                              return;
                            }
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

  Future<String?> _promptSessionName(BuildContext context) async {
    final weekNum =
        (DateTime.now().difference(DateTime(DateTime.now().year, 1, 1)).inDays /
                7)
            .ceil();
    final defaultName = 'Semana ${weekNum.toInt()} ${DateTime.now().year}';
    final controller = TextEditingController(text: defaultName);

    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Nombre del Inventario'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Nombre',
            hintText: 'Ej. Inventario Enero',
          ),
          autofocus: true,
          textCapitalization: TextCapitalization.sentences,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }
}
