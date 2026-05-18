import 'package:flutter/material.dart';

/// Healthcare palette for Red Salud — Patient app.
///
/// Primary teal/emerald conveys the universal healthcare hue;
/// secondary blue carries trust/clinical accents;
/// success/warning/error use the standard semantic palette.
class AppColors {
  AppColors._();

  // Brand
  static const teal500 = Color(0xFF14B8A6);
  static const teal600 = Color(0xFF0D9488);
  static const teal700 = Color(0xFF0F766E);
  static const teal400 = Color(0xFF2DD4BF);
  static const teal50 = Color(0xFFF0FDFA);

  static const blue600 = Color(0xFF2563EB);
  static const blue500 = Color(0xFF3B82F6);
  static const blue400 = Color(0xFF60A5FA);
  static const blue50 = Color(0xFFEFF6FF);

  // Semantic
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);

  // Neutrals — light surfaces
  static const surfaceLight = Color(0xFFF9FAFB);
  static const surfaceDimLight = Color(0xFFF3F4F6);
  static const onSurfaceLight = Color(0xFF111827);
  static const outlineLight = Color(0xFFE5E7EB);

  // Neutrals — dark surfaces
  static const surfaceDark = Color(0xFF0F172A);
  static const surfaceDimDark = Color(0xFF1E293B);
  static const onSurfaceDark = Color(0xFFF1F5F9);
  static const outlineDark = Color(0xFF334155);
}
