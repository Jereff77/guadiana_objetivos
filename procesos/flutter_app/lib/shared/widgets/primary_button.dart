import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
  });

  final String text;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveBackground =
        backgroundColor ?? theme.elevatedButtonTheme.style?.backgroundColor
            ?.resolve({}) ??
        theme.colorScheme.primary;
    final effectiveForeground =
        foregroundColor ?? theme.elevatedButtonTheme.style?.foregroundColor
            ?.resolve({}) ??
        theme.colorScheme.onPrimary;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: effectiveBackground,
          foregroundColor: effectiveForeground,
        ),
        child: Text(text),
      ),
    );
  }
}
