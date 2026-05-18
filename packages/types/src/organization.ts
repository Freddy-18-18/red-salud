/**
 * Tipos del SaaS multi-tenant de gestion clinica.
 *
 * Cada `Organization` es un tenant aislado: clinica especializada,
 * multi-especialidad o red hospitalaria. RLS por organization_id.
 *
 * Estos tipos NO reemplazan a los del archivo `clinic.ts` (legacy del
 * directorio publico de paciente/web). Son el nuevo modelo del SaaS.
 */

// ----------------------------------------------------------------------------
// Enums (alineados con el schema SQL)
// ----------------------------------------------------------------------------

export type OrganizationType =
  | 'specialty_clinic'
  | 'multi_specialty_clinic'
  | 'hospital_network'
  | 'medical_center'
  | 'diagnostic_center'
  | 'rehabilitation_center';

export type OrganizationStatus =
  | 'pending_setup'
  | 'active'
  | 'suspended'
  | 'archived';

export type OrganizationPlan =
  | 'trial'
  | 'starter'
  | 'professional'
  | 'enterprise'
  | 'custom';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'finance'
  | 'operations'
  | 'medical_lead'
  | 'doctor'
  | 'secretary'
  | 'nurse'
  | 'inventory'
  | 'viewer';

export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export type ModuleCategory = 'core' | 'operations' | 'specialty' | 'enterprise';

export type UiDensity = 'compact' | 'comfortable' | 'spacious';

// ----------------------------------------------------------------------------
// Branding
// ----------------------------------------------------------------------------

export interface OrganizationTerminology {
  patient: string;
  appointment: string;
  consultation: string;
  [extra: string]: string;
}

export interface OrganizationBranding {
  logo_url: string | null;
  icon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  ui_density: UiDensity;
  terminology: OrganizationTerminology;
}

// ----------------------------------------------------------------------------
// Organization (tenant raiz)
// ----------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  tax_id: string | null;
  type: OrganizationType;
  primary_specialty: string | null;
  specialties: string[];
  services: string[];
  email: string | null;
  phone: string | null;
  website: string | null;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  trial_ends_at: string | null;
  branding: OrganizationBranding;
  onboarding_completed: boolean;
  onboarding_step: number;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  country_code: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  type: OrganizationType;
  primary_specialty?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  legal_name?: string | null;
  tax_id?: string | null;
  primary_specialty?: string | null;
  specialties?: string[];
  services?: string[];
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  branding?: Partial<OrganizationBranding>;
  timezone?: string;
  default_locale?: string;
  default_currency?: string;
  custom_domain?: string | null;
}

// ----------------------------------------------------------------------------
// Locations (sedes)
// ----------------------------------------------------------------------------

export interface BusinessHoursWindow {
  open: string;  // "08:00"
  close: string; // "18:00"
}

export type WeekDay =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';

export type BusinessHours = Partial<Record<WeekDay, BusinessHoursWindow[]>>;

export interface OrganizationLocation {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  is_main: boolean;
  is_active: boolean;
  address_line: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  business_hours: BusinessHours;
  timezone: string | null;
  total_consultation_rooms: number;
  total_beds: number;
  has_emergency: boolean;
  has_hospitalization: boolean;
  has_surgery_rooms: boolean;
  has_lab: boolean;
  has_imaging: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationLocationInput {
  organization_id: string;
  name: string;
  code?: string;
  is_main?: boolean;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  business_hours?: BusinessHours;
  timezone?: string;
  total_consultation_rooms?: number;
  total_beds?: number;
  has_emergency?: boolean;
  has_hospitalization?: boolean;
  has_surgery_rooms?: boolean;
  has_lab?: boolean;
  has_imaging?: boolean;
}

export type UpdateOrganizationLocationInput = Partial<
  Omit<CreateOrganizationLocationInput, 'organization_id'>
> & {
  is_active?: boolean;
};

// ----------------------------------------------------------------------------
// Members (user en una organization)
// ----------------------------------------------------------------------------

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  location_id: string | null;
  permissions: Record<string, boolean | string | number>;
  is_active: boolean;
  invited_by: string | null;
  joined_at: string;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
  user_email: string | null;
  user_full_name: string | null;
  location_name: string | null;
}

