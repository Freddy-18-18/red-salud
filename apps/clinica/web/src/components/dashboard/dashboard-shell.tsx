'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOrganizationContext } from '@/lib/providers/organization-provider';
import { OrgSwitcher } from './org-switcher';
import { TrialBanner } from './trial-banner';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { organization, enabledModules, role, isOwner } = useOrganizationContext();
  const pathname = usePathname();
  const baseUrl = `/dashboard/${organization.slug}`;

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: 'var(--brand-font)' }}>
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: organization.branding.primary_color }}
            >
              {organization.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 text-sm truncate">{organization.name}</h2>
              <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {enabledModules.map((m) => {
            const href = m.key === 'overview' ? baseUrl : `${baseUrl}/${m.key}`;
            const isActive =
              m.key === 'overview' ? pathname === baseUrl : pathname?.startsWith(href);
            return (
              <Link
                key={m.key}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ModuleIcon name={m.icon ?? ''} />
                <span>{m.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <OrgSwitcher currentOrgId={organization.id} />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <TrialBanner organization={organization} canManage={isOwner} />
        <div className="p-6 md:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function ModuleIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    'map-pin': '📍',
    users: '👥',
    settings: '⚙️',
    calendar: '📅',
    user: '👤',
    box: '📦',
    package: '📦',
    'file-text': '📄',
    'bar-chart': '📊',
    bed: '🛏️',
    siren: '🚨',
    scissors: '✂️',
    'flask-conical': '🧪',
    scan: '🔬',
    video: '📹',
    'shield-check': '🛡️',
    plane: '✈️',
    megaphone: '📣',
    sparkles: '✨',
    network: '🌐',
  };
  return <span className="text-lg w-5 text-center">{icons[name] ?? '•'}</span>;
}
