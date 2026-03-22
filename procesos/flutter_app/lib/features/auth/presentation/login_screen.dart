import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/primary_button.dart';
import 'auth_notifier.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final notifier = ref.read(authNotifierProvider.notifier);
    await notifier.signIn(
      _emailController.text.trim(),
      _passwordController.text,
    );

    final state = ref.read(authNotifierProvider);

    state.when(
      data: (user) {
        if (user != null) {
          if (mounted) {
            context.go('/home');
          }
        } else {
          _showError('No se pudo iniciar sesión');
        }
      },
      loading: () {},
      error: (error, _) {
        _showError(error.toString());
      },
    );
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Column(
                  children: [
                    Icon(
                      Icons.checklist,
                      size: 40,
                      color: AppColors.brandBlue,
                    ),
                    SizedBox(height: 12),
                    Text(
                      'Guadiana Checklists',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Inicia sesión para continuar',
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Card(
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.stretch,
                            children: [
                              TextFormField(
                                controller: _emailController,
                                decoration: const InputDecoration(
                                  labelText: 'Correo electrónico',
                                ),
                                keyboardType:
                                    TextInputType.emailAddress,
                                validator: (value) {
                                  if (value == null ||
                                      value.trim().isEmpty) {
                                    return 'Ingresa tu correo';
                                  }
                                  if (!value.contains('@')) {
                                    return 'Correo inválido';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _passwordController,
                                decoration: const InputDecoration(
                                  labelText: 'Contraseña',
                                ),
                                obscureText: true,
                                validator: (value) {
                                  if (value == null ||
                                      value.isEmpty) {
                                    return 'Ingresa tu contraseña';
                                  }
                                  if (value.length < 6) {
                                    return 'La contraseña debe tener al menos 6 caracteres';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 24),
                              authState.maybeWhen(
                                loading: () => const Center(
                                  child: CircularProgressIndicator(),
                                ),
                                orElse: () => PrimaryButton(
                                  text: 'Iniciar sesión',
                                  backgroundColor:
                                      AppColors.brandBlue,
                                  foregroundColor: Colors.white,
                                  onPressed: _handleSubmit,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
