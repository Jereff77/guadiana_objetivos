import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../core/config/supabase_config.dart';
import '../../services/auth_service.dart';
import '../../services/sync_service.dart';
import '../pages/login_page.dart';
import '../pages/profile_page.dart';
import '../pages/warehouse_select_page.dart';

class AppDrawer extends StatefulWidget {
  final VoidCallback? onSessionClosed;
  final String? warehouseId;

  const AppDrawer({super.key, this.onSessionClosed, this.warehouseId});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  final AuthService _auth = AuthService();
  final SupabaseClient _client = SupabaseConfig.client;
  String? _currentSessionName;
  String? _currentSessionId;
  List<Map<String, dynamic>> _activeSessions = [];
  bool _loadingSessions = false;

  @override
  void initState() {
    super.initState();
    _loadSessionInfo();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadActiveSessions();
    });
  }

  Future<void> _loadActiveSessions() async {
    if (widget.warehouseId == null) return;
    if (!mounted) return;

    setState(() {
      _loadingSessions = true;
    });

    try {
      final sessions = await context
          .read<SyncService>()
          .getActiveSessions(widget.warehouseId!);
      if (mounted) {
        setState(() {
          _activeSessions = sessions;
          _loadingSessions = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading active sessions: $e');
      if (mounted) {
        setState(() {
          _loadingSessions = false;
        });
      }
    }
  }

  Future<void> _loadSessionInfo() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _currentSessionName = prefs.getString('current_session_name');
        _currentSessionId = prefs.getString('current_session_id');
      });
    }
  }

  Future<void> _logout() async {
    await _auth.signOut();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
  }

  Future<void> _closeInventory() async {
    if (_currentSessionId == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Finalizar Inventario'),
        content: const Text(
            '¿Estás seguro de que deseas finalizar este inventario?\n\n'
            'La sesión se cerrará y no podrás agregar más conteos a ella.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Finalizar'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      await context.read<SyncService>().closeSession(_currentSessionId!);

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('current_session_id');
      await prefs.remove('current_session_name');

      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      Navigator.pop(context); // Cerrar drawer

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inventario finalizado correctamente')),
      );

      // Notificar al padre (HomePage) para que actualice el estado
      widget.onSessionClosed?.call();

      // YA NO redirigimos a WarehouseSelectPage
      // Navigator.of(context).pushReplacement(
      //   MaterialPageRoute(builder: (_) => const WarehouseSelectPage()),
      // );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al finalizar: $e')),
      );
    }
  }

  Future<void> _startNewInventory() async {
    if (widget.warehouseId == null) return;

    // 1. Pedir nombre
    final weekNum =
        (DateTime.now().difference(DateTime(DateTime.now().year, 1, 1)).inDays /
                7)
            .ceil();
    final defaultName = 'Semana ${weekNum.toInt()} ${DateTime.now().year}';
    final controller = TextEditingController(text: defaultName);

    final name = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Nuevo Inventario'),
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

    if (name == null || name.isEmpty || !mounted) return;

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      final syncService = context.read<SyncService>();
      final sessionId =
          await syncService.createSession(name, widget.warehouseId!);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_session_id', sessionId);
      await prefs.setString('current_session_name', name);

      // Descargar inventario actualizado para la nueva sesión
      await syncService.downloadInventory(
        widget.warehouseId!,
        sessionId: sessionId,
        clearExistingCounts: true, // Limpiar conteos anteriores
      );

      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      Navigator.pop(context); // Cerrar drawer

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inventario iniciado correctamente')),
      );

      // Actualizar estado en HomePage
      widget.onSessionClosed?.call();

      // Recargar la lista de sesiones activas
      await _loadActiveSessions();
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al iniciar: $e')),
      );
    }
  }

  Future<void> _resumeSession(Map<String, dynamic> session) async {
    final sessionId = session['id'] as String;
    final sessionName = session['name'] as String;

    if (_currentSessionId == sessionId) {
      Navigator.pop(context); // Solo cerrar drawer si ya es la actual
      return;
    }

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_session_id', sessionId);
      await prefs.setString('current_session_name', sessionName);

      // Descargar inventario para esta sesión
      // Usamos clearExistingCounts: true para asegurar que cargamos el estado limpio de esa sesión
      if (!mounted) return;
      await context.read<SyncService>().downloadInventory(
            widget.warehouseId!,
            sessionId: sessionId,
            clearExistingCounts: true,
          );

      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      Navigator.pop(context); // Cerrar drawer

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Continuando inventario: $sessionName')),
      );

      // Notificar al padre (HomePage) para que actualice el estado
      widget.onSessionClosed?.call();
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cambiar de inventario: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              color: Color(0xFF004A93),
            ),
            accountName: const Text('Guadiana App'),
            accountEmail: Text(_client.auth.currentUser?.email ?? ''),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Image.asset('assets/images/guadiana.png'),
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_currentSessionName != null) ...[
                    const Text(
                      'Inventario Activo:',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    Text(
                      _currentSessionName!,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                  ],
                  ListTile(
                    leading: const Icon(Icons.store),
                    title: const Text('Cambiar Almacén'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                            builder: (_) => const WarehouseSelectPage()),
                      );
                    },
                  ),
                  if (_currentSessionId != null)
                    ListTile(
                      leading: const Icon(Icons.check_circle_outline),
                      title: const Text('Finalizar Inventario'),
                      onTap: _closeInventory,
                    ),
                  if (_currentSessionId == null && widget.warehouseId != null)
                    ListTile(
                      leading: const Icon(Icons.add_circle_outline),
                      title: const Text('Iniciar Nuevo Inventario'),
                      onTap: _startNewInventory,
                    ),
                  if (_activeSessions.isNotEmpty &&
                      widget.warehouseId != null) ...[
                    const Divider(),
                    const Padding(
                      padding: EdgeInsets.only(left: 16, top: 8, bottom: 8),
                      child: Text(
                        'Inventarios Abiertos',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                    if (_loadingSessions)
                      const Center(child: CircularProgressIndicator())
                    else
                      ..._activeSessions.map((session) {
                        final isCurrent = session['id'] == _currentSessionId;
                        final date =
                            DateTime.parse(session['created_at']).toLocal();
                        final dateStr = DateFormat('dd/MM HH:mm').format(date);

                        return ListTile(
                          leading: Icon(
                            Icons.inventory,
                            color: isCurrent ? Colors.green : Colors.grey,
                          ),
                          title: Text(
                            session['name'] ?? 'Sin nombre',
                            style: isCurrent
                                ? const TextStyle(fontWeight: FontWeight.bold)
                                : null,
                          ),
                          subtitle: Text(dateStr),
                          trailing: isCurrent
                              ? const Icon(Icons.check, color: Colors.green)
                              : const Icon(Icons.chevron_right),
                          onTap: () => _resumeSession(session),
                        );
                      }),
                  ],
                ],
              ),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Mi Perfil'),
            onTap: () {
              Navigator.pop(context); // Cerrar drawer
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfilePage()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Cerrar Sesión',
                style: TextStyle(color: Colors.red)),
            onTap: _logout,
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
