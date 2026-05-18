'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { ADMIN_ROLE_LABELS, type AdminRoleType } from '@/lib/rbac/types';

export function Topbar({ email, roles }: { email: string; roles: AdminRoleType[] }) {
  const router = useRouter();

  async function onLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace('/auth/login');
    router.refresh();
  }

  return (
    <header className="h-14 shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{email}</span>
        <div className="flex gap-1">
          {roles.map((r) => (
            <span
              key={r}
              className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-300"
            >
              {ADMIN_ROLE_LABELS[r]}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onLogout}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Salir
      </button>
    </header>
  );
}
