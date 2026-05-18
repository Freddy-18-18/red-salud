class Prescription {
  final String id;
  final String? doctorId;
  final DateTime? prescribedAt;
  final DateTime? expiresAt;
  final String? diagnosis;
  final String? generalInstructions;
  final String status;
  final List<PrescriptionMedication> medications;
  final String? doctorName;

  const Prescription({
    required this.id,
    required this.status,
    this.doctorId,
    this.prescribedAt,
    this.expiresAt,
    this.diagnosis,
    this.generalInstructions,
    this.medications = const [],
    this.doctorName,
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    final meds = (json['medications'] as List?) ?? const [];
    final doctorJson = json['doctor'] as Map<String, dynamic>?;
    final profile = doctorJson?['profile'] as Map<String, dynamic>?;
    return Prescription(
      id: json['id']?.toString() ?? '',
      doctorId: json['doctor_id'] as String?,
      prescribedAt: json['prescribed_at'] != null ? DateTime.tryParse(json['prescribed_at'] as String) : null,
      expiresAt: json['expires_at'] != null ? DateTime.tryParse(json['expires_at'] as String) : null,
      diagnosis: json['diagnosis'] as String?,
      generalInstructions: json['general_instructions'] as String?,
      status: json['status']?.toString() ?? 'active',
      medications: meds.map((m) => PrescriptionMedication.fromJson(m as Map<String, dynamic>)).toList(),
      doctorName: profile?['full_name'] as String?,
    );
  }

  bool get isActive => status == 'active' || status == 'partial';
  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
}

class PrescriptionMedication {
  final String id;
  final String name;
  final String? dose;
  final String? frequency;
  final String? route;
  final int? durationDays;
  final String? totalQuantity;
  final String? specialInstructions;

  const PrescriptionMedication({
    required this.id,
    required this.name,
    this.dose,
    this.frequency,
    this.route,
    this.durationDays,
    this.totalQuantity,
    this.specialInstructions,
  });

  factory PrescriptionMedication.fromJson(Map<String, dynamic> json) {
    return PrescriptionMedication(
      id: json['id']?.toString() ?? '',
      name: json['medication_name']?.toString() ?? 'Medicamento',
      dose: json['dosis'] as String?,
      frequency: json['frecuencia'] as String?,
      route: json['via_administracion'] as String?,
      durationDays: (json['duration_days'] as num?)?.toInt(),
      totalQuantity: json['total_quantity'] as String?,
      specialInstructions: json['special_instructions'] as String?,
    );
  }
}
