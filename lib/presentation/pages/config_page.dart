import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/config/supabase_config.dart';
import '../../app.dart';

class ConfigPage extends StatefulWidget {
  const ConfigPage({super.key, this.error});

  final String? error;

  @override
  State<ConfigPage> createState() => _ConfigPageState();
}

class _ConfigPageState extends State<ConfigPage> {
  final _urlController = TextEditingController();
  final _keyController = TextEditingController();
  bool _loading = false;
  String? _localError;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
    _localError = widget.error;
  }

  Future<void> _loadSavedCredentials() async {
    final saved = await SupabaseConfig.loadSavedCredentials();
    if (saved['url'] != null) {
      _urlController.text = saved['url']!;
    }
    if (saved['key'] != null) {
      _keyController.text = saved['key']!;
    }
  }

  Future<void> _saveAndInitialize() async {
    setState(() {
      _loading = true;
      _localError = null;
    });

    try {
      final url = _urlController.text.trim();
      final key = _keyController.text.trim();

      if (url.isEmpty || key.isEmpty) {
        throw Exception('Por favor, completa todos los campos');
      }

      // Validar formato básico de URL
      if (!url.startsWith('https://')) {
        throw Exception('La URL debe comenzar con https://');
      }

      // Guardar credenciales
      await SupabaseConfig.saveCredentials(url, key);

      // Inicializar Supabase con las nuevas credenciales
      await SupabaseConfig.initialize(url: url, anonKey: key);

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => const GuadianaApp(),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _localError = e.toString();
      });
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
        title: const Text('Configuración de Supabase'),
        backgroundColor: const Color(0xFF004A93),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Image.asset('assets/images/guadiana.png'),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Título
            const Text(
              'Configuración Requerida',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF004A93),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Subtítulo
            const Text(
              'Ingresa tus credenciales de Supabase',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Formulario
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    TextField(
                      controller: _urlController,
                      decoration: const InputDecoration(
                        labelText: 'URL de Supabase',
                        hintText: 'https://tu-proyecto.supabase.co',
                        prefixIcon: Icon(Icons.link),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.url,
                    ),
                    
                    const SizedBox(height: 20),
                    
                    TextField(
                      controller: _keyController,
                      decoration: const InputDecoration(
                        labelText: 'Clave Anónima',
                        hintText: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        prefixIcon: Icon(Icons.key),
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                      maxLines: 3,
                    ),
                    
                    if (_localError != null) ...[
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red[200]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _localError!,
                                style: const TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 30),
                    
                    // Botón de guardar
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _saveAndInitialize,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF004A93),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                        ),
                        child: _loading
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text('Guardando...'),
                                ],
                              )
                            : const Text(
                                'Guardar y Continuar',
                                style: TextStyle(fontSize: 16),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Instrucciones
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '📋 Instrucciones:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text('1. Ve a tu proyecto de Supabase'),
                  const Text('2. Copia la URL del proyecto'),
                  const Text('3. Ve a Settings > API'),
                  const Text('4. Copia la "anon public key"'),
                  const Text('5. Pega ambos datos en los campos above'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}