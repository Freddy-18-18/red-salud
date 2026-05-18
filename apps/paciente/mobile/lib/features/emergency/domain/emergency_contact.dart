class EmergencyContact {
  final String id;
  final String name;
  final String? phone;
  final String? relationship;
  final bool isPrimary;

  const EmergencyContact({
    required this.id,
    required this.name,
    this.phone,
    this.relationship,
    this.isPrimary = false,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      phone: json['phone'] as String?,
      relationship: json['relationship'] as String?,
      isPrimary: json['is_primary'] == true,
    );
  }

  Map<String, dynamic> toInsert(String patientId) => {
        'patient_id': patientId,
        'name': name,
        'phone': phone,
        'relationship': relationship,
        'is_primary': isPrimary,
      };
}
