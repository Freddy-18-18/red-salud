export interface PlatformStats {
  doctorCount: number;
  specialtyCount: number;
  patientCount: number;
  appointmentCount: number;
  avgRating: number;
}

export interface PublicSpecialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null; // lucide-react icon name
  doctorCount: number;
}

export interface PublicDoctor {
  id: string;
  slug: string;
  consultationFee: number | null;
  acceptsInsurance: boolean;
  yearsExperience: number | null;
  biography: string | null;
  verified: boolean;
  profile: {
    name: string;
    avatarUrl: string | null;
    city: string | null;
    state: string | null;
    gender: string | null;
  };
  specialty: {
    id: string;
    name: string;
    slug: string;
  };
  avgRating: number | null;
  reviewCount: number;
}

export interface PublicDoctorDetail extends PublicDoctor {
  reviews: PublicReview[];
  schedule: DoctorSchedule;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO 8601
  reviewerName: string;
  isAnonymous: boolean;
}

export interface DoctorSchedule {
  [day: string]: {
    enabled: boolean;
    slots: Array<{ start: string; end: string }>;
  };
}

export interface DoctorLocation {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address: string | null;
}

export interface MapDoctorPoint {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  lat: number;
  lng: number;
  rating: number | null;
  avatarUrl: string | null;
  city: string;
  state: string;
}

export interface StateMapData {
  stateId: string;
  stateName: string;
  doctorCount: number;
}

export interface SearchFilters {
  q?: string;
  specialtySlug?: string;
  state?: string;
  city?: string;
  acceptsInsurance?: boolean;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number; // default: 12, max: 50
}

export interface SearchResults {
  doctors: PublicDoctor[];
  total: number;
  page: number;
  totalPages: number;
}
