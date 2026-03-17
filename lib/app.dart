import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/supabase_config.dart';
import 'data/datasources/local/database.dart';
import 'services/sync_service.dart';
import 'presentation/pages/login_page.dart';
import 'presentation/pages/home_page.dart';

class GuadianaApp extends StatefulWidget {
  const GuadianaApp({super.key});

  @override
  State<GuadianaApp> createState() => _GuadianaAppState();
}

class _GuadianaAppState extends State<GuadianaApp> {
  Object? _initError;
  late final LocalDatabase _database;
  late final SyncService _syncService;

  @override
  void initState() {
    super.initState();
    _database = LocalDatabase();
    _syncService = SyncService(_database);
    _initialize();
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  Future<void> _initialize() async {
    try {
      await SupabaseConfig.initialize();
      setState(() {
        // Inicialización exitosa
      });
    } catch (e) {
      setState(() {
        _initError = e;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF004A93),
        brightness: Brightness.light,
        primary: const Color(0xFF004A93),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF004A93),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: const Color(0xFF004A93),
        ),
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );

    if (_initError != null) {
      return MaterialApp(
        theme: theme,
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text(
                    'Error de Configuración',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(_initError.toString()),
                  const SizedBox(height: 16),
                  const Text(
                    'Por favor, configura las credenciales de Supabase',
                    style: TextStyle(fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // Reiniciar la aplicación para que intente configurar de nuevo
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) => const GuadianaApp(),
                        ),
                      );
                    },
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return MultiProvider(
      providers: [
        Provider<LocalDatabase>.value(value: _database),
        Provider<SyncService>.value(value: _syncService),
      ],
      child: MaterialApp(
        theme: theme,
        home: StreamBuilder<AuthState>(
          stream: SupabaseConfig.client.auth.onAuthStateChange,
          builder: (context, snapshot) {
            final session = SupabaseConfig.client.auth.currentSession;
            if (session != null) {
              return const HomePage();
            }
            return const LoginPage();
          },
        ),
      ),
    );
  }
}
