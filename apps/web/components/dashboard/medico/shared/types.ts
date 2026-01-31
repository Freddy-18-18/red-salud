export type MedicoHeaderVariant =
  | "default"
  | "citas"
  | "consulta"
  | "pacientes"
  | "configuracion"
  | "estadisticas"
  | "laboratorio"
  | "recetas"
  | "telemedicina";

export interface MedicoPageHeaderProps {
  variant: MedicoHeaderVariant;
  profile?: {
    nombre_completo?: string;
    specialty?: { name?: string };
    sacs_especialidad?: string;
    is_verified?: boolean;
    sacs_verified?: boolean;
  };
  currentOffice?: { id: string; nombre: string } | null;
  allOffices?: { id: string; nombre: string }[];
  onOfficeChange?: (officeId: string) => void;
  mode?: "simple" | "pro";
  onModeChange?: (mode: "simple" | "pro") => void;
  onStartTour?: () => void;
  unreadNotifications?: number;

  // Variantes específicas
  isLive?: boolean;
  showSessionTimer?: boolean;
  patientCount?: number;
  onRegisterPatient?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  dateRange?: { start: Date; end: Date };
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  showOfficeFilter?: boolean;
  subtitle?: string;
  rightContent?: React.ReactNode;
}
