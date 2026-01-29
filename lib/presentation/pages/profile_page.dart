import 'package:flutter/material.dart';
import '../../core/config/supabase_config.dart';
import '../../services/role_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _user = SupabaseConfig.client.auth.currentUser;
  bool _loading = true;
  String _role = 'Cargando...';

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    final role = await RoleService.getRole();
    if (mounted) {
      setState(() {
        _role = role == UserRole.auditor ? 'Auditor' : 'Almacenista';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil de Usuario'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Color(0xFF004A93),
              child: Icon(Icons.person, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 24),
            _buildInfoTile('Correo Electrónico', _user?.email ?? 'No disponible'),
            const Divider(),
            _buildInfoTile('ID de Usuario', _user?.id ?? 'No disponible'),
            const Divider(),
            _buildInfoTile('Rol', _loading ? 'Cargando...' : _role),
            const Divider(),
            const SizedBox(height: 24),
            if (!_loading && _role == 'Almacenista')
              const Card(
                color: Colors.orangeAccent,
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    'Como Almacenista, solo tienes acceso a tus almacenes asignados.',
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String title, String value) {
    return ListTile(
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          color: Colors.grey,
        ),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
