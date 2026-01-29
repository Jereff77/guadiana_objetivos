import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
  bool _initialized = false;
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
        _initialized = true;
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
            child: Text('Error al inicializar: $_initError'),
          ),
        ),
      );
    }

    if (!_initialized) {
      return MaterialApp(
        theme: theme,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    final session = SupabaseConfig.client.auth.currentSession;

    return MultiProvider(
      providers: [
        Provider<LocalDatabase>.value(value: _database),
        Provider<SyncService>.value(value: _syncService),
      ],
      child: MaterialApp(
        theme: theme,
        home: session != null ? const HomePage() : const LoginPage(),
      ),
    );
  }
}
