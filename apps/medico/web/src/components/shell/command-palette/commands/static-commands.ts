import {
  Calendar,
  CalendarPlus,
  FileSignature,
  Home,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  Sun,
  User,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';

/**
 * @file static-commands.ts
 * @description Pure-data definitions for the command-palette static actions.
 *
 * "Static" here means: no Supabase round-trip, no per-doctor filtering. The
 * commands are well-known navigation targets, app-wide actions, and
 * preferences (theme). The palette renders them instantly while the dynamic
 * searches (patients / appointments / prescriptions) stream in.
 *
 * Each command exposes:
 *   - `id`            — stable React key
 *   - `label`         — visible text
 *   - `keywords`      — extra strings the cmdk fuzzy matcher considers
 *   - `group`         — which CommandGroup it lives in
 *   - `icon`          — the leading lucide icon
 *   - `shortcut`      — keyboard hint shown on the right (just display, the
 *                       hotkey binding is registered separately)
 *
 * The `perform` callback is wired up at render time inside the palette
 * because it depends on the router, theme setter, sede setter, etc.
 */

export type StaticCommandGroup =
  | 'actions'
  | 'navigation'
  | 'sedes'
  | 'theme'
  | 'account';

export interface StaticCommandDef {
  id: string;
  label: string;
  keywords: string[];
  group: StaticCommandGroup;
  icon: LucideIcon;
  shortcut?: string[];
}

// ---------------------------------------------------------------------------
// Quick actions — operations the doctor does many times a day
// ---------------------------------------------------------------------------

export const ACTION_COMMANDS: StaticCommandDef[] = [
  {
    id: 'act-new-appointment',
    label: 'Nueva cita',
    keywords: ['agendar', 'reservar', 'turno', 'crear cita', 'appointment'],
    group: 'actions',
    icon: CalendarPlus,
    shortcut: ['⌘', 'N'],
  },
  {
    id: 'act-new-consultation',
    label: 'Nueva consulta',
    keywords: ['consulta', 'atender', 'soap', 'evaluar', 'consultation'],
    group: 'actions',
    icon: Stethoscope,
    shortcut: ['⌘', '⇧', 'N'],
  },
  {
    id: 'act-new-prescription',
    label: 'Crear receta',
    keywords: ['receta', 'recetar', 'medicamento', 'prescribir', 'prescription'],
    group: 'actions',
    icon: Pill,
    shortcut: ['⌘', 'R'],
  },
  {
    id: 'act-telemedicine',
    label: 'Iniciar telemedicina',
    keywords: ['video', 'videoconsulta', 'remota', 'online', 'virtual'],
    group: 'actions',
    icon: Video,
  },
];

// ---------------------------------------------------------------------------
// Navigation — jump to any dashboard route
// ---------------------------------------------------------------------------

export const NAVIGATION_COMMANDS: (StaticCommandDef & { href: string })[] = [
  {
    id: 'nav-home',
    label: 'Ir a Inicio',
    keywords: ['dashboard', 'resumen', 'home', 'inicio'],
    group: 'navigation',
    icon: Home,
    shortcut: ['G', 'A'],
    href: '/dashboard',
  },
  {
    id: 'nav-agenda',
    label: 'Ir a Agenda',
    keywords: ['agenda', 'citas', 'calendario', 'turnos', 'schedule'],
    group: 'navigation',
    icon: Calendar,
    shortcut: ['G', 'G'],
    href: '/dashboard/agenda',
  },
  {
    id: 'nav-patients',
    label: 'Ir a Pacientes',
    keywords: ['pacientes', 'patients', 'lista'],
    group: 'navigation',
    icon: Users,
    shortcut: ['G', 'P'],
    href: '/dashboard/pacientes',
  },
  {
    id: 'nav-consultation',
    label: 'Ir a Consulta',
    keywords: ['consulta', 'soap', 'examinar'],
    group: 'navigation',
    icon: Stethoscope,
    shortcut: ['G', 'C'],
    href: '/dashboard/consulta',
  },
  {
    id: 'nav-prescriptions',
    label: 'Ir a Recetas',
    keywords: ['recetas', 'prescripciones', 'medicamentos', 'rx'],
    group: 'navigation',
    icon: Pill,
    shortcut: ['G', 'R'],
    href: '/dashboard/recetas',
  },
  {
    id: 'nav-messages',
    label: 'Ir a Mensajes',
    keywords: ['mensajes', 'chat', 'inbox'],
    group: 'navigation',
    icon: MessageSquare,
    shortcut: ['G', 'M'],
    href: '/dashboard/mensajes',
  },
  {
    id: 'nav-verification',
    label: 'Ir a Verificación SACS',
    keywords: ['sacs', 'verificacion', 'cédula', 'cedula'],
    group: 'navigation',
    icon: ShieldCheck,
    href: '/dashboard/verificacion',
  },
  {
    id: 'nav-sedes',
    label: 'Ir a Sedes',
    keywords: ['sedes', 'consultorios', 'ubicaciones', 'practica'],
    group: 'navigation',
    icon: Settings,
    href: '/dashboard/sedes',
  },
  {
    id: 'nav-profile',
    label: 'Ir a Mi perfil',
    keywords: ['perfil', 'profile', 'cuenta'],
    group: 'account',
    icon: User,
    href: '/dashboard/configuracion/perfil',
  },
  {
    id: 'nav-settings',
    label: 'Ir a Configuración',
    keywords: ['configuracion', 'ajustes', 'settings', 'preferencias'],
    group: 'account',
    icon: Settings,
    href: '/dashboard/configuracion',
  },
];

// ---------------------------------------------------------------------------
// Theme — switch between light / dark / auto
// ---------------------------------------------------------------------------

export const THEME_COMMANDS: (StaticCommandDef & { theme: 'light' | 'dark' | 'system' })[] = [
  {
    id: 'theme-light',
    label: 'Cambiar a modo claro',
    keywords: ['tema', 'claro', 'light', 'dia', 'día'],
    group: 'theme',
    icon: Sun,
    theme: 'light',
  },
  {
    id: 'theme-dark',
    label: 'Cambiar a modo oscuro',
    keywords: ['tema', 'oscuro', 'dark', 'noche'],
    group: 'theme',
    icon: Moon,
    theme: 'dark',
  },
  {
    id: 'theme-system',
    label: 'Tema automático (sistema)',
    keywords: ['tema', 'auto', 'system', 'sistema'],
    group: 'theme',
    icon: Monitor,
    theme: 'system',
  },
];

// ---------------------------------------------------------------------------
// Account / session
// ---------------------------------------------------------------------------

export const ACCOUNT_COMMANDS: StaticCommandDef[] = [
  {
    id: 'account-logout',
    label: 'Cerrar sesión',
    keywords: ['logout', 'salir', 'cerrar', 'sesion', 'sign out'],
    group: 'account',
    icon: LogOut,
  },
];

export const GROUP_LABELS: Record<StaticCommandGroup, string> = {
  actions: 'Acciones rápidas',
  navigation: 'Navegación',
  sedes: 'Sedes',
  theme: 'Tema',
  account: 'Cuenta',
};
