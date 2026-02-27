/**
 * @file use-paciente-config-nav.ts
 * @description Hook que devuelve los items de navegación de configuración del paciente
 * solo cuando se está en las páginas de configuración. Retorna null en otras páginas.
 * @module Dashboard/Paciente
 */

import { useRouter, usePathname } from "next/navigation";
import {
  UserCog,
  Stethoscope,
  Bell,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface PacienteConfigNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}

const CONFIG_ITEMS: Omit<PacienteConfigNavItem, "isActive">[] = [
  { href: "/dashboard/paciente/configuracion/perfil",         label: "Perfil",         icon: UserCog },
  { href: "/dashboard/paciente/configuracion/medico",         label: "Médico",         icon: Stethoscope },
  { href: "/dashboard/paciente/configuracion/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/dashboard/paciente/configuracion/privacidad",     label: "Privacidad",     icon: Shield },
  { href: "/dashboard/paciente/configuracion/preferencias",   label: "Preferencias",   icon: Settings },
];

export interface PacienteConfigNav {
  items: PacienteConfigNavItem[];
  onNavigate: (href: string) => void;
}

/**
 * Retorna la configuración de tabs solo cuando el usuario está en
 * `/dashboard/paciente/configuracion/**`. En otras rutas retorna null.
 */
export function usePacienteConfigNav(): PacienteConfigNav | null {
  const router = useRouter();
  const pathname = usePathname();

  const isConfigPage = pathname?.startsWith("/dashboard/paciente/configuracion");
  if (!isConfigPage) return null;

  return {
    items: CONFIG_ITEMS.map((item) => ({
      ...item,
      isActive: pathname === item.href || pathname?.startsWith(item.href + "/"),
    })),
    onNavigate: (href: string) => router.push(href),
  };
}
