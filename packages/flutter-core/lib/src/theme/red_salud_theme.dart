import 'package:flutter/material.dart';

class RedSaludTheme {
  // Brand colors
  static const primary = Color(0xFF2563EB);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  static const info = Color(0xFF8B5CF6);

  static ThemeData light({Color? seedColor}) => ThemeData(
        colorSchemeSeed: seedColor ?? primary,
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: 'Inter',
      );

  static ThemeData dark({Color? seedColor}) => ThemeData(
        colorSchemeSeed: seedColor ?? primary,
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: 'Inter',
      );
}
