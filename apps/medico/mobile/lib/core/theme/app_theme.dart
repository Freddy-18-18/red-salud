import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData light(Color seedColor) => ThemeData(
    colorSchemeSeed: seedColor,
    useMaterial3: true,
    brightness: Brightness.light,
  );

  static ThemeData dark(Color seedColor) => ThemeData(
    colorSchemeSeed: seedColor,
    useMaterial3: true,
    brightness: Brightness.dark,
  );
}
