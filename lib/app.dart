import 'package:flutter/material.dart';
import 'core/config/supabase_config.dart';
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
      home: session != null ? const HomePage() : const LoginPage(),
    );
  }
}
