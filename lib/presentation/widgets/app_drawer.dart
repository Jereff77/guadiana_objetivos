import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:dropdown_search/dropdown_search.dart';
import '../../core/config/supabase_config.dart';
import '../../data/datasources/local/database.dart';
import '../../services/auth_service.dart';
import '../../services/role_service.dart';
import '../pages/login_page.dart';
import '../pages/profile_page.dart';

class AppDrawer extends StatefulWidget {
  final Function(String) onWarehouseSelected;

  const AppDrawer({super.key, required this.onWarehouseSelected});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  final AuthService _auth = AuthService();
  final SupabaseClient _client = SupabaseConfig.client;

  List<String> _warehouses = [];
  bool _loadingWarehouses = false;
  String? _selectedWarehouse;

  @override
  void initState() {
    super.initState();
    _loadWarehouses();
  }

  Future<void> _loadWarehouses() async {
    if (!mounted) return;
    setState(() => _loadingWarehouses = true);
    try {
      List<String> allWarehouses = [];
      try {
        final res = await _client.rpc('get_unique_warehouses');
        allWarehouses = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toList();
      } catch (_) {
        final res =
            await _client.from('inventario').select('Almacen').order('Almacen');
        allWarehouses = (res as List)
            .map((e) => e['Almacen'] as String?)
            .where((e) => (e ?? '').isNotEmpty)
            .map((e) => e!)
            .toSet()
            .toList();
      }

      // Filtrar por rol
      final accessibleWarehouses =
          await RoleService.getAccessibleWarehouses(allWarehouses);

      if (mounted) setState(() => _warehouses = accessibleWarehouses);
    } catch (e) {
      debugPrint('Error loading warehouses: $e');
      // Intentar cargar almacenes locales (Offline)
      try {
        if (!mounted) return;
        final localWarehouses =
            await context.read<LocalDatabase>().getUniqueWarehouses();
        if (mounted) setState(() => _warehouses = localWarehouses);
      } catch (localError) {
        debugPrint('Error loading local warehouses: $localError');
      }
    } finally {
      if (mounted) setState(() => _loadingWarehouses = false);
    }
  }

  Future<void> _logout() async {
    await _auth.signOut();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
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
                const Text(
                  'Seleccionar Almacén',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                _loadingWarehouses
                    ? const Center(child: CircularProgressIndicator())
                    : DropdownSearch<String>(
                        popupProps: const PopupProps.menu(
                          showSearchBox: true,
                          searchFieldProps: TextFieldProps(
                            decoration: InputDecoration(
                              labelText: "Buscar almacén...",
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        items: _warehouses,
                        dropdownDecoratorProps: const DropDownDecoratorProps(
                          dropdownSearchDecoration: InputDecoration(
                            labelText: "Almacén",
                            hintText: "Selecciona un almacén",
                            border: OutlineInputBorder(),
                          ),
                        ),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _selectedWarehouse = value;
                            });
                            widget.onWarehouseSelected(value);
                            Navigator.pop(context); // Cerrar drawer
                          }
                        },
                        selectedItem: _selectedWarehouse,
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
