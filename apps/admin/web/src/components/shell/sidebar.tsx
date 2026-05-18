import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  HeartPulse,
  Calendar,
  DollarSign,
  ShieldCheck,
  Flag,
  Megaphone,
  ScrollText,
  Settings,
  AlertTriangle,
  LifeBuoy,
} from 'lucide-react';
import type { Permission } from '@/lib/rbac';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  requires?: Permission;
};

const NAV: NavItem[] = [
  { href: '/dashboard',                label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/alerts',         label: 'Alertas',       icon: AlertTriangle, requires: 'alerts.view' },
  { href: '/dashboard/users',          label: 'Usuarios',      icon: Users,         requires: 'users.view' },
  { href: '/dashboard/doctors',        label: 'Médicos',       icon: Stethoscope,   requires: 'doctors.view' },
  { href: '/dashboard/patients',       label: 'Pacientes',     icon: HeartPulse,    requires: 'patients.view' },
  { href: '/dashboard/appointments',   label: 'Citas',         icon: Calendar,      requires: 'appointments.view' },
  { href: '/dashboard/finance',        label: 'Finanzas',      icon: DollarSign,    requires: 'finance.view' },
  { href: '/dashboard/support',        label: 'Soporte',       icon: LifeBuoy,      requires: 'support.view' },
  { href: '/dashboard/employees',      label: 'Empleados',     icon: ShieldCheck,   requires: 'employees.view' },
  { href: '/dashboard/feature-flags',  label: 'Feature flags', icon: Flag,          requires: 'feature_flags.view' },
  { href: '/dashboard/announcements',  label: 'Anuncios',      icon: Megaphone,     requires: 'announcements.view' },
  { href: '/dashboard/audit',          label: 'Auditoría',     icon: ScrollText,    requires: 'audit.view' },
  { href: '/dashboard/settings',       label: 'Configuración', icon: Settings,      requires: 'system.settings' },
];

export function Sidebar({ permissions }: { permissions: Set<Permission> }) {
  return (
    <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Red Salud</p>
        <p className="text-sm font-semibold text-zinc-100 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {NAV.map((item) => {
            if (item.requires && !permissions.has(item.requires)) return null;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        <p>Acceso interno · v0.1</p>
      </div>
    </aside>
  );
}
