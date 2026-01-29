import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../../services/role_service.dart';
import 'inventory_report_page.dart';

class InventoryHistoryPage extends StatefulWidget {
  final String? warehouseId;
  const InventoryHistoryPage({super.key, this.warehouseId});

  @override
  State<InventoryHistoryPage> createState() => _InventoryHistoryPageState();
}

class _InventoryHistoryPageState extends State<InventoryHistoryPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _sessions = [];
  Map<String, Map<String, dynamic>> _userProfiles = {};
  String? _error;
  UserRole? _currentUserRole;

  // Filtros
  String? _selectedUserId;
  String _selectedStatus = 'all'; // all, active, closed
  DateTime? _startDate;
  DateTime? _endDate;

  // Lista de usuarios disponibles para filtrar (basado en el historial)
  List<Map<String, dynamic>> _availableUsers = [];

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadHistory();
  }

  Future<void> _loadUserRole() async {
    final role = await RoleService.getRole();
    if (mounted) {
      setState(() {
        _currentUserRole = role;
      });
    }
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      final role = await RoleService.getRole();

      var query = client.from('inventory_sessions').select();

      // Filtro por almacén seleccionado
      if (widget.warehouseId != null) {
        query = query.eq('warehouse_id', widget.warehouseId!);
      }

      // Filtro por rol (Almacenista solo ve sus propios)
      if (role == UserRole.almacenista && user != null) {
        query = query.eq('created_by', user.id);
      } else {
        // Filtros de UI (Solo para Auditor o quien pueda ver todo)
        if (_selectedUserId != null) {
          query = query.eq('created_by', _selectedUserId!);
        }
      }

      // Filtro de Estatus (aplica para todos los roles)
      if (_selectedStatus != 'all') {
        query = query.eq('status', _selectedStatus);
      }

      // Filtro de Fechas (aplica para todos los roles)
      if (_startDate != null) {
        query = query.gte('created_at', _startDate!.toIso8601String());
      }
      if (_endDate != null) {
        // Ajustamos al final del día
        final end = _endDate!
            .add(const Duration(days: 1))
            .subtract(const Duration(seconds: 1));
        query = query.lte('created_at', end.toIso8601String());
      }

      final response = await query.order('created_at', ascending: false);
      final sessions = List<Map<String, dynamic>>.from(response);

      // Cargar perfiles de usuarios
      final userIds = sessions
          .map((s) => s['created_by'] as String?)
          .where((id) => id != null)
          .toSet()
          .toList();

      if (userIds.isNotEmpty) {
        try {
          final profilesResponse = await client
              .from('app_profiles')
              .select()
              .filter('id', 'in', userIds);

          for (var p in profilesResponse) {
            _userProfiles[p['id']] = p;
          }

          // Actualizar lista de usuarios disponibles para el filtro
          // (Solo si no estamos filtrando por usuario ya, para no perder opciones)
          if (_selectedUserId == null) {
            _availableUsers = List<Map<String, dynamic>>.from(profilesResponse);
          }
        } catch (e) {
          debugPrint('Error loading profiles: $e');
        }
      }

      if (mounted) {
        setState(() {
          _sessions = sessions;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) {
          return AlertDialog(
            title: const Text('Filtrar Historial'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Filtro de Usuario (solo para auditores)
                  if (_currentUserRole == UserRole.auditor && _availableUsers.isNotEmpty) ...[
                    const Text('Usuario:',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    DropdownButton<String>(
                      isExpanded: true,
                      value: _selectedUserId,
                      hint: const Text('Todos los usuarios'),
                      items: [
                        const DropdownMenuItem(
                          value: null,
                          child: Text('Todos los usuarios'),
                        ),
                        ..._availableUsers.map((u) {
                          final name = u['first_name'] != null
                              ? '${u['first_name']} ${u['last_name'] ?? ''}'
                              : (u['email'] ?? u['id']); // Fallback
                          return DropdownMenuItem(
                            value: u['id'] as String,
                            child: Text(name),
                          );
                        }),
                      ],
                      onChanged: (val) {
                        setStateDialog(() => _selectedUserId = val);
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Filtro de Estatus
                  const Text('Estatus:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedStatus,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Todos')),
                      DropdownMenuItem(value: 'active', child: Text('Abierto')),
                      DropdownMenuItem(value: 'closed', child: Text('Cerrado')),
                    ],
                    onChanged: (val) {
                      if (val != null)
                        setStateDialog(() => _selectedStatus = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Filtro de Fechas
                  const Text('Fecha Creación:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _startDate ?? DateTime.now(),
                              firstDate: DateTime(2024),
                              lastDate: DateTime.now(),
                            );
                            if (date != null) {
                              setStateDialog(() => _startDate = date);
                            }
                          },
                          child: Text(_startDate == null
                              ? 'Desde'
                              : DateFormat('dd/MM/yyyy').format(_startDate!)),
                        ),
                      ),
                      const Text('-'),
                      Expanded(
                        child: TextButton(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _endDate ?? DateTime.now(),
                              firstDate: DateTime(2024),
                              lastDate: DateTime.now(),
                            );
                            if (date != null) {
                              setStateDialog(() => _endDate = date);
                            }
                          },
                          child: Text(_endDate == null
                              ? 'Hasta'
                              : DateFormat('dd/MM/yyyy').format(_endDate!)),
                        ),
                      ),
                    ],
                  ),
                  if (_startDate != null || _endDate != null)
                    Center(
                      child: TextButton(
                        onPressed: () {
                          setStateDialog(() {
                            _startDate = null;
                            _endDate = null;
                          });
                        },
                        child: const Text('Limpiar Fechas'),
                      ),
                    ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  // Resetear filtros
                  setState(() {
                    _selectedUserId = null;
                    _selectedStatus = 'all';
                    _startDate = null;
                    _endDate = null;
                  });
                  Navigator.pop(context);
                  _loadHistory();
                },
                child: const Text('Limpiar Todo'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _loadHistory();
                },
                child: const Text('Aplicar'),
              ),
            ],
          );
        },
      ),
    );
  }

  String _getUserName(String? userId) {
    if (userId == null) return 'Desconocido';
    final profile = _userProfiles[userId];
    if (profile != null) {
      if (profile['first_name'] != null) {
        return '${profile['first_name']} ${profile['last_name'] ?? ''}'.trim();
      }
      // Si no tiene nombre, intentamos mostrar email o ID truncado
      return profile['email'] ?? 'Usuario ${userId.substring(0, 4)}';
    }
    return 'Usuario ${userId.substring(0, 4)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de Inventarios'),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.filter_list),
                if (_selectedUserId != null ||
                    _selectedStatus != 'all' ||
                    _startDate != null ||
                    _endDate != null)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _sessions.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('No hay inventarios registrados.'),
                          if (_selectedUserId != null ||
                              _selectedStatus != 'all' ||
                              _startDate != null ||
                              _endDate != null)
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _selectedUserId = null;
                                  _selectedStatus = 'all';
                                  _startDate = null;
                                  _endDate = null;
                                });
                                _loadHistory();
                              },
                              child: const Text('Limpiar filtros'),
                            ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: _sessions.length,
                      itemBuilder: (context, index) {
                        final session = _sessions[index];
                        final date =
                            DateTime.parse(session['created_at']).toLocal();
                        final closedAt = session['closed_at'] != null
                            ? DateTime.parse(session['closed_at']).toLocal()
                            : null;
                        final status = session['status'] ?? 'active';
                        final isClosed = status == 'closed';
                        final warehouseId = session['warehouse_id'];
                        final userId = session['created_by'];

                        return Card(
                          margin: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  isClosed ? Colors.green : Colors.orange,
                              child: Icon(
                                isClosed ? Icons.check : Icons.edit,
                                color: Colors.white,
                              ),
                            ),
                            title: Text(session['name'] ?? 'Sin nombre'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.person,
                                        size: 14, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(
                                      _getUserName(userId),
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text('Almacén: $warehouseId'),
                                Text(
                                    'Creado: ${DateFormat('dd/MM/yyyy HH:mm').format(date)}'),
                                if (isClosed && closedAt != null)
                                  Text(
                                      'Cerrado: ${DateFormat('dd/MM/yyyy HH:mm').format(closedAt)}',
                                      style: const TextStyle(
                                          fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => InventoryReportPage(
                                    sessionId: session['id'],
                                    sessionName:
                                        session['name'] ?? 'Inventario',
                                    warehouseId: warehouseId,
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
    );
  }
}
