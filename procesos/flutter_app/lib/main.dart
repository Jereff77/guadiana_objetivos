import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/constants/app_strings.dart';
import 'core/router/app_router.dart';
import 'core/supabase/supabase_client.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseManager.initialize();
  runApp(
    const ProviderScope(
      child: GuadianaApp(),
    ),
  );
}

class GuadianaApp extends StatelessWidget {
  const GuadianaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, _) {
        final router = ref.watch(appRouterProvider);

        return MaterialApp.router(
          title: AppStrings.appTitle,
          theme: AppTheme.theme,
          routerConfig: router,
        );
      },
    );
  }
}
