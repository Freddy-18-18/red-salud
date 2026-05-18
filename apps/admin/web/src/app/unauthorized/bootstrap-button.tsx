'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Crown } from 'lucide-react';
import { bootstrapFirstSuperAdmin } from '@/lib/bootstrap/actions';

export function BootstrapButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onClick() {
    startTransition(async () => {
      const res = await bootstrapFirstSuperAdmin();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('¡Listo! Sos super admin. Redirigiendo…');
      setDone(true);
      setTimeout(() => {
        router.replace('/dashboard');
        router.refresh();
      }, 800);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending || done}
      className="inline-flex items-center gap-2 rounded-md bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-500/30 disabled:opacity-60 transition"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Crown className="h-4 w-4" aria-hidden />
      )}
      Hacerme super admin
    </button>
  );
}
