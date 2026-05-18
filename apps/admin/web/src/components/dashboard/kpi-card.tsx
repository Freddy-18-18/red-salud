import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
};

export function KpiCard({ icon: Icon, label, value, hint }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        <Icon className="h-4 w-4 text-zinc-500" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
