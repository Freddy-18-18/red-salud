// Tipos compartidos para el perfil de usuario

export type TabType =
  | "profile"
  | "medical"
  | "documents"
  | "security"
  | "preferences"
  | "privacy"
  | "activity"
  | "billing";

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userId?: string;
}

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string;
  fechaNacimiento: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  tipoSangre: string;
  alergias: string;
  condicionesCronicas: string;
  medicamentosActuales: string;
  cirugiasPrevias: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  relacionEmergencia: string;
  // Campos CNE
  cneEstado?: string;
  cneMunicipio?: string;
  cneParroquia?: string;
  cneCentroElectoral?: string;
  rif?: string;
  nacionalidad?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  // Verificación
  cedulaVerificada?: boolean;
  photoVerified?: boolean;
  diditRequestId?: string;
  photoUploadDeadline?: string | null;
  cedulaVerifiedAt?: string | null;
  cedulaPhotoVerifiedAt?: string | null;
  // Campos médicos expandidos
  sexoBiologico?: string;
  peso?: string;
  altura?: string;
  perimetroCintura?: string;
  presionSistolica?: string;
  presionDiastolica?: string;
  frecuenciaCardiaca?: string;
  // Campos específicos para mujeres
  embarazada?: boolean;
  lactancia?: boolean;
  fechaUltimaMenstruacion?: string;
  usaAnticonceptivos?: boolean;
  tipoAnticonceptivo?: string;
  embarazosPrevios?: string;
  // Alergias expandidas
  alergiasAlimentarias?: string;
  otrasAlergias?: string;
  // Condiciones
  condicionesMentales?: string;
  discapacidades?: string;
  // Medicamentos y tratamientos
  suplementos?: string;
  tratamientosActuales?: string;
  // Hábitos
  fuma?: string;
  cigarrillosPorDia?: string;
  exFumadorDesde?: string;
  consumeAlcohol?: string;
  frecuenciaAlcohol?: string;
  actividadFisica?: string;
  horasEjercicioSemanal?: string;
  horasSuenoPromedio?: string;
  // Otros
  dispositivosMedicos?: string;
  donanteOrganos?: string;
  donanteSangre?: string;
  observacionesAdicionales?: string;
}

export interface TabComponentProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: (dataOverride?: FormData) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export interface DocumentStatus {
  id: number;
  type: string;
  name: string;
  status: "verified" | "pending" | "rejected" | "not_uploaded";
  uploadedAt: string | null;
  file: File | null;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  status: "success" | "failed";
}

export interface Session {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
  invoice: string;
}

// Tipos específicos para médicos
export interface DoctorProfileData {
  nombre_completo: string;
  email: string;
  telefono: string;
  cedula: string;
  mpps: string;
  especialidad: string;
  universidad?: string;
  anos_experiencia?: number;
  bio?: string;
  subespecialidades?: string;
  certificaciones?: string;
  idiomas?: string;
}
