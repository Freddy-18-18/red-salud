class Appointment {
  final String id;
  final String doctorId;
  final String? patientId;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String reason;
  final String? notes;
  final String status;
  final String? appointmentType;
  final num? price;
  final String? locationId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Appointment({
    required this.id,
    required this.doctorId,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.reason,
    required this.status,
    this.patientId,
    this.notes,
    this.appointmentType,
    this.price,
    this.locationId,
    this.createdAt,
    this.updatedAt,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id']?.toString() ?? '',
      doctorId: json['doctor_id']?.toString() ?? '',
      patientId: json['patient_id'] as String?,
      scheduledAt: DateTime.parse(json['scheduled_at'] as String),
      durationMinutes: (json['duration_minutes'] as num?)?.toInt() ?? 30,
      reason: json['reason']?.toString() ?? '',
      notes: json['notes'] as String?,
      status: json['status']?.toString() ?? 'pending',
      appointmentType: json['appointment_type'] as String?,
      price: json['price'] as num?,
      locationId: json['location_id'] as String?,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
      updatedAt: json['updated_at'] != null ? DateTime.tryParse(json['updated_at'] as String) : null,
    );
  }

  bool get isUpcoming =>
      scheduledAt.isAfter(DateTime.now()) &&
      status != 'cancelled' &&
      status != 'completed';
}

class CreateAppointmentInput {
  final String doctorId;
  final DateTime scheduledAt;
  final int? durationMinutes;
  final String reason;
  final String? notes;
  final String? appointmentType;
  final String? locationId;
  final num? price;

  const CreateAppointmentInput({
    required this.doctorId,
    required this.scheduledAt,
    required this.reason,
    this.durationMinutes,
    this.notes,
    this.appointmentType,
    this.locationId,
    this.price,
  });

  Map<String, dynamic> toJson() {
    return {
      'doctor_id': doctorId,
      'scheduled_at': scheduledAt.toUtc().toIso8601String(),
      'reason': reason,
      if (durationMinutes != null) 'duration_minutes': durationMinutes,
      if (notes != null) 'notes': notes,
      if (appointmentType != null) 'appointment_type': appointmentType,
      if (locationId != null) 'location_id': locationId,
      if (price != null) 'price': price,
    };
  }
}
