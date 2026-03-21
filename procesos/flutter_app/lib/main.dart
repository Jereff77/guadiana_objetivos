import 'package:flutter/material.dart';
import 'core/supabase/supabase_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseManager.initialize();
  runApp(const GuadianaApp());
}

class GuadianaApp extends StatelessWidget {
  const GuadianaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Guadiana Checklists',
      theme: ThemeData(
        primaryColor: const Color(0xFF004B8D),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF004B8D),
          primary: const Color(0xFF004B8D),
          secondary: const Color(0xFFFF8F1C),
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Guadiana Checklists Flutter App'),
        ),
      ),
    );
  }
}
