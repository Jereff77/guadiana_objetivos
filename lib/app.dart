import 'package:flutter/material.dart';
import 'core/config/supabase_config.dart';
import 'presentation/pages/login_page.dart';
import 'presentation/pages/warehouse_select_page.dart';

class GuadianaApp extends StatefulWidget {
  const GuadianaApp({super.key});

  @override
  State<GuadianaApp> createState() => _GuadianaAppState();
}

class _GuadianaAppState extends State<GuadianaApp> {
  bool _initialized = false;
  Object? _initError;

  @override
  void initState() {
    super.initState();
    _initialize();
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
        seedColor: Colors.blue,
        brightness: Brightness.light,
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

    return MaterialApp(
      theme: theme,
      home: session != null ? const WarehouseSelectPage() : const LoginPage(),
    );
  }
}
