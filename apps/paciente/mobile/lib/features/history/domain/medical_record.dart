class MedicalRecord {
  final String id;
  final String? doctorId;
  final String? doctorName;
  final DateTime? createdAt;
  final String? diagnosis;
  final String? symptoms;
  final String? treatment;
  final String? medications;
  final String? requestedExams;
  final String? observations;

  const MedicalRecord({
    required this.id,
    this.doctorId,
    this.doctorName,
    this.createdAt,
    this.diagnosis,
    this.symptoms,
    this.treatment,
    this.medications,
    this.requestedExams,
    this.observations,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    final doctorJson = json['doctor'] as Map<String, dynamic>?;
    final profile = doctorJson?['profile'] as Map<String, dynamic>?;
    return MedicalRecord(
      id: json['id']?.toString() ?? '',
      doctorId: json['doctor_id'] as String?,
      doctorName: profile?['full_name'] as String?,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
      diagnosis: json['diagnosis'] as String?,
      symptoms: json['sintomas'] as String?,
      treatment: json['tratamiento'] as String?,
      medications: json['medicamentos'] as String?,
      requestedExams: json['requested_exams'] as String?,
      observations: json['observations'] as String?,
    );
  }
}
