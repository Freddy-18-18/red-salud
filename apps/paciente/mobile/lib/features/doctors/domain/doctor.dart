/// Doctor as exposed by the Red Salud gateway `/api/v1/doctors/search`.
class Doctor {
  final String id;
  final String? slug;
  final String? specialtyId;
  final num? consultationFee;
  final num? consultationPrice;
  final num? averageRating;
  final int totalReviews;
  final bool acceptsInsurance;
  final bool acceptsNewPatients;
  final bool acceptsTelemedicine;
  final bool verified;
  final int? yearsExperience;
  final String? biography;
  final List<String> languages;
  final DoctorProfile profile;
  final DoctorSpecialty specialty;

  const Doctor({
    required this.id,
    this.slug,
    this.specialtyId,
    this.consultationFee,
    this.consultationPrice,
    this.averageRating,
    this.totalReviews = 0,
    this.acceptsInsurance = false,
    this.acceptsNewPatients = false,
    this.acceptsTelemedicine = false,
    this.verified = false,
    this.yearsExperience,
    this.biography,
    this.languages = const [],
    required this.profile,
    required this.specialty,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id']?.toString() ?? '',
      slug: json['slug'] as String?,
      specialtyId: json['specialty_id'] as String?,
      consultationFee: json['consultation_fee'] as num?,
      consultationPrice: json['consultation_price'] as num?,
      averageRating: json['average_rating'] as num?,
      totalReviews: (json['total_reviews'] as num?)?.toInt() ?? 0,
      acceptsInsurance: json['accepts_insurance'] == true,
      acceptsNewPatients: json['accepts_new_patients'] == true,
      acceptsTelemedicine: json['accepts_telemedicine'] == true,
      verified: json['verified'] == true,
      yearsExperience: (json['years_experience'] as num?)?.toInt(),
      biography: json['biography'] as String?,
      languages: (json['languages'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      profile: DoctorProfile.fromJson(json['profile'] as Map<String, dynamic>? ?? const {}),
      specialty: DoctorSpecialty.fromJson(json['specialty'] as Map<String, dynamic>? ?? const {}),
    );
  }

  /// Display fee in USD (the BCV rate is converted at the UI layer if needed).
  num? get fee => consultationFee ?? consultationPrice;

  /// Patient-resolvable id used as the route param. Falls back to the doctor
  /// row id when the underlying profile is missing.
  String get routeId => profile.id ?? id;
}

class DoctorProfile {
  final String? id;
  final String? fullName;
  final String? avatarUrl;
  final String? city;
  final String? state;

  const DoctorProfile({this.id, this.fullName, this.avatarUrl, this.city, this.state});

  factory DoctorProfile.fromJson(Map<String, dynamic> json) {
    return DoctorProfile(
      id: json['id'] as String?,
      fullName: json['full_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
    );
  }
}

class DoctorSpecialty {
  final String id;
  final String name;
  final String? slug;
  final String? icon;

  const DoctorSpecialty({this.id = '', this.name = '', this.slug, this.icon});

  factory DoctorSpecialty.fromJson(Map<String, dynamic> json) {
    return DoctorSpecialty(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug'] as String?,
      icon: json['icon'] as String?,
    );
  }
}

class DoctorSearchResult {
  final List<Doctor> doctors;
  final int page;
  final int pageSize;
  final int total;
  final int totalPages;

  const DoctorSearchResult({
    required this.doctors,
    required this.page,
    required this.pageSize,
    required this.total,
    required this.totalPages,
  });

  factory DoctorSearchResult.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as List?) ?? const [];
    final pag = (json['pagination'] as Map<String, dynamic>?) ?? const {};
    return DoctorSearchResult(
      doctors: data.map((e) => Doctor.fromJson(e as Map<String, dynamic>)).toList(),
      page: (pag['page'] as num?)?.toInt() ?? 1,
      pageSize: (pag['pageSize'] as num?)?.toInt() ?? 20,
      total: (pag['total'] as num?)?.toInt() ?? 0,
      totalPages: (pag['totalPages'] as num?)?.toInt() ?? 0,
    );
  }
}

class DoctorSearchFilters {
  final String? specialtyId;
  final bool? acceptsInsurance;
  final num? minRating;
  final int page;
  final int pageSize;

  const DoctorSearchFilters({
    this.specialtyId,
    this.acceptsInsurance,
    this.minRating,
    this.page = 1,
    this.pageSize = 20,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page,
      'page_size': pageSize,
    };
    if (specialtyId != null) params['specialty_id'] = specialtyId;
    if (acceptsInsurance == true) params['accepts_insurance'] = 'true';
    if (minRating != null) params['min_rating'] = minRating;
    return params;
  }
}
