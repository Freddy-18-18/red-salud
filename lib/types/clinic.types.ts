/**
 * Tipos TypeScript para el Dashboard de Clínica
 * 
 * Define todas las interfaces y tipos del dominio clínico
 */

export type ClinicStatus = 'active' | 'suspended' | 'closed';
export type ClinicTier = 'lite' | 'professional' | 'enterprise';
export type LocationStatus = 'active' | 'inactive' | 'maintenance';
export type ClinicRole = 'owner' | 'admin' | 'manager' | 'finance' | 'operations' | 'concierge' | 'auditor' | 'viewer';
export type RoleStatus = 'active' | 'suspended' | 'revoked';

export type ResourceType = 'bed' | 'operating_room' | 'consultation_room' | 'imaging' | 'laboratory' | 'equipment' | 'ambulance';
export type ResourceStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'out_of_service';

export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'no_show';

export type PayerType = 'insurance' | 'government' | 'corporate' | 'international' | 'self_pay';
export type ContractStatus = 'active' | 'pending' | 'suspended' | 'expired';

export type ClaimStatus = 
  | 'draft' 
  | 'submitted' 
  | 'in_review' 
  | 'approved' 
  | 'partially_paid' 
  | 'paid' 
  | 'denied' 
  | 'appealed' 
  | 'cancelled';

export type ClaimType = 'outpatient' | 'inpatient' | 'emergency' | 'surgical' | 'diagnostic' | 'preventive';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'check' | 'insurance_payment' | 'other';

export type InternationalPatientStatus = 'pending' | 'confirmed' | 'arrived' | 'in_treatment' | 'discharged' | 'cancelled';
export type DocumentType = 
  | 'passport' 
  | 'visa' 
  | 'medical_clearance' 
  | 'insurance_card' 
  | 'consent_form' 
  | 'prescription' 
  | 'medical_records' 
  | 'invoice' 
  | 'other';

// Entidades principales

