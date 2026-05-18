class LabOrder {
  final String id;
  final String? orderNumber;
  final DateTime? orderedAt;
  final DateTime? estimatedDeliveryAt;
  final String? presumptiveDiagnosis;
  final String? clinicalIndications;
  final String status;
  final String? priority;
  final bool requiresFasting;
  final String? patientInstructions;
  final List<LabResult> results;

  const LabOrder({
    required this.id,
    required this.status,
    this.orderNumber,
    this.orderedAt,
    this.estimatedDeliveryAt,
    this.presumptiveDiagnosis,
    this.clinicalIndications,
    this.priority,
    this.requiresFasting = false,
    this.patientInstructions,
    this.results = const [],
  });

  factory LabOrder.fromJson(Map<String, dynamic> json) {
    final results = (json['results'] as List?) ?? const [];
    return LabOrder(
      id: json['id']?.toString() ?? '',
      orderNumber: json['order_number'] as String?,
      orderedAt: json['ordered_at'] != null ? DateTime.tryParse(json['ordered_at'] as String) : null,
      estimatedDeliveryAt: json['estimated_delivery_at'] != null
          ? DateTime.tryParse(json['estimated_delivery_at'] as String)
          : null,
      presumptiveDiagnosis: json['presumptive_diagnosis'] as String?,
      clinicalIndications: json['indicaciones_clinicas'] as String?,
      status: json['status']?.toString() ?? 'pending',
      priority: json['prioridad'] as String?,
      requiresFasting: json['requiere_ayuno'] == true,
      patientInstructions: json['patient_instructions'] as String?,
      results: results.map((r) => LabResult.fromJson(r as Map<String, dynamic>)).toList(),
    );
  }

  bool get hasResults => results.isNotEmpty;
}

class LabResult {
  final String id;
  final DateTime? resultAt;
  final String? pdfUrl;
  final String? generalObservations;
  final List<LabResultValue> values;

  const LabResult({
    required this.id,
    this.resultAt,
    this.pdfUrl,
    this.generalObservations,
    this.values = const [],
  });

  factory LabResult.fromJson(Map<String, dynamic> json) {
    final values = (json['values'] as List?) ?? const [];
    return LabResult(
      id: json['id']?.toString() ?? '',
      resultAt: json['result_at'] != null ? DateTime.tryParse(json['result_at'] as String) : null,
      pdfUrl: json['result_pdf_url'] as String?,
      generalObservations: json['general_observations'] as String?,
      values: values.map((v) => LabResultValue.fromJson(v as Map<String, dynamic>)).toList(),
    );
  }
}

class LabResultValue {
  final String parameter;
  final String? value;
  final String? unit;
  final String? referenceRange;
  final bool isAbnormal;
  final String? alertLevel;

  const LabResultValue({
    required this.parameter,
    this.value,
    this.unit,
    this.referenceRange,
    this.isAbnormal = false,
    this.alertLevel,
  });

  factory LabResultValue.fromJson(Map<String, dynamic> json) {
    return LabResultValue(
      parameter: json['parametro']?.toString() ?? '',
      value: json['valor'] as String?,
      unit: json['unidad'] as String?,
      referenceRange: json['rango_referencia'] as String?,
      isAbnormal: json['es_anormal'] == true,
      alertLevel: json['nivel_alerta'] as String?,
    );
  }
}
