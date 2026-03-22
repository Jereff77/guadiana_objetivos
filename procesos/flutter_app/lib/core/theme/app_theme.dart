import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get theme {
    return ThemeData(
      primaryColor: AppColors.brandBlue,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.brandBlue,
        primary: AppColors.brandBlue,
        secondary: AppColors.brandBlueDark,
      ),
      scaffoldBackgroundColor: AppColors.backgroundGrey,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.brandBlue,
        foregroundColor: AppColors.white,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.brandBlue,
          foregroundColor: AppColors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.brandBlue,
          ),
        ),
        border: OutlineInputBorder(),
      ),
      useMaterial3: true,
    );
  }
}