export interface InviteMemberInput {
  organization_id: string;
  email: string;
  role: OrganizationRole;
  location_id?: string;
  message?: string;
}

// ----------------------------------------------------------------------------
// Invites
// ----------------------------------------------------------------------------

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  location_id: string | null;
  token: string;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  invited_by: string;
  message: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Modules
// ----------------------------------------------------------------------------

export interface ModuleCatalogEntry {
  key: string;
  name: string;
  description: string | null;
  category: ModuleCategory;
  is_core: boolean;
  min_plan: OrganizationPlan;
  icon: string | null;
  display_order: number;
}

export interface OrganizationModule {
  id: string;
  organization_id: string;
  module_key: string;
  is_enabled: boolean;
  enabled_at: string;
  enabled_by: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationModuleWithCatalog extends OrganizationModule {
  catalog: ModuleCatalogEntry;
}

// ----------------------------------------------------------------------------
// Vistas agregadas / dashboard
// ----------------------------------------------------------------------------

export interface OrganizationOverview {
  organization: Organization;
  locations: OrganizationLocation[];
  enabled_modules: ModuleCatalogEntry[];
  member_count: number;
  current_user_role: OrganizationRole;
}

export interface OrganizationKPIs {
  organization_id: string;
  total_locations: number;
  total_members: number;
  total_appointments_today: number;
  total_revenue_today: number;
  occupancy_rate: number | null;
  trial_days_remaining: number | null;
}

// ----------------------------------------------------------------------------
// Onboarding wizard
// ----------------------------------------------------------------------------

export interface OnboardingState {
  current_step: number;
  total_steps: number;
  organization_id: string | null;
  data: {
    type?: OrganizationType;
    name?: string;
    slug?: string;
    primary_specialty?: string;
    legal_name?: string;
    tax_id?: string;
    email?: string;
    phone?: string;
    first_location?: Partial<CreateOrganizationLocationInput>;
    branding?: Partial<OrganizationBranding>;
    invites?: Array<Pick<InviteMemberInput, 'email' | 'role'>>;
    selected_modules?: string[];
  };
}

export const ONBOARDING_STEPS = [
  'organization_type',
  'organization_basics',
  'first_location',
  'branding',
  'modules',
  'team',
  'review',
  'complete',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

// ----------------------------------------------------------------------------
// Perfiles preconfigurados de clinica (templates de onboarding)
// ----------------------------------------------------------------------------
//
// Cada perfil = bundle de modulos por defecto + terminologia + UI density.
// El usuario puede customizar todo despues, esto es un punto de partida sano.
// ----------------------------------------------------------------------------

export interface ClinicProfileTemplate {
  id: string;
  name: string;
  description: string;
  organization_type: OrganizationType;
  default_modules: string[];
  recommended_modules: string[];
  default_terminology: OrganizationTerminology;
  default_density: UiDensity;
  icon: string;
}

export const CLINIC_PROFILE_TEMPLATES: ClinicProfileTemplate[] = [
  {
    id: 'specialty-dental',
    name: 'Clinica Odontologica',
    description: 'Consultorios dentales con multiples odontologos. Especializada en tratamientos dentales.',
    organization_type: 'specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'billing'],
    recommended_modules: ['imaging', 'crm'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'comfortable',
    icon: 'tooth',
  },
  {
    id: 'specialty-ophthalmology',
    name: 'Clinica Oftalmologica',
    description: 'Centros oftalmologicos con cirugia ambulatoria, diagnostico y consulta.',
    organization_type: 'specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'billing', 'surgery'],
    recommended_modules: ['imaging', 'rcm'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'comfortable',
    icon: 'eye',
  },
  {
    id: 'specialty-aesthetic',
    name: 'Clinica de Estetica',
    description: 'Centros de medicina estetica con tratamientos, paquetes y fidelizacion.',
    organization_type: 'specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'billing', 'crm'],
    recommended_modules: ['inventory', 'metrics'],
    default_terminology: { patient: 'cliente', appointment: 'sesion', consultation: 'evaluacion' },
    default_density: 'comfortable',
    icon: 'sparkles',
  },
  {
    id: 'specialty-dermatology',
    name: 'Clinica Dermatologica',
    description: 'Consultorios dermatologicos con biopsias y procedimientos menores.',
    organization_type: 'specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'billing'],
    recommended_modules: ['imaging', 'lab', 'crm'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'comfortable',
    icon: 'shield',
  },
  {
    id: 'specialty-fertility',
    name: 'Clinica de Fertilidad',
    description: 'Centros de reproduccion asistida con seguimiento longitudinal.',
    organization_type: 'specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'billing', 'lab'],
    recommended_modules: ['surgery', 'imaging', 'rcm', 'international'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'comfortable',
    icon: 'heart',
  },
  {
    id: 'multi-specialty',
    name: 'Clinica Multi-Especialidad',
    description: 'Clinica mediana con varias especialidades, 1 a 3 sedes.',
    organization_type: 'multi_specialty_clinic',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'inventory', 'billing', 'metrics'],
    recommended_modules: ['lab', 'imaging', 'rcm', 'crm'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'comfortable',
    icon: 'building',
  },
  {
    id: 'hospital-network',
    name: 'Red Hospitalaria',
    description: 'Hospital o red multi-sucursal con hospitalizacion, urgencias y quirofano.',
    organization_type: 'hospital_network',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'inventory', 'billing', 'metrics', 'hospitalization', 'emergency', 'surgery'],
    recommended_modules: ['lab', 'imaging', 'rcm', 'multi_org', 'ai'],
    default_terminology: { patient: 'paciente', appointment: 'cita', consultation: 'consulta' },
    default_density: 'compact',
    icon: 'hospital',
  },
  {
    id: 'diagnostic-center',
    name: 'Centro de Diagnostico',
    description: 'Centros de imagenologia y laboratorio sin consulta clinica regular.',
    organization_type: 'diagnostic_center',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'billing', 'imaging', 'lab'],
    recommended_modules: ['rcm'],
    default_terminology: { patient: 'paciente', appointment: 'estudio', consultation: 'estudio' },
    default_density: 'compact',
    icon: 'scan',
  },
  {
    id: 'rehabilitation-center',
    name: 'Centro de Rehabilitacion',
    description: 'Kinesiologia, fisiatria y terapias con sesiones programadas.',
    organization_type: 'rehabilitation_center',
    default_modules: ['overview', 'locations', 'staff', 'settings', 'schedule', 'patients', 'resources', 'billing'],
    recommended_modules: ['crm', 'metrics'],
    default_terminology: { patient: 'paciente', appointment: 'sesion', consultation: 'evaluacion' },
    default_density: 'comfortable',
    icon: 'activity',
  },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  owner: 100,
  admin: 90,
  finance: 70,
  operations: 70,
  medical_lead: 80,
  doctor: 50,
  secretary: 40,
  nurse: 40,
  inventory: 30,
  viewer: 10,
};

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageMembers(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageLocations(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'operations';
}

export function canViewFinance(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'finance';
}

export const ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  finance: 'Finanzas',
  operations: 'Operaciones',
  medical_lead: 'Director Medico',
  doctor: 'Medico',
  secretary: 'Secretaria',
  nurse: 'Enfermeria',
  inventory: 'Inventario',
  viewer: 'Solo Lectura',
};

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  specialty_clinic: 'Clinica Especializada',
  multi_specialty_clinic: 'Clinica Multi-Especialidad',
  hospital_network: 'Red Hospitalaria',
  medical_center: 'Centro Medico',
  diagnostic_center: 'Centro de Diagnostico',
  rehabilitation_center: 'Centro de Rehabilitacion',
};
