import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/config/supabase_config.dart';
import '../../services/auth_service.dart';
import '../../services/sync_service.dart';
import '../pages/login_page.dart';
import '../pages/profile_page.dart';
import '../pages/warehouse_select_page.dart';

class AppDrawer extends StatefulWidget {
  const AppDrawer({super.key});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  final AuthService _auth = AuthService();
  final SupabaseClient _client = SupabaseConfig.client;
  String? _currentSessionName;
  String? _currentSessionId;

  @override
  void initState() {
    super.initState();
    _loadSessionInfo();
  }

  Future<void> _loadSessionInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentSessionName = prefs.getString('current_session_name');
      _currentSessionId = prefs.getString('current_session_id');
    });
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

      // Redirigir a selección de almacén
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const WarehouseSelectPage()),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Cerrar loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al finalizar: $e')),
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
          Padding(
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
              ],
            ),
          ),
          const Spacer(),
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
