'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMyOrganizations } from '@/lib/hooks/use-organization';

export function OrgSwitcher({ currentOrgId }: { currentOrgId: string }) {
  const { data: orgs } = useMyOrganizations();
  const [open, setOpen] = useState(false);

  const others = orgs?.filter((o) => o.id !== currentOrgId && o.onboarding_completed) ?? [];

  if (others.length === 0) {
    return (
      <Link
        href="/onboarding"
        className="block w-full text-center px-3 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
      >
        + Nueva organizacion
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
      >
        <span>Cambiar organizacion</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {others.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/${o.slug}`}
              className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              {o.name}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="block px-3 py-2 text-sm text-[rgb(var(--brand-primary))] hover:bg-slate-100 border-t border-slate-200"
          >
            + Nueva organizacion
          </Link>
        </div>
      )}
    </div>
  );
}
