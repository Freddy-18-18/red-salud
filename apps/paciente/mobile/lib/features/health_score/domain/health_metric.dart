class HealthMetric {
  final String id;
  final String? metricTypeId;
  final num value;
  final num? secondaryValue;
  final DateTime measuredAt;
  final String? notes;
  final String? device;

  const HealthMetric({
    required this.id,
    required this.value,
    required this.measuredAt,
    this.metricTypeId,
    this.secondaryValue,
    this.notes,
    this.device,
  });

  factory HealthMetric.fromJson(Map<String, dynamic> json) {
    return HealthMetric(
      id: json['id']?.toString() ?? '',
      metricTypeId: json['metric_type_id'] as String?,
      value: (json['valor'] as num?) ?? 0,
      secondaryValue: json['valor_secundario'] as num?,
      measuredAt: DateTime.parse(json['measured_at'] as String),
      notes: json['notes'] as String?,
      device: json['dispositivo'] as String?,
    );
  }
}

class HealthGoal {
  final String id;
  final String title;
  final String? description;
  final num targetValue;
  final num? currentProgress;
  final DateTime? targetDate;
  final String status;

  const HealthGoal({
    required this.id,
    required this.title,
    required this.targetValue,
    required this.status,
    this.description,
    this.currentProgress,
    this.targetDate,
  });

  factory HealthGoal.fromJson(Map<String, dynamic> json) {
    return HealthGoal(
      id: json['id']?.toString() ?? '',
      title: json['titulo']?.toString() ?? 'Meta',
      description: json['description'] as String?,
      targetValue: (json['valor_objetivo'] as num?) ?? 0,
      currentProgress: json['progreso_actual'] as num?,
      targetDate: json['target_date'] != null ? DateTime.tryParse(json['target_date'] as String) : null,
      status: json['status']?.toString() ?? 'active',
    );
  }

  double get progressPct {
    if (targetValue == 0) return 0;
    final p = (currentProgress ?? 0) / targetValue;
    return p.clamp(0, 1).toDouble();
  }
}