export interface Clinic {
  id: string;
  name: string;
  legal_name: string;
  tax_id: string;
  country: string;
  timezone: string;
  status: ClinicStatus;
  tier: ClinicTier;
  logo_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

export interface ClinicLocation {
  id: string;
  clinic_id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  is_main: boolean;
  status: LocationStatus;
  opening_hours?: Record<string, { open: string; close: string }[]>;
  specialties?: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ClinicRoleAssignment {
  id: string;
  clinic_id: string;
  user_id: string;
  role: ClinicRole;
  location_id?: string;
  permissions?: Record<string, any>;
  status: RoleStatus;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicResource {
  id: string;
  location_id: string;
  type: ResourceType;
  name: string;
  code: string;
  department?: string;
  capacity: number;
  status: ResourceStatus;
  priority: number;
  cost_per_hour?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface StaffShift {
  id: string;
  location_id: string;
  staff_id: string;
  staff_role: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationalMetrics {
  id: string;
  location_id: string;
  metric_date: string;
  metric_hour?: number;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  average_wait_time_minutes?: number;
  occupancy_rate?: number;
  revenue_amount: number;
  patient_count: number;
  emergency_count: number;
  created_at: string;
  updated_at: string;
}

export interface PayerContract {
  id: string;
  clinic_id: string;
  payer_name: string;
  payer_type: PayerType;
  country: string;
  contract_number?: string;
  start_date: string;
  end_date?: string;
  currency: string;
  discount_rate: number;
  payment_terms_days: number;
  status: ContractStatus;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface RCMClaim {
  id: string;
  clinic_id: string;
  location_id: string;
  claim_number: string;
  patient_id: string;
  payer_contract_id?: string;
  claim_date: string;
  service_date: string;
  status: ClaimStatus;
  claim_type: ClaimType;
  total_amount: number;
  approved_amount?: number;
  paid_amount: number;
  currency: string;
  exchange_rate: number;
  denial_reason?: string;
  denial_code?: string;
  appeal_date?: string;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface RCMClaimItem {
  id: string;
  claim_id: string;
  line_number: number;
  service_code: string;
  service_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  approved_price?: number;
  denial_reason?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RCMPayment {
  id: string;
  claim_id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  payer_name?: string;
  reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface InternationalPatient {
  id: string;
  patient_id: string;
  clinic_id: string;
  origin_country: string;
  passport_number?: string;
  visa_type?: string;
  visa_expiry?: string;
  preferred_language: string;
  needs_translation: boolean;
  needs_accommodation: boolean;
  accommodation_details?: Record<string, any>;
  needs_transportation: boolean;
  transportation_details?: Record<string, any>;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_country?: string;
  travel_insurance_provider?: string;
  travel_insurance_policy?: string;
  medical_travel_agency?: string;
  referral_source?: string;
  estimated_arrival_date?: string;
  estimated_departure_date?: string;
  special_requirements?: string;
  status: InternationalPatientStatus;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface TravelDocument {
  id: string;
  international_patient_id: string;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  expiry_date?: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// DTOs y tipos agregados

export interface ClinicFinancialKPIs {
  clinic_id: string;
  clinic_name: string;
  month: string;
  total_claims: number;
  paid_claims: number;
  denied_claims: number;
  total_billed: number;
  total_approved: number;
  total_collected: number;
  avg_days_to_payment: number;
  denial_rate_pct: number;
  collection_rate_pct: number;
}

export interface ClinicOverviewStats {
  clinic_id: string;
  clinic_name: string;
  today_appointments: number;
  today_revenue: number;
  occupancy_rate: number;
  active_claims: number;
  pending_payments: number;
  international_patients: number;
  available_resources: number;
  alerts_count: number;
}

export interface ResourceUtilization {
  resource_id: string;
  resource_name: string;
  resource_type: ResourceType;
  total_hours: number;
  occupied_hours: number;
  utilization_rate: number;
  revenue_generated: number;
}

export interface ClaimSummary extends RCMClaim {
  payer_name?: string;
  patient_name?: string;
  items_count?: number;
  payments_count?: number;
}

export interface ClinicAlert {
  id: string;
  type: 'capacity' | 'financial' | 'compliance' | 'operational';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  location_id?: string;
  location_name?: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

// Filtros y parámetros de búsqueda

export interface ClinicFilters {
  clinic_ids?: string[];
  location_ids?: string[];
  date_from?: string;
  date_to?: string;
  status?: string[];
}

export interface ClaimFilters extends ClinicFilters {
  patient_id?: string;
  claim_status?: ClaimStatus[];
  claim_type?: ClaimType[];
  payer_contract_id?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface ResourceFilters extends ClinicFilters {
  resource_type?: ResourceType[];
  resource_status?: ResourceStatus[];
  department?: string;
}

// Tipos para formularios

export interface CreateClinicInput {
  name: string;
  legal_name: string;
  tax_id: string;
  country: string;
  timezone: string;
  tier: ClinicTier;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CreateLocationInput {
  clinic_id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  is_main?: boolean;
  specialties?: string[];
}

export interface CreateClaimInput {
  clinic_id: string;
  location_id: string;
  patient_id: string;
  payer_contract_id?: string;
  service_date: string;
  claim_type: ClaimType;
  items: {
    service_code: string;
    service_description: string;
    quantity: number;
    unit_price: number;
    provider_id?: string;
  }[];
  notes?: string;
}

export interface RegisterPaymentInput {
  claim_id: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  payer_name?: string;
  notes?: string;
}

export interface CreateInternationalPatientInput {
  patient_id: string;
  clinic_id: string;
  origin_country: string;
  passport_number?: string;
  preferred_language: string;
  needs_translation?: boolean;
  needs_accommodation?: boolean;
  needs_transportation?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  estimated_arrival_date?: string;
  estimated_departure_date?: string;
  special_requirements?: string;
}
